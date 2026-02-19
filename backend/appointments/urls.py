from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.AppointmentViewSet, basename='appointments')

urlpatterns = [
    path('doctors/<int:doctor_id>/availability/', views.doctor_availability, name='doctor-availability'),
    path('', include(router.urls)),
]
