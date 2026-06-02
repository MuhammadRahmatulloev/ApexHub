from django.contrib import admin
from .models import SellerLocation


@admin.register(SellerLocation)
class SellerLocationAdmin(admin.ModelAdmin):
    list_display = ['seller', 'name', 'address', 'is_main', 'lat', 'lng', 'created_at']
    list_filter = ['is_main']
    search_fields = ['seller__email', 'name', 'address']