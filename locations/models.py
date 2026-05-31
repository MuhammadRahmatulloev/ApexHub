from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SellerLocation(models.Model):
    seller = models.OneToOneField(User, on_delete=models.CASCADE, related_name='location')
    address = models.CharField(max_length=500)
    lat = models.FloatField()
    lng = models.FloatField()
    work_hours = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.seller.email} - {self.address}"