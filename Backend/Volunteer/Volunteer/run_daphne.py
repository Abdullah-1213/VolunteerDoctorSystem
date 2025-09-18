# run_daphne.py
import os
from daphne.server import Server
from Volunteer.asgi import application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Volunteer.settings")
Server(application=application, port=8000, interface="0.0.0.0").run()