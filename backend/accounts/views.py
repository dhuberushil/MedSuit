from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    UserUpdateSerializer, AdminUserSerializer, DoctorProfileSerializer,
)
from .models import DoctorProfile
from .permissions import IsAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me_view(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()
    return Response({'detail': 'Password updated successfully.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # With JWT we just tell the client to remove tokens
    return Response({'detail': 'Successfully logged out.'})


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DoctorProfile.objects.select_related('user').filter(user__is_active=True)
        if self.request.query_params.get('available') == 'true':
            qs = qs.filter(is_available=True)
        return qs


class DoctorDetailView(generics.RetrieveAPIView):
    queryset = DoctorProfile.objects.select_related('user')
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]
