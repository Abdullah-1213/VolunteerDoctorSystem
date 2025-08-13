from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.exceptions import ObjectDoesNotExist
from accounts.models import User

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            if not user.is_active:
                return None
            if user.role == 'doctor' and not user.is_verified:
                return None  # Prevent unverified doctors from authenticating
            return user
        except ObjectDoesNotExist:
            return None