from django.db import models
from apps.farmers.models import Farmer
from apps.lands.models import Land

class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('farming', 'Farming'),
        # Add more types as needed
    ]
    crop_type = models.CharField(max_length=100)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES, default='farming')
    planting_date = models.DateField()
    expected_harvest_date = models.DateField()
    estimated_yield = models.FloatField()
    notes = models.TextField(blank=True)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE)
    land = models.ForeignKey(Land, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'

    def __str__(self):
        return f"{self.crop_type} ({self.activity_type}) on {self.land}"