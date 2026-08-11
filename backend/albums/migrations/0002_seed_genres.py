from django.db import migrations


def seed_genres(apps, schema_editor):
    Genre = apps.get_model("albums", "Genre")
    genres = [
        ("Pop", "#FF5A5F"),
        ("Rock", "#1DB954"),
        ("Hip Hop", "#7B61FF"),
        ("R&B", "#F39C12"),
        ("Jazz", "#AF7AC5"),
        ("Classical", "#2E86C1"),
        ("Electronic", "#27AE60"),
        ("Country", "#D35400"),
        ("Reggae", "#16A085"),
        ("Indie", "#C0392B"),
        ("Folk", "#8E44AD"),
        ("Blues", "#2980B9"),
        ("Latin", "#E67E22"),
        ("Punk", "#34495E"),
        ("Soul", "#F1C40F"),
    ]

    for name, color in genres:
        Genre.objects.get_or_create(name=name, defaults={"color": color})


class Migration(migrations.Migration):
    dependencies = [
        ("albums", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_genres, migrations.RunPython.noop),
    ]
