from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    class Method(models.TextChoices):
        VISA = 'VISA', 'Visa'
        ALIF = 'ALIF', 'Alif Card'
        CASH = 'CASH', 'Cash'
        OTHER = 'OTHER', 'Other'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    transaction_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment #{self.id} - {self.user.email} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class Transaction(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    response_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction #{self.id} - {self.payment.id} - {self.status}"

    class Meta:
        ordering = ['-created_at']