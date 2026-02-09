from django.contrib import admin
from .models import Farmer, FarmerDocument


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = [
        'username', 'farmer_id', 'first_name', 'last_name', 'phone_number', 'nin_number', 'email', 'status'
    ]
    list_filter = ['gender']
    search_fields = [
        'username', 'farmer_id', 'first_name', 'last_name', 'phone_number', 'nin_number', 'email'
    ]
    readonly_fields = []
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'username', 'farmer_id', 'first_name', 'middle_name', 'last_name',
                'date_of_birth', 'gender', 'phone_number', 'nin_number', 'email', 'status'
            )
        }),
    )
    
@admin.register(FarmerDocument)
class FarmerDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'farmer', 'document_type', 'document_name', 
        'uploaded_by', 'uploaded_at'
    ]
    list_filter = ['document_type', 'uploaded_at']
    search_fields = [
        'farmer__farmer_id', 'farmer__first_name', 'farmer__last_name',
        'document_name'
    ]
    readonly_fields = ['uploaded_at']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('farmer', 'uploaded_by')