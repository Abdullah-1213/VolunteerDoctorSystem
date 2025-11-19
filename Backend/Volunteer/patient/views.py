# patients/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Patient, Visit

from accounts.models import User  # ✅ use your custom user model
from .serializers import (
    CheckCnicSerializer,
    RegisterPatientSerializer,
    PatientSerializer,
    VisitSerializer,
    CreateVisitSerializer,
)


# ------------------------------------
# 🔍 Check if Patient Exists by CNIC
# ------------------------------------
class CheckCnicView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckCnicSerializer(data=request.data)
        if serializer.is_valid():
            cnic = serializer.validated_data["cnic"]
            try:
                patient = Patient.objects.get(cnic=cnic)
                return Response({
                    "exists": True,
                    "patient": PatientSerializer(patient).data
                }, status=status.HTTP_200_OK)
            except Patient.DoesNotExist:
                return Response({"exists": False}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------------
# 🧍‍♂️ Register New Patient
# ------------------------------------
class RegisterPatientView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RegisterPatientSerializer(data=request.data)
        if serializer.is_valid():
            cnic = serializer.validated_data.get("cnic")
            if cnic and Patient.objects.filter(cnic=cnic).exists():
                return Response(
                    {"detail": "Patient with this CNIC already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            patient = Patient.objects.create(**serializer.validated_data)
            return Response(PatientSerializer(patient).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------------
# 🩺 Handle Visit Records
# ------------------------------------
class PatientRecordsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # 🔹 GET — all visits for logged-in doctor
    def get(self, request):
        if request.user.role != "doctor":
            return Response(
                {"detail": "Only doctors can view visit records."},
                status=status.HTTP_403_FORBIDDEN
            )

        visits = Visit.objects.filter(doctor=request.user).select_related("patient")
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 🔹 POST — create new visit
    def post(self, request):
        if request.user.role != "doctor":
            return Response(
                {"detail": "Only doctors can create visit records."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreateVisitSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            visit = serializer.save()  # ✅ Serializer already handles patient + doctor linking
            return Response(VisitSerializer(visit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 PUT — update existing visit
    def put(self, request, pk):
        if request.user.role != "doctor":
            return Response(
                {"detail": "Only doctors can update visit records."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            visit = Visit.objects.get(pk=pk, doctor=request.user)
        except Visit.DoesNotExist:
            return Response({"detail": "Record not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateVisitSerializer(
            visit, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(VisitSerializer(visit).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 DELETE — remove visit
    def delete(self, request, pk):
        if request.user.role != "doctor":
            return Response(
                {"detail": "Only doctors can delete visit records."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            visit = Visit.objects.get(pk=pk, doctor=request.user)
            visit.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Visit.DoesNotExist:
            return Response({"detail": "Record not found"}, status=status.HTTP_404_NOT_FOUND)
