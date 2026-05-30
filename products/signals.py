from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product
from telegram_bot import notify_new_product


@receiver(post_save, sender=Product)
def product_post_save(sender, instance, created, **kwargs):
    if created:
        notify_new_product(instance)