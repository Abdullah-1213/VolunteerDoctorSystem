from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
from .serializers import DoctorSerializer, PatientSerializer, LoginSerializer
from .models import User
from otp.utils import send_otp
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class DoctorSignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Disables JWT authentication


    def post(self, request):
        try:
            serializer = DoctorSerializer(data=request.data)
            if serializer.is_valid():
                doctor = serializer.save()
                return Response({"message": "Doctor signed up successfully!"}, status=status.HTTP_201_CREATED)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response({"error": "Doctor with this email, phone, or license already exists"}, status=status.HTTP_400_BAD_REQUEST)

class PatientSignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  #  Disables JWT authentication
    

    def post(self, request):
        try:
            serializer = PatientSerializer(data=request.data)

            if serializer.is_valid():
                patient = serializer.save()

                #  Send OTP after signup
                send_otp(patient)

                return Response({
                    "message": "Patient registered! OTP sent to email.",
                    "user_id": patient.id
                }, status=status.HTTP_201_CREATED)

            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError:
            return Response({"error": "Patient with this email or phone already exists"},
                            status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            role = serializer.validated_data.get('role')  # frontend se ayega
            
            try:
                user = User.objects.get(email=email)

                # Role check
                if user.role != role:
                    return Response({"error": f"This login panel is for {role} only"}, status=status.HTTP_403_FORBIDDEN)

                # Password check
                if user.check_password(password):
                    if user.role == 'doctor' and not user.is_verified:
                        return Response({"message": "Account not verified yet", "is_verified": False}, status=status.HTTP_403_FORBIDDEN)

                    tokens = get_tokens_for_user(user)
                    response_data = {
                        "message": "Login successful",
                        "user_id": user.id,
                        "name": user.full_name,
                        "email": user.email,
                        "role": user.role,
                        "tokens": tokens,
                        "is_verified": user.is_verified,
                    }
                    if user.role == 'doctor':
                        response_data['doctor_data'] = {
                            "specialty": user.specialization,
                            "is_verified": user.is_verified
                        }
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



