from django.contrib import admin
from .models import Activity

class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'crop_type', 'planting_date', 'expected_harvest_date', 'estimated_yield', 'get_land_name', 'get_farmer')
    list_filter = ('land', 'land__farmer')
    search_fields = ('crop_type', 'notes', 'land__farm_name', 'land__farmer__first_name', 'land__farmer__last_name')

    def get_farmer(self, obj):
        return obj.land.farmer
    get_farmer.short_description = 'Farmer'
    get_farmer.admin_order_field = 'land__farmer'

    def get_land_name(self, obj):
        return obj.land.farm_name if hasattr(obj.land, 'farm_name') else str(obj.land)
    get_land_name.short_description = 'Land Name'
    get_land_name.admin_order_field = 'land__farm_name'

admin.site.register(Activity, ActivityAdmin)
