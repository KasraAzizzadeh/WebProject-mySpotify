from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("albums", "0002_seed_genres"),
        ("albums", "0003_alter_album_cover_image"),
    ]

    operations = []
