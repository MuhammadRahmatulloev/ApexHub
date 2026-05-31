from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, VerificationCode, UserStats


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['-created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {
            'fields': ('role', 'age', 'avatar', 'phone', 'is_verified')
        }),
    )


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'is_used', 'attempts', 'created_at']
    list_filter = ['is_used']
    search_fields = ['user__email']


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_orders', 'total_spent', 'total_favorites', 'total_builds', 'total_reviews', 'updated_at']
    search_fields = ['user__email']