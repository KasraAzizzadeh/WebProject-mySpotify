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
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return self.username


