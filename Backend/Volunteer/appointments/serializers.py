from rest_framework import serializers
from accounts.models import User
from .models import DoctorAvailability, Appointment

class DoctorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'specialization', 'hospital_name', 'is_verified']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['name'] = instance.full_name  # Add for compatibility
        return representation

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor = serializers.SerializerMethodField()

    class Meta:
        model = DoctorAvailability
        fields = ['id', 'doctor', 'start_time', 'end_time', 'is_booked']

    def get_doctor(self, obj):
        return {
            'id': obj.doctor.id,
            'name': obj.doctor.full_name,
            'specialization': getattr(obj.doctor, 'specialization', None),
            'hospital_name': getattr(obj.doctor, 'hospital_name', None),
        }


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(read_only=True)  # read only here
    slot = DoctorAvailabilitySerializer(read_only=True)
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=DoctorAvailability.objects.filter(is_booked=False),
        source='slot',
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'slot', 'slot_id', 'reason', 'status', 'booked_at']

    def validate(self, data):
        # data['slot'] will be a DoctorAvailability instance
        if 'slot' in data and 'patient' in data:
            # Optionally validate if slot is free, etc.
            pass
        return data
