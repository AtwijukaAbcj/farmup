from .models import ProductCategory
from .serializers import ProductCategorySerializer

# API view for listing product categories
from rest_framework import generics

class ProductCategoryListAPIView(generics.ListAPIView):
    serializer_class = ProductCategorySerializer

    def get_queryset(self):
        queryset = ProductCategory.objects.all()
        is_supply = self.request.query_params.get('is_supply')
        if is_supply is not None:
            if is_supply.lower() == 'true':
                queryset = queryset.filter(is_supply=True)
            elif is_supply.lower() == 'false':
                queryset = queryset.filter(is_supply=False)
        return queryset
from rest_framework import viewsets, permissions
from .models import Produce, Order, SupplyProduct, SupplyOrder, CreditTransaction, Customer
from .serializers import (
    ProduceSerializer, OrderSerializer, SupplyProductSerializer,
    SupplyOrderSerializer, CreditTransactionSerializer, CustomerSerializer
)

class ProduceViewSet(viewsets.ModelViewSet):
    queryset = Produce.objects.filter(is_active=True)
    serializer_class = ProduceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class SupplyProductViewSet(viewsets.ModelViewSet):
    queryset = SupplyProduct.objects.filter(is_active=True)
    serializer_class = SupplyProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SupplyOrderViewSet(viewsets.ModelViewSet):
    queryset = SupplyOrder.objects.all()
    serializer_class = SupplyOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class CreditTransactionViewSet(viewsets.ModelViewSet):
    queryset = CreditTransaction.objects.all()
    serializer_class = CreditTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
