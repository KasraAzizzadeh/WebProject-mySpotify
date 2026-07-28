from django.db import models
from accounts.models import User, ArtistProfile


# Create your models here.
class ArtistApplicationTicket(models.Model):
    class VerificationStatus(models.TextChoices):
        REJECTED = "REJECTED", "Rejected"
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    artistic_name = models.CharField(max_length=64)
    # TODO samples
    verification_status = models.CharField(choices=VerificationStatus.choices, default=VerificationStatus.PENDING, max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)

class ApplicationSamples(models.Model):
    audio_file = models.FileField(upload_to='sample_songs/')
    artist_application = models.ForeignKey(ArtistApplicationTicket, on_delete=models.CASCADE)

class SupportQuestionTicket(models.Model):
    class TicketStatus(models.TextChoices):
        OPEN = "OPEN", "Open"
        REPLIED = "REPLIED", "Replied"
        CLOSED = "CLOSED", "Closed"

    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=64)
    status = models.CharField(choices=TicketStatus.choices, default=TicketStatus.OPEN, max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)

class TicketMessage(models.Model):
    class SenderRoles(models.TextChoices):
        USER = "USER", "user"
        SUPPORT = "SUPPORT", "support"

    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    question = models.ForeignKey(SupportQuestionTicket, on_delete=models.CASCADE, related_name="messages")

class AuditingRecord(models.Model):
    artist = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE)
    unique_listeners = models.PositiveIntegerField()
    total_streams = models.PositiveIntegerField()
    calculated_reward = models.DecimalField(max_digits=10, decimal_places=2)
    is_settled = models.BooleanField(default=False)



