from rest_framework import serializers

from accounts.models import User
from .models import (
    ArtistApplicationTicket,
    SupportQuestionTicket,
    TicketMessage,
    AuditingRecord,
)
from . import services


class ArtistApplicationSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="owner.id", read_only=True)
    email = serializers.EmailField(source="owner.email", read_only=True)
    artisticName = serializers.CharField(source="artistic_name", read_only=True)
    samples = serializers.SerializerMethodField()
    verificationStatus = serializers.SerializerMethodField()
    submittedAt = serializers.DateTimeField(source="submitted_at", read_only=True)

    class Meta:
        model = ArtistApplicationTicket
        fields = [
            "id",
            "userId",
            "email",
            "artisticName",
            "samples",
            "verificationStatus",
            "submittedAt",
        ]

    def get_samples(self, application):
        return [
            sample.audio_file.url
            for sample in application.applicationsamples_set.all()
            if sample.audio_file
        ]

    def get_verificationStatus(self, application):
        return application.verification_status.lower()


class ArtistApplicationDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["approved", "rejected"])
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data["status"] == "rejected" and not data.get("message"):
            raise serializers.ValidationError(
                {
                    "message": "A rejection message is required when rejecting an application."
                }
            )
        return data


class TicketMessageSerializer(serializers.ModelSerializer):
    senderId = serializers.IntegerField(source="sender.id", read_only=True)
    senderName = serializers.CharField(source="sender.username", read_only=True)
    senderRole = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = [
            "id",
            "senderId",
            "senderName",
            "senderRole",
            "content",
            "timestamp",
        ]

    def get_senderRole(self, message):
        return (
            "support"
            if message.sender.role in [User.Roles.SUPPORT, User.Roles.ADMIN]
            else "user"
        )


class SupportQuestionSerializer(serializers.ModelSerializer):
    senderId = serializers.IntegerField(source="sender.id", read_only=True)
    senderUsername = serializers.CharField(source="sender.username", read_only=True)
    submittedAt = serializers.DateTimeField(source="submitted_at", read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = SupportQuestionTicket
        fields = [
            "id",
            "senderId",
            "senderUsername",
            "subject",
            "status",
            "submittedAt",
            "messages",
        ]

    def get_status(self, question):
        return question.status.title()


class SupportQuestionCreateSerializer(serializers.Serializer):
    message = serializers.CharField()

    def create(self, validated_data):
        # services.submit_support_question expects (sender, message)
        return services.submit_support_question(
            self.context["request"].user,
            validated_data["message"],
        )


class SupportQuestionAnswerSerializer(serializers.Serializer):
    message = serializers.CharField()


class AuditingRecordSerializer(serializers.ModelSerializer):
    artistId = serializers.IntegerField(source="artist.owner.id", read_only=True)
    artistName = serializers.SerializerMethodField()
    uniqueListeners = serializers.IntegerField(source="unique_listeners", read_only=True)
    totalStreams = serializers.IntegerField(source="total_streams", read_only=True)
    calculatedReward = serializers.DecimalField(source="calculated_reward", max_digits=10, decimal_places=2, read_only=True)
    paymentStatus = serializers.SerializerMethodField()

    class Meta:
        model = AuditingRecord
        fields = [
            "id",
            "artistId",
            "artistName",
            "uniqueListeners",
            "totalStreams",
            "calculatedReward",
            "paymentStatus",
        ]

    def get_artistName(self, record):
        return record.artist.owner.display_name or record.artist.owner.username

    def get_paymentStatus(self, record):
        return "Settled" if record.is_settled else "Pending Payment"
