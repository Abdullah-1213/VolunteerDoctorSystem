from django.contrib import admin
from .models import Patient, Visit

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("name", "cnic", "age", "gender", "contact", "address")
    search_fields = ("name", "cnic")

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "bp", "hr", "temp", "spo2", "date")
    list_filter = ("doctor", "patient")
    search_fields = ("patient__name", "doctor__name")