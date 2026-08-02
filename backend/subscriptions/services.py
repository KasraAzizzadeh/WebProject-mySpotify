from datetime import timedelta
import json
from decimal import Decimal
from typing import Iterable
from urllib import error, request

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils import timezone

from .models import SubscriptionPlan, SubscriptionTransaction


DEFAULT_PLANS = {
    SubscriptionPlan.PlanType.BASIC: {
        "price": Decimal("0.00"),
        "daily_stream_limit": 60,
        "playlist_limit": 6,
        "profile_picture_upload": False,
        "song_download": False,
        "early_access": False,
        "stats_info": False,
    },
    SubscriptionPlan.PlanType.SILVER: {
        "price": Decimal("19.99"),
        "daily_stream_limit": None,
        "playlist_limit": 100,
        "profile_picture_upload": True,
        "song_download": True,
        "early_access": False,
        "stats_info": False,
    },
    SubscriptionPlan.PlanType.GOLD: {
        "price": Decimal("29.99"),
        "daily_stream_limit": None,
        "playlist_limit": None,
        "profile_picture_upload": True,
        "song_download": True,
        "early_access": True,
        "stats_info": True,
    },
}


def update_subscription_prices(**prices) -> Iterable[SubscriptionPlan]:
    plan_names = {
        "silver_price": SubscriptionPlan.PlanType.SILVER,
        "gold_price": SubscriptionPlan.PlanType.GOLD,
    }
    updated_plans = []

    for field_name, value in prices.items():
        plan_name = plan_names.get(field_name)
        if not plan_name:
            continue

        plan, _ = SubscriptionPlan.objects.get_or_create(
            name=plan_name,
            defaults={
                **DEFAULT_PLANS[plan_name],
                "price": value,
            },
        )
        if plan.price != value:
            plan.price = value
            plan.save(update_fields=["price"])
        updated_plans.append(plan)

    return updated_plans


def get_all_subscription_plans() -> list[SubscriptionPlan]:
    plans = []
    for plan_name, defaults in DEFAULT_PLANS.items():
        plan, _ = SubscriptionPlan.objects.get_or_create(
            name=plan_name,
            defaults={
                "price": defaults["price"],
                **{
                    key: value
                    for key, value in defaults.items()
                    if key != "price"
                },
            },
        )
        plans.append(plan)
    return plans


class ZarinpalServiceError(Exception):
    pass


def _build_zarinpal_url(endpoint: str) -> str:
    sandbox_prefix = "https://sandbox.zarinpal.com/pg/v4/payment"
    production_prefix = "https://www.zarinpal.com/pg/v4/payment"
    base_url = sandbox_prefix if getattr(settings, "ZARINPAL_SANDBOX", True) else production_prefix
    return f"{base_url}/{endpoint}"


def _send_zarinpal_request(endpoint: str, payload: dict) -> dict:
    merchant_id = getattr(settings, "ZARINPAL_MERCHANT_ID", None)
    if not merchant_id:
        raise ImproperlyConfigured("ZARINPAL_MERCHANT_ID must be configured.")

    url = _build_zarinpal_url(endpoint)
    request_payload = json.dumps(payload).encode("utf-8")
    request_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    request_obj = request.Request(url, data=request_payload, headers=request_headers)

    try:
        with request.urlopen(request_obj, timeout=30) as response:
            response_text = response.read().decode("utf-8")
    except error.HTTPError as exc:
        response_text = exc.read().decode("utf-8")
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            raise ZarinpalServiceError(
                f"Zarinpal returned HTTP error {exc.code} and non-JSON body"
            ) from exc
    except error.URLError as exc:
        raise ZarinpalServiceError("Unable to connect to Zarinpal.") from exc

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise ZarinpalServiceError("Invalid JSON returned by Zarinpal.") from exc


def _to_zarinpal_amount(price: Decimal) -> int:
    amount_rials = int(price * Decimal("1000"))
    return amount_rials if amount_rials > 0 else 1000


def create_subscription_checkout(user, plan_name: str) -> tuple[SubscriptionTransaction, str]:
    if plan_name not in {
        SubscriptionPlan.PlanType.SILVER,
        SubscriptionPlan.PlanType.GOLD,
    }:
        raise ValueError("Only silver and gold plans can be purchased.")

    callback_url = getattr(settings, "ZARINPAL_CALLBACK_URL", None)
    if not callback_url:
        raise ImproperlyConfigured("ZARINPAL_CALLBACK_URL must be configured.")

    plan = SubscriptionPlan.objects.get(name=plan_name)
    amount_rials = _to_zarinpal_amount(plan.price)

    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_rials,
        "callback_url": callback_url,
        "description": f"Subscribe to {plan.name} plan for user {user.username}",
    }
    response = _send_zarinpal_request("request.json", payload)

    data = response.get("data") or {}
    authority = data.get("authority") or response.get("Authority")
    code = data.get("code") if data else response.get("Status")
    if code != 100 or not authority:
        errors = response.get("errors")
        raise ZarinpalServiceError(
            f"Zarinpal checkout failed with code {code}. errors={errors}"
        )

    transaction = SubscriptionTransaction.objects.create(
        user=user,
        subscription_plan=plan,
        amount=plan.price,
        authority=authority,
        status=SubscriptionTransaction.Status.PENDING,
    )

    gateway_base = "https://sandbox.zarinpal.com/pg/StartPay" if getattr(settings, "ZARINPAL_SANDBOX", True) else "https://www.zarinpal.com/pg/StartPay"
    payment_url = f"{gateway_base}/{authority}"
    return transaction, payment_url


def verify_subscription_payment(authority: str, status: str) -> SubscriptionTransaction:
    transaction = SubscriptionTransaction.objects.filter(authority=authority).first()
    if not transaction:
        raise SubscriptionTransaction.DoesNotExist("Transaction not found.")

    if transaction.status != SubscriptionTransaction.Status.PENDING:
        return transaction

    if status != "OK":
        transaction.status = SubscriptionTransaction.Status.FAILED
        transaction.save(update_fields=["status"])
        return transaction

    amount_rials = _to_zarinpal_amount(transaction.amount)
    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_rials,
        "authority": authority,
    }
    response = _send_zarinpal_request("verify.json", payload)
    data = response.get("data") or {}
    code = data.get("code") if data else response.get("Status")
    ref_id = data.get("ref_id") or response.get("RefID")

    if code in (100, 101):
        original_status = transaction.status
        transaction.status = SubscriptionTransaction.Status.SUCCESS
        transaction.reference_id = str(ref_id) if ref_id else None
        transaction.save(update_fields=["status", "reference_id"])
        if original_status != SubscriptionTransaction.Status.SUCCESS:
            _apply_subscription(transaction.user, transaction.subscription_plan)
        return transaction

    transaction.status = SubscriptionTransaction.Status.FAILED
    transaction.reference_id = str(ref_id) if ref_id else None
    transaction.save(update_fields=["status", "reference_id"])
    return transaction


def _apply_subscription(user, plan: SubscriptionPlan) -> None:
    now = timezone.now()
    if user.subscription_valid_until and user.subscription_valid_until > now:
        valid_until = user.subscription_valid_until + timedelta(days=30)
    else:
        valid_until = now + timedelta(days=30)

    user.subscription_plan = plan
    user.subscription_valid_until = valid_until
    user.save(update_fields=["subscription_plan", "subscription_valid_until"])
