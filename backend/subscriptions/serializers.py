from rest_framework import serializers

from .models import SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "price",
            "daily_stream_limit",
            "playlist_limit",
            "profile_picture_upload",
            "song_download",
            "early_access",
            "stats_info",
        ]
        read_only_fields = [
            "id",
            "name",
            "daily_stream_limit",
            "playlist_limit",
            "profile_picture_upload",
            "song_download",
            "early_access",
            "stats_info",
        ]


class SubscriptionPricesUpdateSerializer(serializers.Serializer):
    silver_price = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    gold_price = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "At least one price field must be provided."
            )
        return attrs


class SubscriptionCheckoutSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(
        choices=[
            SubscriptionPlan.PlanType.SILVER,
            SubscriptionPlan.PlanType.GOLD,
        ]
    )


class SubscriptionCheckoutResponseSerializer(serializers.Serializer):
    transaction_id = serializers.IntegerField()
    authority = serializers.CharField()
    payment_url = serializers.URLField()
    status = serializers.CharField()


class SubscriptionVerificationResponseSerializer(serializers.Serializer):
    transaction_id = serializers.IntegerField()
    transaction_status = serializers.CharField()
    subscription_plan = serializers.CharField(allow_null=True)
    subscription_valid_until = serializers.DateTimeField(allow_null=True)
    reference_id = serializers.CharField(allow_null=True)
