from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(default=5)
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='reviews/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.product.name} - {self.rating}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'product']