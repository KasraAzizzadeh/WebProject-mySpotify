from django.urls import path

from .views import SubscriptionPlanView

urlpatterns = [
    path("", SubscriptionPlanView.as_view(), name="subscription-plan-list"),
]
