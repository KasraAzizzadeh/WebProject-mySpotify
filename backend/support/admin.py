from django.contrib import admin
from .models import ArtistApplicationTicket, ApplicationSamples, SupportQuestionTicket, TicketMessage, AuditingRecord

# Register your models here.
admin.site.register(ArtistApplicationTicket)
admin.site.register(ApplicationSamples)
admin.site.register(SupportQuestionTicket)
admin.site.register(TicketMessage)
admin.site.register(AuditingRecord)
