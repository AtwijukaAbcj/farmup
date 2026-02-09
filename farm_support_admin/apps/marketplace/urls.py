from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProduceViewSet, OrderViewSet, SupplyProductViewSet,
    SupplyOrderViewSet, CreditTransactionViewSet, CustomerViewSet,
    ProductCategoryListAPIView
)

router = DefaultRouter()
router.register(r'produce', ProduceViewSet, basename='produce')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'supplies', SupplyProductViewSet, basename='supplyproduct')
router.register(r'supply-orders', SupplyOrderViewSet, basename='supplyorder')
router.register(r'credits', CreditTransactionViewSet, basename='credittransaction')
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
    path('categories/', ProductCategoryListAPIView.as_view(), name='productcategory-list'),
]
