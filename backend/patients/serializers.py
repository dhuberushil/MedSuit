from rest_framework import serializers
from .models import Patient, MedicalRecord


class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'diagnosis', 'prescription', 'notes', 'visit_date', 'created_at']
        read_only_fields = ['id', 'doctor', 'created_at']

    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.get_full_name()
        return 'Unknown'


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name', 'date_of_birth',
            'gender', 'blood_group', 'phone', 'email', 'address', 'allergies',
            'chronic_conditions', 'emergency_contact_name', 'emergency_contact_phone',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientDetailSerializer(PatientSerializer):
    medical_records = MedicalRecordSerializer(many=True, read_only=True)

    class Meta(PatientSerializer.Meta):
        fields = PatientSerializer.Meta.fields + ['medical_records']
