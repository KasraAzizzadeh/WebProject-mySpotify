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
