from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema, extend_schema_view

from accounts.models import Notification
from accounts.services import get_support_users, send_notification
from .models import ArtistApplicationTicket, SupportQuestionTicket, AuditingRecord
from .permissions import IsAdminRole, IsSupportOrAdmin
from .serializers import (
    ArtistApplicationSerializer,
    ArtistApplicationDecisionSerializer,
    SupportQuestionSerializer,
    SupportQuestionCreateSerializer,
    SupportQuestionAnswerSerializer,
    AuditingRecordSerializer,
    SupportAnalyticsSerializer,
)
from . import services


@extend_schema_view(
    get=extend_schema(
        summary="List artist applications",
        description="Retrieves the list of all submitted artist application tickets.",
        responses={200: ArtistApplicationSerializer(many=True)}
    )
)
class ArtistApplicationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSupportOrAdmin]
    serializer_class = ArtistApplicationSerializer

    def get_queryset(self):
        return ArtistApplicationTicket.objects.select_related("owner").order_by("-submitted_at")


@extend_schema_view(
    patch=extend_schema(
        summary="Review artist application",
        description="Support or admin users may accept or reject an artist application."
                    " When rejecting, a rejection message is required.",
        request=ArtistApplicationDecisionSerializer,
        responses={200: ArtistApplicationSerializer}
    )
)
class ArtistApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSupportOrAdmin]

    def patch(self, request, id):
        application = get_object_or_404(
            ArtistApplicationTicket.objects.select_related("owner"),
            id=id,
        )

        serializer = ArtistApplicationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status_choice = serializer.validated_data["status"]
        message = serializer.validated_data.get("message", "")

        application = services.process_application_decision(application, status_choice)

        notification_message = (
            "Congratulations! Your artist application has been approved."
            if status_choice == "approved"
            else f"Your artist application has been rejected. Reason: {message}"
        )

        send_notification(
            application.owner,
            Notification.NotificationType.ARTIST_APPROVED,
            notification_message,
        )

        return Response(ArtistApplicationSerializer(application).data)


@extend_schema_view(
    get=extend_schema(
        summary="List support questions",
        description="Retrieves the list of support questions and any related answers.",
        responses={200: SupportQuestionSerializer(many=True)}
    ),
    post=extend_schema(
        summary="Create a support question",
        description="Submit a new support question ticket. Any authenticated user may use this endpoint.",
        request=SupportQuestionCreateSerializer,
        responses={201: SupportQuestionSerializer}
    )
)
class SupportQuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportQuestionSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsSupportOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return (
            SupportQuestionTicket.objects.select_related("sender")
            .prefetch_related("messages__sender")
            .order_by("-submitted_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SupportQuestionCreateSerializer
        return SupportQuestionSerializer

    def perform_create(self, serializer):
        self.created_ticket = serializer.save()
        support_users = get_support_users()
        for support_user in support_users:
            send_notification(
                support_user,
                Notification.NotificationType.SUPPORT_TICKET,
                f"New support ticket submitted by {self.created_ticket.sender.username}.",
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output_serializer = SupportQuestionSerializer(self.created_ticket)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve support question",
        description="Retrieves a specific support question ticket together with its messages.",
        responses={200: SupportQuestionSerializer}
    ),
    patch=extend_schema(
        summary="Answer support question",
        description="Support or admin users may send an answer to a support question ticket.",
        request=SupportQuestionAnswerSerializer,
        responses={200: SupportQuestionSerializer}
    )
)
class SupportQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSupportOrAdmin]

    def get(self, request, id):
        question = get_object_or_404(
            SupportQuestionTicket.objects.select_related("sender").prefetch_related("messages__sender"),
            id=id,
        )
        return Response(SupportQuestionSerializer(question).data)

    def patch(self, request, id):
        question = get_object_or_404(SupportQuestionTicket, id=id)
        serializer = SupportQuestionAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = services.answer_support_question(
            question,
            request.user,
            serializer.validated_data["message"],
        )

        send_notification(
            question.sender,
            Notification.NotificationType.ANSWERED_QUESTION,
            (
                f"Your support question has been answered.\n\n"
                f"Question: {question.subject}\n\n"
                f"Reply: {serializer.validated_data['message']}"
            ),
        )

        return Response(SupportQuestionSerializer(question).data)


@extend_schema_view(
    get=extend_schema(
        summary="List auditing records",
        description="Retrieves all artist auditing records.",
        responses={200: AuditingRecordSerializer(many=True)}
    )
)
class AuditingRecordListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSupportOrAdmin]
    serializer_class = AuditingRecordSerializer

    def get_queryset(self):
        return AuditingRecord.objects.select_related("artist__owner").order_by("-id")


@extend_schema_view(
    patch=extend_schema(
        summary="Confirm audit settlement",
        description="Admin users may settle an artist auditing record.",
        request=None,
        responses={200: AuditingRecordSerializer}
    )
)
class AuditingRecordDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, id):
        audit_record = get_object_or_404(
            AuditingRecord.objects.select_related("artist__owner"),
            id=id,
        )

        if audit_record.is_settled:
            return Response(
                {"detail": "This audit record has already been settled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        audit_record = services.settle_audit_record(audit_record)

        send_notification(
            audit_record.artist.owner,
            Notification.NotificationType.AUDIT_TRANSFER,
            (
                f"Your monthly payout has been completed.\n\n"
                f"Performance Summary\n"
                f"• Total Streams: {audit_record.total_streams}\n"
                f"• Unique Listeners: {audit_record.unique_listeners}\n\n"
                f"${audit_record.calculated_reward} has been transferred to your account. Thank you for being part of the platform!"
            ),
        )

        return Response(AuditingRecordSerializer(audit_record).data)


@extend_schema(
    summary="Get support analytics",
    description="Retrieves support analytics including total user counts, premium tier distribution, and monthly gross revenue.",
    responses={200: SupportAnalyticsSerializer},
)
class SupportAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsSupportOrAdmin]

    def get(self, request):
        analytics = services.get_support_analytics()
        serializer = SupportAnalyticsSerializer(analytics)
        return Response(serializer.data)
