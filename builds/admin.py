from django.contrib import admin
from .models import Build, BuildComponent


class BuildComponentInline(admin.TabularInline):
    model = BuildComponent
    extra = 0


@admin.register(Build)
class BuildAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'status', 'total_price', 'is_compatible', 'created_at']
    list_filter = ['status', 'is_compatible']
    search_fields = ['name', 'user__email']
    inlines = [BuildComponentInline]