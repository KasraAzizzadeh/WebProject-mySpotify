from django.db import transaction

from .models import (
    ArtistApplicationTicket,
    ApplicationSamples,
    SupportQuestionTicket,
    TicketMessage,
    AuditingRecord,
)


# Artist application
def create_application(user, artistic_name, samples):
    application = ArtistApplicationTicket.objects.create(
        owner=user,
        artistic_name=artistic_name,
        verification_status=ArtistApplicationTicket.VerificationStatus.PENDING,
    )

    ApplicationSamples.objects.bulk_create(
        [
            ApplicationSamples(
                artist_application=application,
                audio_file=sample,
            ) for sample in samples
        ]
    )


@transaction.atomic
def process_application_decision(application, decision):
    if decision not in {"approved", "rejected"}:
        raise ValueError("Invalid application decision")

    profile_status = (
        ArtistApplicationTicket.VerificationStatus.ACCEPTED
        if decision == "approved"
        else ArtistApplicationTicket.VerificationStatus.REJECTED
    )

    application.verification_status = profile_status
    application.save(update_fields=["verification_status"])

    from accounts.models import ArtistProfile, User

    user = application.owner
    artist_profile, _ = ArtistProfile.objects.get_or_create(
        owner=user,
        defaults={"verification_status": profile_status},
    )
    artist_profile.verification_status = profile_status
    artist_profile.save(update_fields=["verification_status"])

    if decision == "approved":
        user.role = User.Roles.ARTIST
        user.display_name = application.artistic_name
        user.save(update_fields=["role", "display_name"])

    return application


def _normalize_question_subject(message):
    if len(message) <= 50:
        return message
    return f"{message[:47]}..."


@transaction.atomic
def submit_support_question(sender, message):
    subject = _normalize_question_subject(message)
    question = SupportQuestionTicket.objects.create(
        sender=sender,
        subject=subject,
        status=SupportQuestionTicket.TicketStatus.OPEN,
    )

    TicketMessage.objects.create(
        sender=sender,
        content=message,
        question=question,
    )

    return question


@transaction.atomic
def answer_support_question(question, responder, message):
    TicketMessage.objects.create(
        sender=responder,
        content=message,
        question=question,
    )

    question.status = SupportQuestionTicket.TicketStatus.REPLIED
    question.save(update_fields=["status"])
    return question


@transaction.atomic
def settle_audit_record(audit_record):
    audit_record.is_settled = True
    audit_record.save(update_fields=["is_settled"])
    return audit_record
