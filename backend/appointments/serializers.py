from rest_framework import serializers
from .models import Appointment
from datetime import datetime, timedelta


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'date', 'start_time', 'end_time', 'status', 'reason', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name()

    def validate(self, data):
        # Auto-calculate end_time as 30 minutes after start_time
        if 'start_time' in data and 'end_time' not in data:
            start = datetime.combine(datetime.today(), data['start_time'])
            data['end_time'] = (start + timedelta(minutes=30)).time()

        # Check for double-booking
        doctor = data.get('doctor', getattr(self.instance, 'doctor', None))
        date = data.get('date', getattr(self.instance, 'date', None))
        start_time = data.get('start_time', getattr(self.instance, 'start_time', None))

        if doctor and date and start_time:
            qs = Appointment.objects.filter(
                doctor=doctor, date=date, start_time=start_time
            ).exclude(status='cancelled')
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('This time slot is already booked.')

        # Validate status transitions
        if self.instance and 'status' in data:
            if not self.instance.can_transition_to(data['status']):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{data['status']}'."
                )

        return data


class AvailabilitySerializer(serializers.Serializer):
    time = serializers.TimeField()
    available = serializers.BooleanField()
