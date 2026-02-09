from django.contrib import admin
from .models import Produce, SupplyProduct, Order, SupplyOrder, CreditTransaction, Customer, ProductCategory
@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_supply', 'description')
    search_fields = ('name',)
    list_filter = ('is_supply',)

@admin.register(Produce)
class ProduceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'farmer', 'price_per_unit', 'unit', 'quantity_available', 'is_active', 'created_at')
    search_fields = ('name', 'category__name', 'farmer__first_name', 'farmer__last_name')
    list_filter = ('category', 'is_active')

@admin.register(SupplyProduct)
class SupplyProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active')
    search_fields = ('name', 'category__name')
    list_filter = ('category', 'is_active')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('produce', 'customer', 'quantity', 'total_price', 'status', 'created_at')
    search_fields = ('produce__name', 'customer__user__username')
    list_filter = ('status',)

@admin.register(SupplyOrder)
class SupplyOrderAdmin(admin.ModelAdmin):
    list_display = ('product', 'farmer', 'quantity', 'total_price', 'on_credit', 'status', 'created_at')
    search_fields = ('product__name', 'farmer__first_name', 'farmer__last_name')
    list_filter = ('status', 'on_credit')

@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ('farmer', 'supply_order', 'amount', 'paid', 'created_at', 'paid_at')
    search_fields = ('farmer__first_name', 'farmer__last_name', 'supply_order__id')
    list_filter = ('paid',)

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'address', 'joined_at')
    search_fields = ('user__username', 'phone_number')
    list_filter = ('joined_at',)
