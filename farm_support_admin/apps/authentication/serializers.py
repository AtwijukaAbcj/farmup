from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
from apps.farmers.models import Farmer


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'role', 'phone')
    
    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password != password_confirm:
            raise serializers.ValidationError("Passwords don't match")
        # Password strength validation
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(password)
        except Exception as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        user = User.objects.create_user(password=password, **validated_data)
        # Also create Farmer profile if needed
        from apps.farmers.models import Farmer
        farmer_data = {
            'username': validated_data.get('username'),
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
            'email': validated_data.get('email'),
            'phone_number': validated_data.get('phone'),
            'password': password,
        }
        Farmer.objects.create(user=user, **{k: v for k, v in farmer_data.items() if v is not None})
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        if username and password:
            from apps.farmers.models import Farmer
            from django.contrib.auth import authenticate
            try:
                user = User.objects.get(username=username)  # Ensure we get User instance
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
            # Check password first
            if not user.check_password(password):
                raise serializers.ValidationError('Invalid username or password')
            # Only require Farmer profile for users with role 'user' or 'farmer'
            # Skip farmer profile check for admin, seller, field_officer roles
            if user.role in ['user', 'farmer']:
                try:
                    farmer = Farmer.objects.get(user=user)
                    if farmer.status != 'active':
                        raise serializers.ValidationError('Your account is not approved yet.')
                except Farmer.DoesNotExist:
                    # Allow login but user will need to register as farmer
                    pass
            attrs['user'] = user  # Always return User instance
        else:
            raise serializers.ValidationError('Must provide username and password')
        return attrs



# For Farmer login response
class FarmerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='user.role', read_only=True)
    selfie_url = serializers.SerializerMethodField()
    total_land_area = serializers.SerializerMethodField()

    class Meta:
        model = Farmer
        fields = (
            'id', 'username', 'first_name', 'last_name', 'middle_name', 'full_name',
            'date_of_birth', 'gender', 'phone_number', 'nin_number', 'email', 'farmer_id', 
            'status', 'role', 'selfie', 'selfie_url', 'total_land_area'
        )
        read_only_fields = ('id', 'username', 'farmer_id', 'status', 'role')

    def get_first_name(self, obj):
        # Use farmer's first_name if available, otherwise fallback to user's
        if obj.first_name:
            return obj.first_name
        elif obj.user and obj.user.first_name:
            return obj.user.first_name
        return obj.username

    def get_last_name(self, obj):
        # Use farmer's last_name if available, otherwise fallback to user's
        if obj.last_name:
            return obj.last_name
        elif obj.user and obj.user.last_name:
            return obj.user.last_name
        return ''

    def get_full_name(self, obj):
        # Use farmer's name if available, otherwise fallback to user's name
        first = self.get_first_name(obj)
        last = self.get_last_name(obj)
        if obj.middle_name:
            return f"{first} {obj.middle_name} {last}".strip()
        return f"{first} {last}".strip() or obj.username

    def get_selfie_url(self, obj):
        if hasattr(obj, 'selfie') and obj.selfie:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.selfie.url)
            return obj.selfie.url
        return None

    def get_total_land_area(self, obj):
        from apps.lands.models import Land
        lands = Land.objects.filter(farmer=obj)
        return sum(float(land.size) for land in lands if land.size)

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'role', 'phone', 'is_active', 'last_login', 'date_joined')
        read_only_fields = ('id', 'username', 'role', 'is_active', 'last_login', 'date_joined')


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs