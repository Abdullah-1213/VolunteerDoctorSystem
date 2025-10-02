from rest_framework import generics, permissions
from .models import Prescription
from .serializers import PrescriptionSerializer
from rest_framework.response import Response


class PrescriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get("room_id")

        if user.is_staff:  # doctor → apne likhe huye
            qs = Prescription.objects.filter(doctor=user)
        else:  # patient → apne hi
            qs = Prescription.objects.filter(patient_id=user.id)

        if room_id:
            qs = qs.filter(room_id=room_id)

        return qs

    def perform_create(self, serializer):
        doctor = self.request.user
        patient_id = self.request.data.get("patient")
        if not patient_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"patient": "Patient field is required."})
        serializer.save(doctor=doctor, patient_id=patient_id)

class PrescriptionDetailView(generics.RetrieveAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get("room_id")

        if user.is_staff:
            qs = Prescription.objects.filter(doctor=user)
        else:
            qs = Prescription.objects.filter(patient_id=user.id)

        if room_id:
            qs = qs.filter(room_id=room_id)

        return qs
