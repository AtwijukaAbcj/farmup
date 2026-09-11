from rest_framework import serializers
from .models import ProductCategory, SellerProfile, Produce, Order, SupplyProduct, SupplyOrder, CreditTransaction, Customer

# ProductCategory serializer for category listing
class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'is_supply']

# SellerProfile serializer
class SellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    selfie_url = serializers.SerializerMethodField()

    class Meta:
        model = SellerProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'business_name', 'business_address', 'phone_number', 'selfie', 'selfie_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_selfie_url(self, obj):
        if obj.selfie:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.selfie.url)
            return obj.selfie.url
        return None

class ProduceSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Produce
        fields = ['id', 'name', 'description', 'price_per_unit', 'unit', 'quantity_available', 
                  'image', 'image2', 'image3', 'image_url', 'image2_url', 'image3_url',
                  'farmer', 'seller', 'farmer_name', 'location', 'is_active', 'created_at', 'category']
        read_only_fields = ['farmer', 'seller']  # These are set automatically in the view
        extra_kwargs = {
            'image': {'write_only': True, 'required': False},
            'image2': {'write_only': True, 'required': False},
            'image3': {'write_only': True, 'required': False}
        }
    
    def get_farmer_name(self, obj):
        if obj.farmer:
            return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip() or obj.farmer.farmer_id
        if obj.seller:
            return f"{obj.seller.first_name} {obj.seller.last_name}".strip() or obj.seller.username
        return "Local Farmer"
    
    def get_location(self, obj):
        if obj.farmer and hasattr(obj.farmer, 'district'):
            return obj.farmer.district or "Uganda"
        return "Uganda"
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        # Return placeholder image
        return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"
    
    def get_image2_url(self, obj):
        if obj.image2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image2.url)
            return obj.image2.url
        return None
    
    def get_image3_url(self, obj):
        if obj.image3:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image3.url)
            return obj.image3.url
        return None
    
    def to_representation(self, instance):
        """Override to include image URLs as 'image', 'image2', 'image3' in response"""
        ret = super().to_representation(instance)
        ret['image'] = ret.pop('image_url', None)
        ret['image2'] = ret.pop('image2_url', None)
        ret['image3'] = ret.pop('image3_url', None)
        return ret

class OrderSerializer(serializers.ModelSerializer):
    produce_name = serializers.CharField(source='produce.name', read_only=True)
    customer_name = serializers.CharField(source='customer.user.username', read_only=True)
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['customer', 'total_price', 'status', 'trustpay_session_id', 'payment_status']

class SupplyProductSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplyProduct
        fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'image2', 'image3',
                  'image_url', 'image2_url', 'image3_url', 'vendor', 'seller', 'is_active', 'category']
        read_only_fields = ['seller']  # Set automatically in the view
        extra_kwargs = {
            'image': {'write_only': True, 'required': False},
            'image2': {'write_only': True, 'required': False},
            'image3': {'write_only': True, 'required': False}
        }
    
    def get_vendor(self, obj):
        if obj.seller:
            if hasattr(obj.seller, 'seller_profile') and obj.seller.seller_profile.business_name:
                return obj.seller.seller_profile.business_name
            return f"{obj.seller.first_name} {obj.seller.last_name}".strip() or obj.seller.username
        return "FarmUp Supplies"
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        # Return placeholder image
        return "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80"
    
    def get_image2_url(self, obj):
        if obj.image2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image2.url)
            return obj.image2.url
        return None
    
    def get_image3_url(self, obj):
        if obj.image3:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image3.url)
            return obj.image3.url
        return None
    
    def to_representation(self, instance):
        """Override to include image URLs as 'image', 'image2', 'image3' in response"""
        ret = super().to_representation(instance)
        ret['image'] = ret.pop('image_url', None)
        ret['image2'] = ret.pop('image2_url', None)
        ret['image3'] = ret.pop('image3_url', None)
        return ret

class SupplyOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.first_name', read_only=True)
    class Meta:
        model = SupplyOrder
        fields = '__all__'
        read_only_fields = ['farmer']  # Set automatically in the view

class CreditTransactionSerializer(serializers.ModelSerializer):
    supply_order_id = serializers.IntegerField(source='supply_order.id', read_only=True)
    class Meta:
        model = CreditTransaction
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Customer
        fields = '__all__'
