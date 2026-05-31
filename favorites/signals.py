from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Favorite


@receiver(post_save, sender=Favorite)
def update_stats_on_add(sender, instance, created, **kwargs):
    if not created:
        return
    stats = instance.user.stats if hasattr(instance.user, 'stats') else None
    if stats:
        stats.total_favorites = Favorite.objects.filter(user=instance.user).count()
        stats.save(update_fields=['total_favorites'])


@receiver(post_delete, sender=Favorite)
def update_stats_on_remove(sender, instance, **kwargs):
    stats = instance.user.stats if hasattr(instance.user, 'stats') else None
    if stats:
        stats.total_favorites = Favorite.objects.filter(user=instance.user).count()
        stats.save(update_fields=['total_favorites'])