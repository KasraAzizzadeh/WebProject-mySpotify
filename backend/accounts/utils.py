import random
from .models import User

def generate_display_name(username):
    while True:
        display_name = f"{username}_{random.randint(1000, 9999)}"
        if not User.objects.filter(display_name=display_name).exists():
            return display_name