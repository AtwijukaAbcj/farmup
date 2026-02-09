from django.contrib import admin
from .models import Animal, AnimalHealthRecord


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ['rfid_tag', 'animal_type', 'breed', 'farmer', 'health_status', 'age_months', 'is_active']
    list_filter = ['animal_type', 'health_status', 'gender', 'is_active', 'registered_date']
    search_fields = ['rfid_tag', 'name', 'farmer__first_name', 'farmer__last_name', 'breed']
    readonly_fields = ['registered_date', 'last_updated']
    
    fieldsets = (
        ('RFID & Identification', {
            'fields': ('rfid_tag', 'animal_type', 'breed', 'name')
        }),
        ('Basic Information', {
            'fields': ('gender', 'date_of_birth', 'age_months', 'color', 'weight_kg')
        }),
        ('Ownership', {
            'fields': ('farmer', 'purchase_date', 'purchase_price')
        }),
        ('Health', {
            'fields': ('health_status', 'last_vaccination_date', 'last_checkup_date', 'medical_notes')
        }),
        ('Location & Management', {
            'fields': ('current_location', 'pen_number')
        }),
        ('Lineage', {
            'fields': ('mother_rfid', 'father_rfid')
        }),
        ('Additional Information', {
            'fields': ('notes', 'is_active', 'registered_date', 'last_updated')
        }),
    )


@admin.register(AnimalHealthRecord)
class AnimalHealthRecordAdmin(admin.ModelAdmin):
    list_display = ['animal', 'record_type', 'record_date', 'veterinarian_name', 'cost', 'next_visit_date']
    list_filter = ['record_type', 'record_date']
    search_fields = ['animal__rfid_tag', 'veterinarian_name', 'diagnosis']
    readonly_fields = ['created_at']
    date_hierarchy = 'record_date'
