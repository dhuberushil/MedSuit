from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('patient-stats/', views.patient_stats_view, name='patient-stats'),
    path('appointment-stats/', views.appointment_stats_view, name='appointment-stats'),
    path('revenue-stats/', views.revenue_stats_view, name='revenue-stats'),
]
