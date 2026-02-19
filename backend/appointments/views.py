from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import time, timedelta, datetime
from django.contrib.auth import get_user_model
from .models import Appointment
from .serializers import AppointmentSerializer

User = get_user_model()


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'doctor', 'patient', 'date']
    search_fields = ['patient__first_name', 'patient__last_name', 'reason']
    ordering_fields = ['date', 'start_time', 'created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related('patient', 'doctor')
        if user.role == 'doctor':
            qs = qs.filter(doctor=user)
        elif user.role == 'patient':
            qs = qs.filter(patient__user=user)
        return qs

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Return appointments formatted for calendar view."""
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        qs = self.get_queryset()
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_availability(request, doctor_id):
    """Get available 30-min slots for a doctor on a given date."""
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'detail': 'date parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        User.objects.get(pk=doctor_id, role='doctor')
    except User.DoesNotExist:
        return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

    booked = set(
        Appointment.objects.filter(
            doctor_id=doctor_id, date=date_str
        ).exclude(status='cancelled').values_list('start_time', flat=True)
    )

    slots = []
    current = time(9, 0)
    end = time(17, 0)
    while current < end:
        slots.append({
            'time': current.strftime('%H:%M'),
            'available': current not in booked,
        })
        dt = datetime.combine(datetime.today(), current) + timedelta(minutes=30)
        current = dt.time()

    return Response(slots)
