from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review


@receiver(post_save, sender=Review)
def update_product_rating_on_save(sender, instance, **kwargs):
    product = instance.product
    result = Review.objects.filter(product=product).aggregate(Avg('rating'))
    product.average_rating = result['rating__avg'] or 0
    product.total_reviews = Review.objects.filter(product=product).count()
    product.save(update_fields=['average_rating', 'total_reviews'])

    stats = instance.user.stats if hasattr(instance.user, 'stats') else None
    if stats:
        stats.total_reviews = Review.objects.filter(user=instance.user).count()
        stats.save(update_fields=['total_reviews'])


@receiver(post_delete, sender=Review)
def update_product_rating_on_delete(sender, instance, **kwargs):
    product = instance.product
    result = Review.objects.filter(product=product).aggregate(Avg('rating'))
    product.average_rating = result['rating__avg'] or 0
    product.total_reviews = Review.objects.filter(product=product).count()
    product.save(update_fields=['average_rating', 'total_reviews'])