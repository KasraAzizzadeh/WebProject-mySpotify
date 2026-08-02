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


class SubscriptionTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        SUCCESS = "SUCCESS"
        FAILED = "FAILED"

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="subscription_transactions",
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    authority = models.CharField(max_length=64, unique=True)
    reference_id = models.CharField(max_length=64, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} | {self.subscription_plan.name} | {self.status}"
