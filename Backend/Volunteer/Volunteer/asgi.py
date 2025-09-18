import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Volunteer.settings")

import django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from .jwt_middleware import JWTAuthMiddleware
from appointments.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
