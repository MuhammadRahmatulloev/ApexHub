from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from telegram_bot import notify_new_order, notify_order_status_changed


@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    if created:
        notify_new_order(instance)
    else:
        notify_order_status_changed(instance)