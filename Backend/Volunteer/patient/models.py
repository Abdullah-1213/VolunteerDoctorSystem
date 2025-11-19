from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings  # Import settings to reference AUTH_USER_MODEL

class Patient(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    cnic = models.CharField(max_length=15, unique=True, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    age = models.IntegerField(validators=[MinValueValidator(0)])
    contact = models.CharField(max_length=20)
    gender = models.CharField(max_length=10)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "patients_patient"
        
class Visit(models.Model):
    id = models.BigAutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_visits',
        limit_choices_to={'role': 'doctor'}
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')

    bp = models.CharField(max_length=10, null=True, blank=True)
    hr = models.IntegerField(null=True, blank=True)
    temp = models.FloatField(null=True, blank=True)
    spo2 = models.IntegerField(null=True, blank=True)
    introduction = models.TextField(null=True, blank=True)
    history = models.TextField(null=True, blank=True)
    examination = models.TextField(null=True, blank=True)
    investigation = models.TextField(null=True, blank=True)
    diagnosis = models.TextField(null=True, blank=True)
    treatment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Visit for {self.patient.name} by {self.doctor.full_name}"

    class Meta:
        db_table = "patients_visit"
