from rest_framework import serializers
from accounts.models import User

class DoctorSerializer(serializers.ModelSerializer):
    license_file = serializers.FileField(required=False)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone_number', 'specialization',
                  'hospital_name', 'medical_license_number', 'password', 'license_file']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'full_name': {'required': True},
            'phone_number': {'required': True},
            'specialization': {'required': True},
            'hospital_name': {'required': True},
            'medical_license_number': {'required': True},
        }

    def validate(self, data):
        data['role'] = 'doctor'  # Enforce doctor role
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        doctor = User(**validated_data)
        doctor.set_password(password)
        doctor.save()
        return doctor

    def validate_license_file(self, value):
        if value and not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are allowed for the license.")
        return value

class PatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone_number', 'password', 'address', 'date_of_birth']
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'phone_number': {'required': True},
            'address': {'required': False},
            'date_of_birth': {'required': False},
        }

    def validate(self, data):
        data['role'] = 'patient'  # Enforce patient role
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField() 