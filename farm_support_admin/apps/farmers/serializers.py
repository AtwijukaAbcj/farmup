from rest_framework import serializers
from .models import Farmer, FarmerDocument


class FarmerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    # registered_by_name removed
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'farmer_id', 'first_name', 'middle_name', 'last_name', 'full_name',
            'date_of_birth', 'age', 'gender', 'phone_number', 'nin_number', 'email',
            'username', 'status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'farmer_id']

    def validate_username(self, value):
        if Farmer.objects.filter(username=value).exists():
            raise serializers.ValidationError("A farmer with this username already exists.")
        return value
    # Removed aadhar_number and pan_number validation since fields are now optional
    def validate_phone_number(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")
        return value


class FarmerCreateSerializer(FarmerSerializer):
    def create(self, validated_data):
        # username is now required
        if 'username' not in validated_data or not validated_data['username']:
            raise serializers.ValidationError({'username': 'This field is required as the username.'})
        return super().create(validated_data)
    class Meta(FarmerSerializer.Meta):
        read_only_fields = FarmerSerializer.Meta.read_only_fields + ['farmer_id']
        fields = FarmerSerializer.Meta.fields


class FarmerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for farmer list views"""
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'farmer_id', 'full_name', 'age', 'phone_number'
        ]


class FarmerDocumentSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = FarmerDocument
        fields = [
            'id', 'farmer', 'farmer_name', 'document_type', 'document_name',
            'document_file', 'uploaded_by', 'uploaded_by_name', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']


class FarmerStatsSerializer(serializers.Serializer):
    """Serializer for farmer statistics"""
    total_farmers = serializers.IntegerField()
    active_farmers = serializers.IntegerField()
    inactive_farmers = serializers.IntegerField()
    suspended_farmers = serializers.IntegerField()
    farmers_by_district = serializers.DictField()
    farmers_by_gender = serializers.DictField()
    total_land_area = serializers.DecimalField(max_digits=15, decimal_places=2)
    avg_land_per_farmer = serializers.DecimalField(max_digits=10, decimal_places=2)