from .models import ProductCategory
from .serializers import ProductCategorySerializer

# API view for listing product categories
from rest_framework import generics
from rest_framework.permissions import AllowAny

class ProductCategoryListAPIView(generics.ListAPIView):
    serializer_class = ProductCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ProductCategory.objects.all()
        is_supply = self.request.query_params.get('is_supply')
        if is_supply is not None:
            if is_supply.lower() == 'true':
                queryset = queryset.filter(is_supply=True)
            elif is_supply.lower() == 'false':
                queryset = queryset.filter(is_supply=False)
        return queryset
from decimal import Decimal
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Produce, Order, SupplyProduct, SupplyOrder, CreditTransaction, Customer
from .serializers import (
    ProduceSerializer, OrderSerializer, SupplyProductSerializer,
    SupplyOrderSerializer, CreditTransactionSerializer, CustomerSerializer
)

class ProduceViewSet(viewsets.ModelViewSet):
    queryset = Produce.objects.filter(is_active=True)
    serializer_class = ProduceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        # If user is a farmer, set the farmer field
        if hasattr(user, 'farmer_profile'):
            serializer.save(farmer=user.farmer_profile)
        # If user is a seller, set the seller field
        elif user.role == 'seller':
            serializer.save(seller=user)
        else:
            serializer.save()

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If 'mine' query param is present, filter for current user's orders
        if self.request.query_params.get('mine') == 'true':
            try:
                customer = Customer.objects.get(user=user)
                return Order.objects.filter(customer=customer).order_by('-created_at')
            except Customer.DoesNotExist:
                return Order.objects.none()
        # Check if user is a farmer/seller - show orders for their products
        if self.request.query_params.get('seller') == 'true':
            if hasattr(user, 'farmer_profile'):
                return Order.objects.filter(produce__farmer=user.farmer_profile).order_by('-created_at')
            elif user.role == 'seller':
                return Order.objects.filter(produce__seller=user).order_by('-created_at')
        return Order.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        # Get or create a Customer for the logged-in user
        customer, created = Customer.objects.get_or_create(
            user=user,
            defaults={'phone_number': '', 'address': ''}
        )
        produce = serializer.validated_data['produce']
        quantity = serializer.validated_data['quantity']
        if quantity <= 0 or quantity > produce.quantity_available:
            raise ValidationError({'quantity': 'Requested quantity is not available.'})
        serializer.save(
            customer=customer,
            total_price=(produce.price_per_unit * Decimal(quantity)).quantize(Decimal('0.01')),
        )

class SupplyProductViewSet(viewsets.ModelViewSet):
    queryset = SupplyProduct.objects.filter(is_active=True)
    serializer_class = SupplyProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        # If user is a seller, set the seller field
        if user.role == 'seller':
            serializer.save(seller=user)
        else:
            serializer.save()

class SupplyOrderViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If 'mine' query param is present, filter for current user's orders
        if self.request.query_params.get('mine') == 'true':
            if hasattr(user, 'farmer_profile'):
                return SupplyOrder.objects.filter(farmer=user.farmer_profile).order_by('-created_at')
            return SupplyOrder.objects.none()
        # Check if user is a seller - show orders for their products
        if self.request.query_params.get('seller') == 'true':
            if user.role == 'seller':
                return SupplyOrder.objects.filter(product__seller=user).order_by('-created_at')
        return SupplyOrder.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        # Get the farmer profile for the logged-in user
        if hasattr(user, 'farmer_profile'):
            serializer.save(farmer=user.farmer_profile)
        else:
            serializer.save()

class CreditTransactionViewSet(viewsets.ModelViewSet):
    queryset = CreditTransaction.objects.all()
    serializer_class = CreditTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
