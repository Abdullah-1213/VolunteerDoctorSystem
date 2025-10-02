from rest_framework import serializers
from .models import Prescription

class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.full_name", read_only=True)
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "text",
            "doctor",       # doctor id
            "doctor_name",  # doctor ka naam
            "patient",      # patient id
            "patient_name", # patient ka naam
            "room_id",
            "created_at"
        ]
        read_only_fields = ["id", "doctor", "created_at"]
