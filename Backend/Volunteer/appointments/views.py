from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from accounts.models import User
from .models import DoctorAvailability, Appointment
from rest_framework.exceptions import PermissionDenied

from .serializers import (
    DoctorAvailabilitySerializer,
    AppointmentSerializer,
    DoctorListSerializer
)
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class AppointmentStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only doctor of this appointment can update the status
        if appointment.doctor != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get("status")
        if new_status not in ["pending", "approved", "rejected"]:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = new_status
        appointment.save()
        return Response({"detail": "Status updated successfully."}, status=status.HTTP_200_OK)
# Doctor manually creates one availability slot
class DoctorAvailabilityCreateView(generics.CreateAPIView):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'doctor':
            raise ValidationError("Only doctors can create availability slots.")
        serializer.save(doctor=self.request.user)

# View all free slots (filtered by doctor_id)
class AvailableSlotsListView(generics.ListAPIView):
    serializer_class = DoctorAvailabilitySerializer

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        queryset = DoctorAvailability.objects.filter(
            is_booked=False,
            start_time__gte=timezone.now()
        )
        if doctor_id:
            queryset = queryset.filter(doctor__id=doctor_id, doctor__role='doctor')
        return queryset

# Patient books appointment
class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'patient':
            raise ValidationError("Only patients can book appointments.")
        
        slot = serializer.validated_data['slot']
        if slot.is_booked:
            raise ValidationError("This slot is already booked.")
        
        # Mark slot as booked
        slot.is_booked = True
        slot.save()

        # Save appointment with patient and doctor from slot
        serializer.save(patient=user, doctor=slot.doctor)

# Doctor sets multiple 15-min (or any duration) slots
class DoctorAvailabilitySplitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'doctor':
            raise ValidationError("Only doctors can create availability slots.")
        start_time = datetime.fromisoformat(request.data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(request.data['end_time'].replace('Z', '+00:00'))
        duration = int(request.data['duration'])

        slots_created = []
        current = start_time
        while current + timedelta(minutes=duration) <= end_time:
            slot = DoctorAvailability.objects.create(
                doctor=request.user,
                start_time=current,
                end_time=current + timedelta(minutes=duration)
            )
            slots_created.append(slot)
            current += timedelta(minutes=duration)

        serializer = DoctorAvailabilitySerializer(slots_created, many=True)
        return Response(serializer.data)

# Doctor sees their appointments
class DoctorAppointmentsListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Authentication credentials were not provided.")
        if user.role != 'doctor':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can view their appointments.")
        return Appointment.objects.filter(
            slot__doctor=user
        ).select_related('patient', 'slot')

# Patient views their appointments
class PatientAppointmentsListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'patient':
            raise ValidationError("Only patients can view their appointments.")
        qs = Appointment.objects.filter(patient=user).order_by('-id').select_related('doctor', 'slot')
        print(f"Appointments for patient {user}: {qs}")
        return qs

# Patient views all doctors
class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print(f"Fetching doctors for user: {self.request.user}")  # Debug
        queryset = User.objects.filter(role='doctor', is_verified=True)
        print(f"Found doctors: {queryset}")  # Debug
        return queryset