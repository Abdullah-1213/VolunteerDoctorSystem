from django.urls import re_path
from appointments import VideoCallConsumer

websocket_urlpatterns = [
    re_path(r'ws/video/(?P<room_name>\w+)/$', VideoCallConsumer.as_asgi()),
]
