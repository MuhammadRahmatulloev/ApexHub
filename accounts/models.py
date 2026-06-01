from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    SELLER = 'SELLER', 'Seller'
    CLIENT = 'CLIENT', 'Client'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CLIENT
    )
    is_verified = models.BooleanField(default=False)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True
    )
    phone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == Role.ADMIN

    @property
    def is_seller(self):
        return self.role == Role.SELLER

    @property
    def is_client(self):
        return self.role == Role.CLIENT

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = Role.ADMIN
            self.is_verified = True
            self.is_active = True
        super().save(*args, **kwargs)


class VerificationCode(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='verification_codes'
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} - {self.code}"


class UserStats(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='stats'
    )
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_favorites = models.PositiveIntegerField(default=0)
    total_builds = models.PositiveIntegerField(default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stats of {self.user.email}"