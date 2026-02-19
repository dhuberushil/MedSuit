from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from patients.models import Patient
from appointments.models import Appointment
from billing.models import Invoice
from accounts.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    today = timezone.now().date()

    data = {
        'total_patients': Patient.objects.count(),
        'total_doctors': User.objects.filter(role='doctor', is_active=True).count(),
        'total_appointments_today': Appointment.objects.filter(date=today).exclude(status='cancelled').count(),
        'pending_appointments': Appointment.objects.filter(status__in=['scheduled', 'confirmed']).count(),
    }

    # Revenue
    data['total_revenue'] = float(
        Invoice.objects.filter(status='paid').aggregate(total=Sum('total'))['total'] or 0
    )

    # Recent patients
    from patients.serializers import PatientSerializer
    recent_patients = Patient.objects.all()[:5]
    data['recent_patients'] = PatientSerializer(recent_patients, many=True).data

    # Recent appointments
    from appointments.serializers import AppointmentSerializer
    recent_appts = Appointment.objects.select_related('patient', 'doctor').all()[:5]
    data['recent_appointments'] = AppointmentSerializer(recent_appts, many=True).data

    # Role-specific filtering
    if user.role == 'doctor':
        data['total_appointments_today'] = Appointment.objects.filter(
            doctor=user, date=today
        ).exclude(status='cancelled').count()
        data['pending_appointments'] = Appointment.objects.filter(
            doctor=user, status__in=['scheduled', 'confirmed']
        ).count()
        data['my_patients'] = Patient.objects.filter(appointments__doctor=user).distinct().count()

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_stats_view(request):
    gender_dist = list(
        Patient.objects.values('gender').annotate(count=Count('id')).order_by('gender')
    )
    blood_dist = list(
        Patient.objects.exclude(blood_group='').values('blood_group').annotate(count=Count('id')).order_by('blood_group')
    )
    monthly_registrations = list(
        Patient.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=365)
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(count=Count('id')).order_by('month')
    )
    return Response({
        'gender_distribution': gender_dist,
        'blood_group_distribution': blood_dist,
        'monthly_registrations': [
            {'month': item['month'].strftime('%Y-%m'), 'count': item['count']}
            for item in monthly_registrations
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_stats_view(request):
    status_dist = list(
        Appointment.objects.values('status').annotate(count=Count('id')).order_by('status')
    )
    monthly = list(
        Appointment.objects.filter(
            date__gte=timezone.now().date() - timedelta(days=365)
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(count=Count('id')).order_by('month')
    )
    return Response({
        'status_distribution': status_dist,
        'monthly_appointments': [
            {'month': item['month'].strftime('%Y-%m'), 'count': item['count']}
            for item in monthly
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_stats_view(request):
    monthly_revenue = list(
        Invoice.objects.filter(
            status='paid',
            created_at__gte=timezone.now() - timedelta(days=365)
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total')
        ).order_by('month')
    )
    by_status = list(
        Invoice.objects.values('status').annotate(
            count=Count('id'), total=Sum('total')
        ).order_by('status')
    )
    return Response({
        'monthly_revenue': [
            {'month': item['month'].strftime('%Y-%m'), 'revenue': float(item['revenue'] or 0)}
            for item in monthly_revenue
        ],
        'by_status': [
            {'status': item['status'], 'count': item['count'], 'total': float(item['total'] or 0)}
            for item in by_status
        ],
    })
