from django.contrib import admin
from .models import SellerLocation


@admin.register(SellerLocation)
class SellerLocationAdmin(admin.ModelAdmin):
    list_display = ['seller', 'address', 'lat', 'lng', 'work_hours', 'created_at']
    search_fields = ['seller__email', 'address']