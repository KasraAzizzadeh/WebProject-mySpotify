from django.db import models

# Create your models here.
class SubscriptionPlan(models.Model):
    class PlanType(models.TextChoices):
        BASIC = "basic"
        SILVER = "silver"
        GOLD = "gold"

    name = models.CharField(max_length=20, choices=PlanType.choices, default=PlanType.BASIC, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    daily_stream_limit = models.PositiveIntegerField(default=60, null=True, blank=True)
    playlist_limit = models.PositiveIntegerField(default=6, null=True, blank=True)

    profile_picture_upload = models.BooleanField(default=False)
    song_download = models.BooleanField(default=False)
    early_access = models.BooleanField(default=False)
    stats_info = models.BooleanField(default=False)

    def __str__(self):
        return self.name
