from django.urls import path
from .views import DoctorSignupView, PatientSignupView, LoginView

urlpatterns = [
    path('api/doctor/signup/', DoctorSignupView.as_view(), name='doctor-signup'),
    path('api/patient/signup/', PatientSignupView.as_view(), name='patient-signup'),
    path('api/login/', LoginView.as_view(), name='login'),
]