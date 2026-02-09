
from django.db import models
from apps.farmers.models import Farmer
from django.contrib.auth import get_user_model

User = get_user_model()

class SellerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    business_name = models.CharField(max_length=100)
    business_address = models.TextField(blank=True)
    selfie = models.ImageField(upload_to='seller_selfies/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name or self.user.username

class ProductCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_supply = models.BooleanField(default=False, help_text="Check if this category is for supply products (tools, fertilizer, etc)")

    def __str__(self):
        return self.name

class Produce(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='produces', null=True, blank=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_produces', null=True, blank=True, limit_choices_to={'role': 'seller'})
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, limit_choices_to={'is_supply': False})
    description = models.TextField(blank=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    quantity_available = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='produce_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.farmer})"

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    produce = models.ForeignKey(Produce, on_delete=models.CASCADE, related_name='orders')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer}"

class SupplyProduct(models.Model):
    name = models.CharField(max_length=100)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_supplies', null=True, blank=True, limit_choices_to={'role': 'seller'})
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, limit_choices_to={'is_supply': True})
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    image = models.ImageField(upload_to='supply_images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class SupplyOrder(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='supply_orders')
    product = models.ForeignKey(SupplyProduct, on_delete=models.CASCADE, related_name='orders')
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    on_credit = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SupplyOrder #{self.id} by {self.farmer}"

class CreditTransaction(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='credit_transactions')
    supply_order = models.OneToOneField(SupplyOrder, on_delete=models.CASCADE, related_name='credit_transaction')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Credit for {self.supply_order} - {'Paid' if self.paid else 'Unpaid'}"
