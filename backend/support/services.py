from .models import ArtistApplicationTicket, ApplicationSamples


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