from django.urls import path
from .views import CheckCnicView, RegisterPatientView, PatientRecordsView

urlpatterns = [
    path("check-cnic/", CheckCnicView.as_view(), name="check-cnic"),
    path("register-patient/", RegisterPatientView.as_view(), name="register-patient"),
    path("patient-records/", PatientRecordsView.as_view(), name="patient-records"),
    path("patient-records/<int:pk>/", PatientRecordsView.as_view(), name="patient-record-detail"),
]