from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()


class ComponentType(models.TextChoices):
    CPU = 'CPU', 'Processor'
    GPU = 'GPU', 'Graphics Card'
    RAM = 'RAM', 'Memory'
    STORAGE = 'STORAGE', 'Storage'
    MOTHERBOARD = 'MOTHERBOARD', 'Motherboard'
    PSU = 'PSU', 'Power Supply'
    CASE = 'CASE', 'Case'
    COOLING = 'COOLING', 'Cooling'


class Build(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        COMPLETE = 'COMPLETE', 'Complete'
        AI_GENERATED = 'AI_GENERATED', 'AI Generated'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='builds'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    is_compatible = models.BooleanField(default=True)
    compatibility_notes = models.TextField(blank=True)
    ai_prompt = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    def calculate_total(self):
        total = sum(
            item.product.price
            for item in self.components.all()
            if item.product
        )
        self.total_price = total
        self.save()
        return total

    class Meta:
        ordering = ['-created_at']


class BuildComponent(models.Model):
    build = models.ForeignKey(
        Build,
        on_delete=models.CASCADE,
        related_name='components'
    )
    component_type = models.CharField(
        max_length=20,
        choices=ComponentType.choices
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='build_components'
    )
    custom_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.build.name} - {self.component_type}"

    class Meta:
        unique_together = ['build', 'component_type']