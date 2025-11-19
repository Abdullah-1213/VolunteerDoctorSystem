# patients/serializers.py
from rest_framework import serializers
from .models import Patient, Visit
from accounts.models import User  # ✅ Import your custom User model (the one with role field)


# -------------------------------
# 🧍‍♂️ PATIENT SERIALIZERS
# -------------------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "cnic", "name", "age", "gender", "contact", "address"]


class CheckCnicSerializer(serializers.Serializer):
    cnic = serializers.CharField(max_length=15)


class RegisterPatientSerializer(serializers.Serializer):
    cnic = serializers.CharField(max_length=15, required=False, allow_blank=True)
    name = serializers.CharField(max_length=255)
    age = serializers.IntegerField()
    gender = serializers.CharField(max_length=10)
    contact = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)


# -------------------------------
# 🩺 VISIT SERIALIZERS
# -------------------------------
class VisitSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="patient.name", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id")

    class Meta:
        model = Visit
        fields = [
            "id",
            "patient_id",
            "name",
            "bp",
            "hr",
            "temp",
            "spo2",
            "introduction",
            "history",
            "examination",
            "investigation",
            "diagnosis",
            "treatment",
            "date",
        ]


class CreateVisitSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    bp = serializers.CharField(max_length=10, required=False, allow_blank=True)
    hr = serializers.IntegerField(required=False, allow_null=True)
    temp = serializers.FloatField(required=False, allow_null=True)
    spo2 = serializers.IntegerField(required=False, allow_null=True)
    introduction = serializers.CharField(required=False, allow_blank=True)
    history = serializers.CharField(required=False, allow_blank=True)
    examination = serializers.CharField(required=False, allow_blank=True)
    investigation = serializers.CharField(required=False, allow_blank=True)
    diagnosis = serializers.CharField(required=False, allow_blank=True)
    treatment = serializers.CharField(required=False, allow_blank=True)

    def validate_patient_id(self, value):
        if not Patient.objects.filter(id=value).exists():
            raise serializers.ValidationError("Patient does not exist")
        return value

    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        patient = Patient.objects.get(id=patient_id)

        # ✅ Use the logged-in user as doctor
        doctor = self.context['request'].user

        # ✅ Ensure the user is actually a doctor
        if doctor.role != 'doctor':
            raise serializers.ValidationError("Only doctors can create visit records.")

        visit = Visit.objects.create(
            patient=patient,
            doctor=doctor,
            **validated_data
        )
        return visit

    def update(self, instance, validated_data):
        patient_id = validated_data.pop('patient_id', None)
        if patient_id is not None:
            patient = Patient.objects.get(id=patient_id)
            instance.patient = patient

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
