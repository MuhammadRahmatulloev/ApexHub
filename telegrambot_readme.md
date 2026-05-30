# Telegram Bot Setup

## Files

| File | Куда положить |
|---|---|
| telegram_bot.py | корень проекта (рядом с manage.py) |
| orders_signals.py | orders/signals.py |
| orders_apps.py | orders/apps.py |
| orders_views.py | orders/views.py (заменить) |
| products_signals.py | products/signals.py |
| products_apps.py | products/apps.py |

## .env

Добавь в .env:
```
TELEGRAM_CHAT_ID=  <-- сюда вставь ID группы (с минусом)
```

## Как получить TELEGRAM_CHAT_ID

1. Добавь бота в группу ApexHub
2. Напиши любое сообщение в группе
3. Открой в браузере:
   https://api.telegram.org/bot8899716977:AAG15gDNs64Oa-1PJ3qaGA3YvwdRqb4q3Oc/getUpdates
4. Найди "chat": { "id": -XXXXXXXXX }
5. Этот ID вставь в .env

## Что бот отправляет

- Новый заказ создан -> сообщение с товарами, суммой, адресом
- Статус заказа изменён -> сообщение с новым статусом
- Новый товар добавлен продавцом -> сообщение с названием и ценой