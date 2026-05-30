from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


def send_notification(user, title, message, notification_type='SYSTEM'):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=notification_type
    )

    channel_layer = get_channel_layer()
    group_name = f'notifications_{user.id}'

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification',
            'title': title,
            'message': message,
            'notification_type': notification_type,
            'created_at': str(notification.created_at),
        }
    )

    return notification