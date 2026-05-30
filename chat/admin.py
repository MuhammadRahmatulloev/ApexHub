from django.contrib import admin
from .models import Conversation, Message, AIKeyPool


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['role', 'content', 'created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'created_at', 'updated_at']
    search_fields = ['user__email', 'title']
    inlines = [MessageInline]


@admin.register(AIKeyPool)
class AIKeyPoolAdmin(admin.ModelAdmin):
    list_display = ['provider', 'is_active', 'request_count', 'last_used']
    list_filter = ['provider', 'is_active']