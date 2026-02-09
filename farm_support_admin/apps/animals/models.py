from django.db import models
from apps.farmers.models import Farmer


class Animal(models.Model):
    """
    Animal model for RFID tag monitoring
    """
    ANIMAL_TYPE_CHOICES = [
        ('cattle', 'Cattle'),
        ('buffalo', 'Buffalo'),
        ('goat', 'Goat'),
        ('sheep', 'Sheep'),
        ('pig', 'Pig'),
        ('poultry', 'Poultry'),
        ('other', 'Other'),
    ]
    
    HEALTH_STATUS_CHOICES = [
        ('healthy', 'Healthy'),
        ('sick', 'Sick'),
        ('under_treatment', 'Under Treatment'),
        ('quarantined', 'Quarantined'),
        ('deceased', 'Deceased'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    # RFID and Identification
    rfid_tag = models.CharField(max_length=50, unique=True, help_text="RFID Tag Number")
    animal_type = models.CharField(max_length=20, choices=ANIMAL_TYPE_CHOICES)
    breed = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, help_text="Optional animal name")
    
    # Basic Information
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    age_months = models.PositiveIntegerField(help_text="Age in months")
    color = models.CharField(max_length=50, blank=True, null=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, help_text="Current weight in kg")
    
    # Ownership
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='animals')
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Health Information
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES, default='healthy')
    last_vaccination_date = models.DateField(null=True, blank=True)
    last_checkup_date = models.DateField(null=True, blank=True)
    medical_notes = models.TextField(blank=True, null=True)
    
    # Location and Management
    current_location = models.CharField(max_length=200, blank=True, null=True)
    pen_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Additional Information
    mother_rfid = models.CharField(max_length=50, blank=True, null=True, help_text="Mother's RFID tag")
    father_rfid = models.CharField(max_length=50, blank=True, null=True, help_text="Father's RFID tag")
    notes = models.TextField(blank=True, null=True)
    
    # System Information
    registered_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-registered_date']
        verbose_name = 'Animal'
        verbose_name_plural = 'Animals'
    
    def __str__(self):
        return f"{self.animal_type} - {self.rfid_tag} ({self.farmer.first_name})"


class AnimalHealthRecord(models.Model):
    """
    Track health records and veterinary visits for animals
    """
    RECORD_TYPE_CHOICES = [
        ('vaccination', 'Vaccination'),
        ('checkup', 'Routine Checkup'),
        ('treatment', 'Treatment'),
        ('surgery', 'Surgery'),
        ('injury', 'Injury'),
        ('disease', 'Disease'),
        ('other', 'Other'),
    ]
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='health_records')
    record_type = models.CharField(max_length=20, choices=RECORD_TYPE_CHOICES)
    record_date = models.DateField()
    veterinarian_name = models.CharField(max_length=100, blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    treatment_given = models.TextField(blank=True, null=True)
    medication = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_visit_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-record_date']
        verbose_name = 'Health Record'
        verbose_name_plural = 'Health Records'
    
    def __str__(self):
        return f"{self.animal.rfid_tag} - {self.record_type} on {self.record_date}"
