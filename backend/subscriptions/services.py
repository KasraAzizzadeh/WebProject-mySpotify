from decimal import Decimal
from typing import Iterable

from .models import SubscriptionPlan


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
