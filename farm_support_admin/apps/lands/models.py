from django.db import models
from apps.farmers.models import Farmer

class Land(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='lands')
    farm_name = models.CharField(max_length=100)
    total_area = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farm_name} ({self.total_area} acres)"