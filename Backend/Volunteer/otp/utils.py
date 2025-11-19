from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
import random

def send_otp(user):
    otp = str(random.randint(100000, 999999))
    email_otp, created = EmailOTP.objects.get_or_create(user=user)
    email_otp.otp = otp
    email_otp.save()

    subject = "Your OTP Verification Code"
    message = f"Your OTP is {otp}. It is valid for 10 minutes."

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
