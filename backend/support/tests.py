from rest_framework.test import APITestCase

from accounts.models import Notification, User, ArtistProfile
from support.models import (
    ArtistApplicationTicket,
    SupportQuestionTicket,
    AuditingRecord,
)


class SupportEndpointsTests(APITestCase):
    def setUp(self):
        self.listener = User.objects.create_user(
            username="listener",
            email="listener@example.com",
            password="Listener123!",
        )
        self.support_user = User.objects.create_user(
            username="supporter",
            email="supporter@example.com",
            password="Support123!",
            role=User.Roles.SUPPORT,
        )
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="Admin123!",
            role=User.Roles.ADMIN,
        )

    def test_support_users_can_list_applications(self):
        ArtistApplicationTicket.objects.create(
            owner=self.listener,
            artistic_name="Test Artist",
            verification_status=ArtistApplicationTicket.VerificationStatus.PENDING,
        )

        self.client.force_authenticate(user=self.support_user)
        response = self.client.get("/support/applications/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["artisticName"], "Test Artist")

    def test_submit_support_question_notifies_support_staff(self):
        self.client.force_authenticate(user=self.listener)
        response = self.client.post(
            "/support/questions/",
            {"message": "I need help with my account."},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(SupportQuestionTicket.objects.count(), 1)
        self.assertEqual(
            Notification.objects.filter(owner=self.support_user).count(),
            1,
        )
        self.assertEqual(
            Notification.objects.filter(owner=self.admin_user).count(),
            1,
        )

    def test_support_user_can_answer_question_and_notifies_sender(self):
        question = SupportQuestionTicket.objects.create(
            sender=self.listener,
            subject="Account issue",
            status=SupportQuestionTicket.TicketStatus.OPEN,
        )
        self.client.force_authenticate(user=self.support_user)

        response = self.client.patch(
            f"/support/questions/{question.id}/",
            {"message": "We have updated your account."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        question.refresh_from_db()
        self.assertEqual(question.status, SupportQuestionTicket.TicketStatus.REPLIED)
        self.assertEqual(
            Notification.objects.filter(
                owner=self.listener,
                type=Notification.NotificationType.ANSWERED_QUESTION,
            ).count(),
            1,
        )

    def test_admin_can_settle_audit_record_and_notify_artist(self):
        artist = User.objects.create_user(
            username="artist",
            email="artist@example.com",
            password="Artist123!",
            role=User.Roles.ARTIST,
        )
        profile = ArtistProfile.objects.create(
            owner=artist,
            verification_status=ArtistProfile.VerificationStatus.ACCEPTED,
        )
        audit = AuditingRecord.objects.create(
            artist=profile,
            unique_listeners=320,
            total_streams=5200,
            calculated_reward=140.50,
            is_settled=False,
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(f"/support/audits/{audit.id}/", format="json")

        self.assertEqual(response.status_code, 200)
        audit.refresh_from_db()
        self.assertTrue(audit.is_settled)
        self.assertEqual(
            Notification.objects.filter(
                owner=artist,
                type=Notification.NotificationType.AUDIT_TRANSFER,
            ).count(),
            1,
        )
