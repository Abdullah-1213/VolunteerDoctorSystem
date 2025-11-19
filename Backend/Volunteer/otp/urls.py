from django.urls import path
from .views import VerifyOTP

urlpatterns = [
    path("verify/", VerifyOTP.as_view()),
]
