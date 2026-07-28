from django.contrib.auth.models import AbstractUser
from django.db import models
from subscriptions.models import SubscriptionPlan

# Create your models here.
class User(AbstractUser):
    class Roles(models.TextChoices):
        LISTENER = "listener"
        ARTIST = "artist"
        SUPPORT = "support"
        ADMIN = "admin"

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        RATHER_NOT_SAY = "NOT_SPECIFIED", "Rather not say"

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=64, blank=True)
    role = models.CharField(choices=Roles.choices, default=Roles.LISTENER, max_length=20, db_index=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)
    gender = models.CharField(choices=Gender.choices, default=Gender.RATHER_NOT_SAY, max_length=20)
    birth_date = models.DateField(null=True, blank=True)
    # set the basic plan when creating users in serializers
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subscribers"
    )
    subscription_valid_until = models.DateTimeField(null=True, blank=True, db_index=True)
    following = models.ManyToManyField(
        "self",
        related_name="followers",
        symmetrical=False,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return self.username

class UserSettings(models.Model):
    class Languages(models.TextChoices):
        ENGLISH = "en"
        PERSIAN = "fa"

    class SystemVoice(models.TextChoices):
        ENGLISH = "en-is"
        PERSIAN = "fa"

    language = models.CharField(choices=Languages.choices, default=Languages.ENGLISH, max_length=20)
    system_voice = models.CharField(choices=SystemVoice.choices, default=Languages.ENGLISH, max_length=20)
    notification_limit = models.PositiveIntegerField(default=10)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")

    def __str__(self):
        return f"{self.owner.username} | setting"


class ArtistProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        REJECTED = "REJECTED", "Rejected"
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"

    bio = models.TextField(blank=True, null=True)
    verification_status = models.CharField(choices=VerificationStatus.choices, max_length=20)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="artist_profile")

    def __str__(self):
        return f"{self.owner.username} | artist profile"

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        EXPIRING_SUB = "ES"
        SUPPORT_APP = "SA"
        ARTIST_APPROVED = "AA"
        ANSWERED_QUESTION = "AQ"
        SUPPORT_TICKET = "ST"
        AUDIT_TRANSFER = "AT"
        NEW_ALBUM = "NA"

    type = models.CharField(choices=NotificationType.choices, max_length=20)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    # TODO redirect_id

    class Meta:
        indexes = [
            models.Index(fields=["owner", "is_read"]),
            models.Index(fields=["owner", "-created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} | {self.owner.username} | {self.created_at}"

class OtpCode(models.Model):
    code = models.CharField(max_length=10)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField() # created + 15

    class Meta:
        indexes = [
            models.Index(fields=["owner", "expires_at"]),
        ]

