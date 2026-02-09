from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Farmer(models.Model):
    """
    Farmer model. farmer_id is auto-generated on save. nin_number is required and unique.
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile', null=True, blank=True)
    password = models.CharField(max_length=128, blank=True, null=True, help_text='Store raw password for linking to User')
    farmer_id = models.CharField(max_length=20, unique=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15, unique=True)
    nin_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    selfie = models.ImageField(upload_to='farmer_selfies/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive')
    def __str__(self):
        return f"{self.username} - {self.first_name} {self.last_name}"

    def full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def save(self, *args, **kwargs):
        import uuid
        # Always generate farmer_id if not set (to avoid UNIQUE constraint on empty strings)
        if not self.farmer_id:
            # Generate unique farmer_id with prefix based on status
            prefix = 'FARM' if self.status == 'active' else 'PEND'
            for _ in range(5):
                new_id = f'{prefix}-{uuid.uuid4().hex[:8].upper()}'
                if not Farmer.objects.filter(farmer_id=new_id).exists():
                    self.farmer_id = new_id
                    break
            else:
                self.farmer_id = f'{prefix}-{uuid.uuid4().hex[:12].upper()}'
        
        # Update farmer_id prefix when becoming active (from PEND to FARM)
        if self.status == 'active' and self.farmer_id.startswith('PEND-'):
            for _ in range(5):
                new_id = f'FARM-{uuid.uuid4().hex[:8].upper()}'
                if not Farmer.objects.filter(farmer_id=new_id).exists():
                    self.farmer_id = new_id
                    break
            else:
                self.farmer_id = f'FARM-{uuid.uuid4().hex[:12].upper()}'

        # Automatically create and link a User when Farmer is approved
        if self.status == 'active':
            from apps.authentication.models import User
            # Only create if User with Farmer's username does not exist
            user, created = User.objects.get_or_create(username=self.username)
            # Set names, email, and role
            user.first_name = self.first_name
            user.last_name = self.last_name
            user.email = self.email if self.email else ''
            user.role = 'user'  # Change to 'farmer' if you want a custom role
            user.is_farmer = True
            # Always set password from Farmer if available
            password = getattr(self, 'password', None)
            if password:
                user.set_password(password)
            elif created:
                user.set_password('changeme123')
            user.save()
            self.user = user
        super().save(*args, **kwargs)


class FarmerDocument(models.Model):
    DOCUMENT_TYPES = [
        ('aadhar', 'Aadhar Card'),
        ('pan', 'PAN Card'),
        ('bank_passbook', 'Bank Passbook'),
        ('land_document', 'Land Document'),
        ('photo', 'Photograph'),
        ('other', 'Other'),
    ]
    
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_name = models.CharField(max_length=200)
    document_file = models.FileField(upload_to='farmer_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['farmer', 'document_type']
    
    def __str__(self):
        return f"{self.farmer.farmer_id} - {self.document_type}"