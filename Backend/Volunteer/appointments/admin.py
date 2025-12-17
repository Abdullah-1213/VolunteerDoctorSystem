from django.contrib import admin

# Register your models here.
from .models import Appointment,DoctorAvailability
admin.site.register(Appointment)
admin.site.register(DoctorAvailability)