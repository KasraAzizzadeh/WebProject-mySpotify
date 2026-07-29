from datetime import timedelta

from django.db.models.aggregates import Sum
from django.utils import timezone

from songs.models import PlayHistory
from subscriptions.models import SubscriptionPlan
from .models import Notification

# General Services
def send_notification(user, type, content):
    Notification.objects.create(
        owner=user,
        type=type,
        content=content,
    )

# Checks before login
def prepare_user_for_login(user):
    check_subscription(user)

def check_subscription(user):
    if not user.subscription_valid_until:
        return

    now = timezone.now()

    # expired
    if user.subscription_valid_until <= now:
        basic = SubscriptionPlan.objects.get(name=SubscriptionPlan.PlanType.BASIC)

        user.subscription_plan = basic
        user.subscription_valid_until = None
        user.save(
            update_fields=[
                "subscription_plan",
                "subscription_valid_until",
            ]
        )
        return

    remaining_days = (user.subscription_valid_until.date() - timezone.localdate()).days
    if remaining_days > 2:
        return

    already_notified = Notification.objects.filter(
        owner=user,
        type=Notification.NotificationType.EXPIRING_SUB,
        created_at__date=timezone.localdate(),
    ).exists()

    if already_notified:
        return

    message = (
        f"Your {user.subscription_plan.name} subscription "
        f"will expire in {remaining_days} "
        f"day{'s' if remaining_days != 1 else ''}."
    )
    send_notification(user, Notification.NotificationType.EXPIRING_SUB, message)

# General user helpers
def get_user_followers(user):
    return list(user.followers.values_list("id", flat=True))

def get_user_followings(user):
    return list(user.following.values_list("id", flat=True))

# Listener profile helpers
def get_user_daily_streams(user):
    today = timezone.localdate()
    return PlayHistory.objects.filter(
        user=user,
        played_at__date=today,
    ).count()

def get_last_stream_date(user):
    last = PlayHistory.objects.filter(user=user).order_by("-played_at").first()
    return last.played_at if last else None

def get_recently_played(user):
    return (PlayHistory.objects.filter(user=user)
            .order_by("-played_at")
            .values_list("song_id", flat=True)
            .distinct()[:20])

# Artist profile helpers
def get_artist_total_streams(artist):
    return artist.songs.aggregate(
        total_streams=Sum("streams")
    )["total_streams"] or 0

def get_artist_unique_listeners(artist):
    one_month_ago = timezone.now() - timedelta(days=30)

    return (PlayHistory.objects
            .filter(song__artist=artist, played_at__gte=one_month_ago)
            .values("user_id").distinct().count())