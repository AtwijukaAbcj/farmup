from rest_framework import serializers
from .models import Land

class LandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Land
        fields = ['id', 'farmer', 'farm_name', 'total_area', 'latitude', 'longitude', 'created_at']