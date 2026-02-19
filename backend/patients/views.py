from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Patient, MedicalRecord
from .serializers import PatientSerializer, PatientDetailSerializer, MedicalRecordSerializer
from accounts.permissions import IsAdmin, IsAdminOrReceptionist


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    filterset_fields = ['gender', 'blood_group']
    ordering_fields = ['first_name', 'last_name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PatientDetailSerializer
        return PatientSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'receptionist'):
            return Patient.objects.all()
        if user.role == 'doctor':
            return Patient.objects.filter(
                appointments__doctor=user
            ).distinct()
        if user.role == 'patient':
            return Patient.objects.filter(user=user)
        return Patient.objects.none()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdminOrReceptionist()]
        return super().get_permissions()

    @action(detail=True, methods=['get', 'post'])
    def medical_records(self, request, pk=None):
        patient = self.get_object()
        if request.method == 'GET':
            records = patient.medical_records.all()
            serializer = MedicalRecordSerializer(records, many=True)
            return Response(serializer.data)

        # Only doctors and admins can create medical records
        if request.user.role not in ('doctor', 'admin'):
            return Response(
                {'detail': 'Only doctors can create medical records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = MedicalRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(patient=patient, doctor=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
