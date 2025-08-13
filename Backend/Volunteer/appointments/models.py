from django.db import models
from django.utils import timezone
from accounts.models import User

class DoctorAvailability(models.Model):
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='available_slots',
        limit_choices_to={'role': 'doctor'}
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.doctor.full_name} | {self.start_time} - {self.end_time}"

class Appointment(models.Model):
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments_as_doctor',
        limit_choices_to={'role': 'doctor'}
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient',
        limit_choices_to={'role': 'patient'}
    )
    slot = models.OneToOneField(DoctorAvailability, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )
    booked_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Appointment: {self.patient.full_name} with {self.doctor.full_name} at {self.slot.start_time}"