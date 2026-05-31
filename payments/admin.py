from django.contrib import admin
from .models import Payment, Transaction


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = ['amount', 'status', 'response_data', 'created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'amount', 'status', 'method', 'created_at']
    list_filter = ['status', 'method']
    search_fields = ['user__email', 'transaction_id']
    inlines = [TransactionInline]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'amount', 'status', 'created_at']
    search_fields = ['payment__id']