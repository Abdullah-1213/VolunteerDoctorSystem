from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import User
from .models import EmailOTP

class VerifyOTP(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # ❌ Disables JWT authentication
    def post(self, request):
        user_id = request.data.get("user_id")
        otp = request.data.get("otp")

        if not user_id or not otp:
            return Response({"error": "user_id and otp required"}, status=400)

        try:
            user = User.objects.get(id=user_id)
            email_otp = user.email_otp
        except (User.DoesNotExist, EmailOTP.DoesNotExist):
            return Response({"error": "Invalid user or OTP"}, status=404)

        if email_otp.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        if email_otp.otp != otp:
            return Response({"error": "Incorrect OTP"}, status=400)

        user.is_verified = True
        user.save()

        return Response({"message": "Email verified successfully!"})
