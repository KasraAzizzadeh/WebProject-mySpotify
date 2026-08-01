from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from subscriptions.models import SubscriptionPlan


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
