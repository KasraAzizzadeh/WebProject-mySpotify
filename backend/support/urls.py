from django.urls import path

from .views import (
    ArtistApplicationListView,
    ArtistApplicationDetailView,
    SupportQuestionListCreateView,
    SupportQuestionDetailView,
    AuditingRecordListView,
    AuditingRecordDetailView,
    SupportAnalyticsView,
)

urlpatterns = [
    path("applications/", ArtistApplicationListView.as_view(), name="support-applications"),
    path("applications/<int:id>/", ArtistApplicationDetailView.as_view(), name="support-application-detail"),
    path("questions/", SupportQuestionListCreateView.as_view(), name="support-questions"),
    path("questions/<int:id>/", SupportQuestionDetailView.as_view(), name="support-question-detail"),
    path("audits/", AuditingRecordListView.as_view(), name="support-audits"),
    path("audits/<int:id>/", AuditingRecordDetailView.as_view(), name="support-audit-detail"),
    path("analytics/", SupportAnalyticsView.as_view(), name="support-analytics"),
]
