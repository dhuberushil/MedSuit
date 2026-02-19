from django.contrib import admin
from .models import Patient, MedicalRecord


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'gender', 'blood_group', 'phone', 'created_at']
    list_filter = ['gender', 'blood_group']
    search_fields = ['first_name', 'last_name', 'phone', 'email']


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'diagnosis', 'visit_date', 'created_at']
    list_filter = ['visit_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'diagnosis']
