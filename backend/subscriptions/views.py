from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import OpenApiExample, extend_schema, OpenApiResponse

from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionPricesUpdateSerializer,
)
from .permissions import IsAdminRole
from .services import get_all_subscription_plans, update_subscription_prices


@extend_schema(
    summary="List subscription plans",
    description=(
        "Returns the available subscription plans together with their pricing "
        "and enabled features. This endpoint is used by settings and admin pricing pages."
    ),
    responses={
        status.HTTP_200_OK: SubscriptionPlanSerializer(many=True),
    },
)
class SubscriptionPlanView(APIView):
    def get_permissions(self):
        if self.request.method == "PATCH":
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        plans = get_all_subscription_plans()
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Update subscription plan prices",
        description=(
            "Allows administrators to update the prices of subscription plans. "
            "The request may include silver_price, gold_price, or both."
        ),
        request=SubscriptionPricesUpdateSerializer,
        responses={
            status.HTTP_200_OK: SubscriptionPlanSerializer(many=True),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description="Only admin users are authorized to update subscription prices."
            ),
        },
        examples=[
            OpenApiExample(
                "Update subscription prices",
                request_only=True,
                value={
                    "silver_price": "19.99",
                    "gold_price": "29.99",
                },
            ),
        ],
    )
    def patch(self, request, *args, **kwargs):
        serializer = SubscriptionPricesUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_plans = update_subscription_prices(**serializer.validated_data)
        response_serializer = SubscriptionPlanSerializer(updated_plans, many=True)
        return Response(response_serializer.data)
