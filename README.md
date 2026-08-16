For using the docker container from the project directory run:
- docker compose build
- docker compose up

then to apply backend migrations run from another terminal:
- docker compose exec backend python manage.py migrat
- docker compose restart backend
- docker compose exec backend python manage.py createsuperuser
