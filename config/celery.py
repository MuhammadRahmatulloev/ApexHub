import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.broker_transport_options = {
    'socket_timeout': 10,
    'socket_connect_timeout': 10,
}
app.conf.redis_socket_timeout = 10
app.conf.redis_socket_connect_timeout = 10