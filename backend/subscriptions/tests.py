from decimal import Decimal

from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from subscriptions.models import SubscriptionPlan, SubscriptionTransaction
from subscriptions.services import ZarinpalServiceError


class SubscriptionPlanApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.basic_plan = SubscriptionPlan.objects.create(
            name=SubscriptionPlan.PlanType.BASIC,
            price=Decimal("0.00"),
            daily_stream_limit=60,
            playlist_limit=6,
            profile_picture_upload=False,
            song_download=False,
            early_access=False,
            stats_info=False,
        )
        self.silver_plan = SubscriptionPlan.objects.create(
            name=SubscriptionPlan.PlanType.SILVER,
            price=Decimal("9.99"),
            daily_stream_limit=None,
            playlist_limit=100,
            profile_picture_upload=True,
            song_download=True,
            early_access=False,
            stats_info=False,
        )
        self.gold_plan = SubscriptionPlan.objects.create(
            name=SubscriptionPlan.PlanType.GOLD,
            price=Decimal("19.99"),
            daily_stream_limit=None,
            playlist_limit=None,
            profile_picture_upload=True,
            song_download=True,
            early_access=True,
            stats_info=True,
        )
        self.user = User.objects.create_user(
            username="regular_user",
            email="user@example.com",
            password="Password123!",
        )
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@example.com",
            password="Password123!",
            role=User.Roles.ADMIN,
        )

    def test_get_subscriptions_returns_all_plans(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/subscriptions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        plan_names = {plan["name"] for plan in response.data}
        self.assertSetEqual(
            plan_names,
            {
                SubscriptionPlan.PlanType.BASIC,
                SubscriptionPlan.PlanType.SILVER,
                SubscriptionPlan.PlanType.GOLD,
            },
        )

        basic = next(plan for plan in response.data if plan["name"] == SubscriptionPlan.PlanType.BASIC)
        self.assertEqual(basic["daily_stream_limit"], 60)
        self.assertEqual(basic["playlist_limit"], 6)
        self.assertFalse(basic["profile_picture_upload"])
        self.assertFalse(basic["song_download"])
        self.assertFalse(basic["early_access"])
        self.assertFalse(basic["stats_info"])

    def test_patch_subscription_prices_is_admin_only(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            "/subscriptions/",
            {"silver_price": "7.50", "gold_price": "15.50"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            "/subscriptions/",
            {"silver_price": "7.50", "gold_price": "15.50"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.silver_plan.refresh_from_db()
        self.gold_plan.refresh_from_db()
        self.assertEqual(self.silver_plan.price, Decimal("7.50"))
        self.assertEqual(self.gold_plan.price, Decimal("15.50"))

        returned_names = {plan["name"] for plan in response.data}
        self.assertSetEqual(returned_names, {SubscriptionPlan.PlanType.SILVER, SubscriptionPlan.PlanType.GOLD})

    def test_get_subscriptions_returns_all_plans_if_missing(self):
        self.silver_plan.delete()
        self.gold_plan.delete()

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/subscriptions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        plan_names = {plan["name"] for plan in response.data}
        self.assertSetEqual(
            plan_names,
            {
                SubscriptionPlan.PlanType.BASIC,
                SubscriptionPlan.PlanType.SILVER,
                SubscriptionPlan.PlanType.GOLD,
            },
        )

        silver = next(plan for plan in response.data if plan["name"] == SubscriptionPlan.PlanType.SILVER)
        gold = next(plan for plan in response.data if plan["name"] == SubscriptionPlan.PlanType.GOLD)

        self.assertIsNotNone(silver["id"])
        self.assertIsNotNone(gold["id"])
        self.assertEqual(silver["daily_stream_limit"], None)
        self.assertEqual(silver["playlist_limit"], 100)
        self.assertTrue(silver["profile_picture_upload"])
        self.assertTrue(silver["song_download"])
        self.assertFalse(silver["early_access"])
        self.assertFalse(silver["stats_info"])
        self.assertEqual(silver["price"], "19.99")
        self.assertEqual(gold["price"], "29.99")

    def test_patch_subscription_price_must_include_one_plan(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            "/subscriptions/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        ZARINPAL_MERCHANT_ID="test-merchant-id",
        ZARINPAL_CALLBACK_URL="http://localhost:8000/subscriptions/verify/",
        ZARINPAL_SANDBOX=True,
    )
    @patch("subscriptions.services._send_zarinpal_request")
    def test_checkout_creates_pending_transaction(self, mock_send_request):
        mock_send_request.return_value = {
            "data": {
                "authority": "TESTAUTH123",
                "code": 100,
                "fee": 1000,
                "fee_type": "Merchant",
                "message": "Success",
            },
            "errors": [],
        }

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/subscriptions/checkout/",
            {"plan": SubscriptionPlan.PlanType.SILVER},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["authority"], "TESTAUTH123")
        self.assertEqual(response.data["status"], SubscriptionTransaction.Status.PENDING)
 
        self.assertEqual(mock_send_request.call_args[0][0], "request.json")
        self.assertEqual(mock_send_request.call_args[0][1]["amount"], 9990)
 
        transaction = SubscriptionTransaction.objects.get(authority="TESTAUTH123")
        self.assertEqual(transaction.status, SubscriptionTransaction.Status.PENDING)
        self.assertEqual(transaction.subscription_plan, self.silver_plan)
        self.assertEqual(transaction.user, self.user)

    @override_settings(
        ZARINPAL_MERCHANT_ID="test-merchant-id",
        ZARINPAL_CALLBACK_URL="http://localhost:8000/subscriptions/verify/",
        ZARINPAL_SANDBOX=True,
    )
    @patch("subscriptions.services._send_zarinpal_request")
    def test_verify_payment_success_updates_subscription(self, mock_send_request):
        mock_send_request.return_value = {
            "data": {
                "code": 100,
                "ref_id": "REF123",
                "message": "Success",
            },
            "errors": [],
        }
 
        transaction = SubscriptionTransaction.objects.create(
            user=self.user,
            subscription_plan=self.gold_plan,
            amount=self.gold_plan.price,
            authority="TESTAUTH456",
            status=SubscriptionTransaction.Status.PENDING,
        )
 
        response = self.client.get(
            "/subscriptions/verify/?Authority=TESTAUTH456&Status=OK"
        )
 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["transaction_status"], SubscriptionTransaction.Status.SUCCESS)
        self.assertEqual(response.data["reference_id"], "REF123")
 
        transaction.refresh_from_db()
        self.user.refresh_from_db()
        self.assertEqual(transaction.status, SubscriptionTransaction.Status.SUCCESS)
        self.assertEqual(self.user.subscription_plan, self.gold_plan)
        self.assertIsNotNone(self.user.subscription_valid_until)

    @override_settings(
        ZARINPAL_MERCHANT_ID="test-merchant-id",
        ZARINPAL_CALLBACK_URL="http://localhost:8000/subscriptions/verify/",
        ZARINPAL_SANDBOX=True,
    )
    @patch("subscriptions.services._send_zarinpal_request")
    def test_verify_payment_redirects_to_return_url(self, mock_send_request):
        mock_send_request.return_value = {
            "data": {
                "code": 100,
                "ref_id": "REF123",
                "message": "Success",
            },
            "errors": [],
        }
 
        transaction = SubscriptionTransaction.objects.create(
            user=self.user,
            subscription_plan=self.gold_plan,
            amount=self.gold_plan.price,
            authority="TESTAUTH456",
            status=SubscriptionTransaction.Status.PENDING,
        )
 
        response = self.client.get(
            "/subscriptions/verify/?Authority=TESTAUTH456&Status=OK&return_url=http://example.com/return",
            follow=False,
        )
 
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn("http://example.com/return?", response["Location"])
        self.assertIn("status=success", response["Location"])
        self.assertIn("authority=TESTAUTH456", response["Location"])
        self.assertIn("transaction_status=SUCCESS", response["Location"])
        self.assertIn("reference_id=REF123", response["Location"])
 
    @override_settings(
        ZARINPAL_MERCHANT_ID="test-merchant-id",
        ZARINPAL_CALLBACK_URL="http://localhost:8000/subscriptions/verify/",
        ZARINPAL_SANDBOX=True,
    )
    @patch("subscriptions.services._send_zarinpal_request")
    def test_verify_payment_failure_marks_transaction_failed(self, mock_send_request):
        mock_send_request.return_value = {
            "data": {
                "code": 110,
                "message": "Amount mismatch",
            },
            "errors": [],
        }

        transaction = SubscriptionTransaction.objects.create(
            user=self.user,
            subscription_plan=self.gold_plan,
            amount=self.gold_plan.price,
            authority="TESTAUTH789",
            status=SubscriptionTransaction.Status.PENDING,
        )

        response = self.client.get(
            "/subscriptions/verify/?Authority=TESTAUTH789&Status=OK"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["transaction_status"], SubscriptionTransaction.Status.FAILED)

        transaction.refresh_from_db()
        self.assertEqual(transaction.status, SubscriptionTransaction.Status.FAILED)
        self.assertIsNone(transaction.reference_id)

    @override_settings(
        ZARINPAL_MERCHANT_ID="test-merchant-id",
        ZARINPAL_CALLBACK_URL="http://localhost:8000/subscriptions/verify/",
        ZARINPAL_SANDBOX=True,
    )
    @patch("subscriptions.services._send_zarinpal_request")
    def test_verify_payment_code_101_is_treated_as_success(self, mock_send_request):
        mock_send_request.return_value = {
            "data": {
                "code": 101,
                "ref_id": "REF101",
                "message": "Already verified",
            },
            "errors": [],
        }

        transaction = SubscriptionTransaction.objects.create(
            user=self.user,
            subscription_plan=self.gold_plan,
            amount=self.gold_plan.price,
            authority="TESTAUTH999",
            status=SubscriptionTransaction.Status.PENDING,
        )

        response = self.client.get(
            "/subscriptions/verify/?Authority=TESTAUTH999&Status=OK"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["transaction_status"], SubscriptionTransaction.Status.SUCCESS)
        self.assertEqual(response.data["reference_id"], "REF101")

        transaction.refresh_from_db()
        self.assertEqual(transaction.status, SubscriptionTransaction.Status.SUCCESS)
        self.assertEqual(transaction.reference_id, "REF101")
