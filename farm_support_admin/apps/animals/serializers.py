from rest_framework import serializers
from .models import Animal, AnimalHealthRecord


class AnimalHealthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalHealthRecord
        fields = '__all__'
        read_only_fields = ['created_at']


class AnimalSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.first_name', read_only=True)
    health_records = AnimalHealthRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = Animal
        fields = '__all__'
        read_only_fields = ['registered_date', 'last_updated']


class AnimalListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    farmer_name = serializers.CharField(source='farmer.first_name', read_only=True)
    
    class Meta:
        model = Animal
        fields = [
            'id', 'rfid_tag', 'animal_type', 'breed', 'name', 'gender',
            'age_months', 'weight_kg', 'health_status', 'farmer', 'farmer_name',
            'is_active', 'registered_date'
        ]
