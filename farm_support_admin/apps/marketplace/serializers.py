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
    farmer = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Produce
        fields = ['id', 'name', 'description', 'price_per_unit', 'unit', 'quantity_available', 
                  'image', 'farmer', 'location', 'is_active', 'created_at', 'category']
    
    def get_farmer(self, obj):
        if obj.farmer:
            return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip() or obj.farmer.farmer_id
        if obj.seller:
            return f"{obj.seller.first_name} {obj.seller.last_name}".strip() or obj.seller.username
        return "Local Farmer"
    
    def get_location(self, obj):
        if obj.farmer and hasattr(obj.farmer, 'district'):
            return obj.farmer.district or "Uganda"
        return "Uganda"
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        # Return placeholder image
        return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"

class OrderSerializer(serializers.ModelSerializer):
    produce_name = serializers.CharField(source='produce.name', read_only=True)
    customer_name = serializers.CharField(source='customer.user.username', read_only=True)
    class Meta:
        model = Order
        fields = '__all__'

class SupplyProductSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplyProduct
        fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'vendor', 'is_active', 'category']
    
    def get_vendor(self, obj):
        if obj.seller:
            if hasattr(obj.seller, 'seller_profile') and obj.seller.seller_profile.business_name:
                return obj.seller.seller_profile.business_name
            return f"{obj.seller.first_name} {obj.seller.last_name}".strip() or obj.seller.username
        return "FarmUp Supplies"
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        # Return placeholder image
        return "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80"

class SupplyOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.first_name', read_only=True)
    class Meta:
        model = SupplyOrder
        fields = '__all__'

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
