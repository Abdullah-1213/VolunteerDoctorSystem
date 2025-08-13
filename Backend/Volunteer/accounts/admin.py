from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.core.mail import send_mail
from django.conf import settings
import logging

from accounts.models import User

# Set up logging
logger = logging.getLogger(__name__)

class DoctorUserAdmin(UserAdmin):
    list_display = ('full_name', 'email', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active')
    search_fields = ('full_name', 'email', 'medical_license_number')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone_number', 'role')}),
        ('Doctor Info', {'fields': ('specialization', 'hospital_name', 'medical_license_number', 'license_file', 'is_verified')}),
        ('Patient Info', {'fields': ('address', 'date_of_birth')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('created_at',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'phone_number', 'role', 'password1', 'password2'),
        }),
    )

    # ✅ Action to verify multiple doctors at once
    @admin.action(description="Verify selected doctors")
    def verify_doctors(self, request, queryset):
        count = 0
        for doctor in queryset:
            if doctor.role == 'doctor' and not doctor.is_verified:
                doctor.is_verified = True
                doctor.save()
                self.send_verification_email(doctor)
                count += 1
        self.message_user(request, f"{count} doctor(s) have been verified and notified.")

    actions = [verify_doctors]

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = super().get_readonly_fields(request, obj)
        if not request.user.is_superuser:
            return readonly_fields + ('is_verified',)
        return readonly_fields

    def save_model(self, request, obj, form, change):
        if change:
            original_obj = User.objects.get(pk=obj.pk)
            if obj.role == 'doctor' and obj.is_verified and not original_obj.is_verified:
                self.send_verification_email(obj)
        super().save_model(request, obj, form, change)

    def send_verification_email(self, user):
        subject = 'Your Doctor Account Has Been Verified'
        message = f"""
        Dear {user.full_name},

        Congratulations! Your doctor account has been verified by the admin.
        You can now log in to the system using your credentials.

        Email: {user.email}
        Specialization: {user.specialization or 'Not specified'}
        Hospital: {user.hospital_name or 'Not specified'}

        Please contact support if you have any questions.

        Regards,
        Your Healthcare Platform Team
        """
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]

        try:
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
            logger.info(f"Verification email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")

    def get_queryset(self, request):
        return super().get_queryset(request)

admin.site.register(User, DoctorUserAdmin)
