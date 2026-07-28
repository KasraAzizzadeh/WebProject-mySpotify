from django.contrib import admin

from subscriptions.models import SubscriptionPlan
from .models import User, UserSettings, ArtistProfile, Notification, OtpCode
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(UserSettings)
admin.site.register(ArtistProfile)
admin.site.register(Notification)
admin.site.register(OtpCode)
