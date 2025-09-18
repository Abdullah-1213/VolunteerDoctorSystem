import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger("django")


@database_sync_to_async
def get_user(user_id):
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        logger.info(f"🔑 WebSocket Token: {token}")

        if token is None:
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            logger.info(f"✅ JWT payload: {payload}")
            scope["user"] = await get_user(payload.get("user_id"))
        except jwt.ExpiredSignatureError:
            logger.warning("❌ Token expired")
            scope["user"] = AnonymousUser()
        except jwt.InvalidTokenError as e:
            logger.warning(f"❌ Invalid token: {e}")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
