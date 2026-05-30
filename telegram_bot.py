import os
import requests


def send_telegram_message(text: str) -> bool:
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return False
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception:
        return False


def notify_new_order(order) -> bool:
    items_text = ''
    for item in order.items.all():
        items_text += f'  - {item.product.name} x{item.quantity} = {item.price * item.quantity} сом\n'
    text = (
        f'<b>New Order #{order.id}</b>\n'
        f'Buyer: {order.user.email}\n'
        f'Items:\n{items_text}'
        f'Total: <b>{order.total_price} сом</b>\n'
        f'Address: {order.delivery_address or "—"}\n'
        f'Status: {order.status}'
    )
    return send_telegram_message(text)


def notify_order_status_changed(order) -> bool:
    status_map = {
        'CREATED': 'Created',
        'PAID': 'Paid',
        'SHIPPING': 'Shipping',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
    }
    text = (
        f'<b>Order #{order.id} status updated</b>\n'
        f'Buyer: {order.user.email}\n'
        f'New status: <b>{status_map.get(order.status, order.status)}</b>\n'
        f'Total: {order.total_price} сом'
    )
    return send_telegram_message(text)


def notify_new_product(product) -> bool:
    text = (
        f'<b>New Product Listed</b>\n'
        f'Name: {product.name}\n'
        f'Seller: {product.seller.email}\n'
        f'Price: <b>{product.price} сом</b>\n'
        f'Category: {product.category.name if product.category else "—"}\n'
        f'Stock: {product.stock}'
    )
    return send_telegram_message(text)