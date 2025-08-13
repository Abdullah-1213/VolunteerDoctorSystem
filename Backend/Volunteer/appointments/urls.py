from django.urls import path
from .views import (
    DoctorAvailabilityCreateView,
    AvailableSlotsListView,
    AppointmentCreateView,
    DoctorAvailabilitySplitView,
    DoctorAppointmentsListView,
    PatientAppointmentsListView,
    DoctorListView
)
from .views import AppointmentStatusUpdateView
urlpatterns = [
    path('api/availability/create/', DoctorAvailabilityCreateView.as_view(), name='availability-create'),
     path('api/appointments/<int:pk>/update-status/', AppointmentStatusUpdateView.as_view(), name='appointment-status-update'),
    path('api/availability/', AvailableSlotsListView.as_view(), name='available-slots'),
    path('api/appointments/create/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('api/availability/split/', DoctorAvailabilitySplitView.as_view(), name='availability-split'),
    path('api/appointments/doctor/', DoctorAppointmentsListView.as_view(), name='doctor-appointments'),
    path('api/appointments/patient/', PatientAppointmentsListView.as_view(), name='patient-appointments'),
    path('api/doctors/', DoctorListView.as_view(), name='doctor-list'),
]