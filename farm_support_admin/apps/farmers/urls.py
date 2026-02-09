from django.urls import path
from . import views

app_name = 'farmers'

urlpatterns = [
    # Farmer URLs
    path('', views.FarmerListCreateView.as_view(), name='farmer_list_create'),
    path('<str:farmer_id>/', views.FarmerDetailView.as_view(), name='farmer_detail'),
    path('stats/', views.farmer_stats_view, name='farmer_stats'),
    path('bulk-update-status/', views.bulk_update_farmer_status, name='bulk_update_status'),
    
    # Farmer Document URLs
    path('<str:farmer_id>/documents/', views.FarmerDocumentListCreateView.as_view(), name='farmer_documents'),
    path('<str:farmer_id>/documents/<int:pk>/', views.FarmerDocumentDetailView.as_view(), name='farmer_document_detail'),
]