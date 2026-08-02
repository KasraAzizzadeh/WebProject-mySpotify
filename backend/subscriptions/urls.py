from django.urls import path

from .views import (
    SubscriptionCheckoutView,
    SubscriptionPlanView,
    SubscriptionVerifyView,
)

urlpatterns = [
    path("", SubscriptionPlanView.as_view(), name="subscription-plan-list"),
    path("checkout/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("verify/", SubscriptionVerifyView.as_view(), name="subscription-verify"),
]
