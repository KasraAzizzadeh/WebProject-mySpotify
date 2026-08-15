from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponseRedirect
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import OpenApiExample, OpenApiParameter, extend_schema, OpenApiResponse

from .serializers import (
    SubscriptionCheckoutResponseSerializer,
    SubscriptionCheckoutSerializer,
    SubscriptionPlanSerializer,
    SubscriptionPricesUpdateSerializer,
    SubscriptionVerificationResponseSerializer,
)
from .permissions import IsAdminRole
from .models import SubscriptionTransaction
from .services import (
    ZarinpalServiceError,
    create_subscription_checkout,
    get_all_subscription_plans,
    update_subscription_prices,
    verify_subscription_payment,
)

# Import user serializer so we can return updated user after verification
from accounts.serializers import AuthUserSerializer
from accounts.models import User


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


@extend_schema(
    summary="Create a subscription checkout session",
    description=(
        "Starts a sandbox payment session for the selected subscription plan. "
        "Returns a payment URL and authority token for the Zarinpal sandbox gateway."
    ),
    request=SubscriptionCheckoutSerializer,
    responses={
        status.HTTP_200_OK: SubscriptionCheckoutResponseSerializer,
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(
            description="Invalid request payload or unsupported plan."
        ),
        status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
            description="Authentication credentials were not provided."
        ),
    },
)
class SubscriptionCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = SubscriptionCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_name = serializer.validated_data["plan"]
        duration = int(serializer.validated_data.get("duration", 1))
        return_url = request.data.get("return_url")
        try:
            transaction, payment_url = create_subscription_checkout(request.user, plan_name, duration, return_url)
        except (ZarinpalServiceError, ImproperlyConfigured, ValueError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_data = {
            "transaction_id": transaction.id,
            "authority": transaction.authority,
            "payment_url": payment_url,
            "status": transaction.status,
        }
        response_serializer = SubscriptionCheckoutResponseSerializer(response_data)
        return Response(response_serializer.data)


@extend_schema(
    summary="Verify a subscription payment",
    description=(
        "Receives Zarinpal callback, performs server-side verify, updates subscription on success, "
        "and optionally redirects the browser back to the provided return URL."
    ),
    parameters=[
        OpenApiParameter(
            name="Authority",
            location=OpenApiParameter.QUERY,
            required=True,
            description="Zarinpal Authority token returned after the payment request.",
            type=str,
        ),
        OpenApiParameter(
            name="Status",
            location=OpenApiParameter.QUERY,
            required=True,
            description="Payment result status returned by Zarinpal. Use OK for successful checkout return.",
            type=str,
        ),
        OpenApiParameter(
            name="return_url",
            location=OpenApiParameter.QUERY,
            required=False,
            description="Optional frontend URL to redirect to after verification.",
            type=str,
        ),
    ],
    responses={
        status.HTTP_200_OK: SubscriptionVerificationResponseSerializer,
        status.HTTP_302_FOUND: OpenApiResponse(
            description="Redirects to the provided return_url with result parameters."
        ),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(
            description="Missing or invalid callback parameters."
        ),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(
            description="Transaction with the requested authority could not be found."
        ),
    },
)
class SubscriptionVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        authority = request.GET.get("Authority")
        status_value = request.GET.get("Status")

        if not authority or not status_value:
            return Response(
                {"detail": "Authority and Status are required query parameters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return_url = request.GET.get("return_url")

        try:
            transaction = verify_subscription_payment(authority, status_value)
        except SubscriptionTransaction.DoesNotExist as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ZarinpalServiceError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Refresh user instance so we return updated subscription info and feature flags
        user = User.objects.select_related('subscription_plan', 'settings', 'artist_profile')\
            .prefetch_related('followers', 'following', 'playlists').get(pk=transaction.user.pk)

        response_data = {
            "transaction_id": transaction.id,
            "transaction_status": transaction.status,
            "subscription_plan": user.subscription_plan.name if user.subscription_plan else None,
            "subscription_valid_until": user.subscription_valid_until,
            "reference_id": transaction.reference_id,
            # Include full serialized user so clients can immediately apply new features
            "user": AuthUserSerializer(user).data,
        }

        if return_url:
            parsed_url = urlparse(return_url)
            query = dict(parse_qsl(parsed_url.query, keep_blank_values=True))
            query.update(
                {
                    "status": "success" if transaction.status == SubscriptionTransaction.Status.SUCCESS else "failed",
                    "authority": authority,
                    "transaction_status": transaction.status,
                    "subscription_plan": response_data["subscription_plan"],
                    "reference_id": response_data["reference_id"] or "",
                    # hint frontend to refresh session data after redirect
                    "refresh": "1",
                }
            )
            if response_data["subscription_valid_until"]:
                query["subscription_valid_until"] = response_data["subscription_valid_until"].isoformat()

            new_query = urlencode(query)
            redirect_url = urlunparse(parsed_url._replace(query=new_query))
            return HttpResponseRedirect(redirect_url)

        response_serializer = SubscriptionVerificationResponseSerializer(response_data)
        return Response(response_serializer.data)
