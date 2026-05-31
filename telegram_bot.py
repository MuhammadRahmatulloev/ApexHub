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


def send_telegram_photo(photo_url: str, caption: str) -> bool:
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return False
    url = f'https://api.telegram.org/bot{token}/sendPhoto'
    payload = {
        'chat_id': chat_id,
        'photo': photo_url,
        'caption': caption,
        'parse_mode': 'HTML',
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception:
        return False


def notify_new_order(order) -> bool:
    items_text = ''
    for item in order.items.all():
        items_text += f'  • {item.product.name} x{item.quantity} = {item.price * item.quantity} сом\n'
    text = (
        f'🛒 <b>New order #{order.id}</b>\n'
        f'----------------\n'
        f'👤 Buyer: {order.user.email}\n'
        f'📦 Products:\n{items_text}'
        f'💰 Total: <b>{order.total_price} сом</b>\n'
        f'📍 Address: {order.delivery_address or "—"}\n'
        f'📌 Status: <b>{order.status}</b>'
    )
    return send_telegram_message(text)


def notify_order_status_changed(order) -> bool:
    status_map = {
        'CREATED': '🆕 Created',
        'PAID': '✅ Paid',
        'SHIPPING': '🚚 Pending',
        'DELIVERED': '📬 Delivered ',
        'CANCELLED': '❌ Cancelled',
    }
    text = (
        f'📋 <b>Order #{order.id} — status changed</b>\n'
        f'----------------\n'
        f'👤 Buyer: {order.user.email}\n'
        f'📌 New status: <b>{status_map.get(order.status, order.status)}</b>\n'
        f'💰 Sum: {order.total_price} som'
    )
    return send_telegram_message(text)


def notify_new_product(product) -> bool:
    base_url = os.getenv('SITE_URL', '')
    django_url = os.getenv('DJANGO_URL', '')

    seller = product.seller
    seller_name = seller.username or seller.email
    seller_phone = f'\n📞 {seller.phone}' if seller.phone else ''

    category_name = product.category.name if product.category else '—'
    brand_name = product.brand.name if product.brand else '—'

    product_link = ''
    if base_url:
        product_link = f'\n\n🔗 <a href="{base_url}/products/{product.id}">Open product on the site</a>'

    text = (
        f'🖥 <b>New product on ApexHub!</b>\n'
        f'-----------------\n'
        f'<b>{product.name}</b>\n'
        f'Type: {product.product_type}  |  Brand: {brand_name}\n'
        f'Category: {category_name}\n'
        f'Price: <b>{product.price} som</b>  |  Only: {product.stock} left.\n'
        f'-----------------\n'
        f'👤 Seller: <b>{seller_name}</b>\n'
        f'📧 {seller.email}'
        f'{seller_phone}'
        f'{product_link}'
    )

    main_image = product.images.filter(is_main=True).first()
    if not main_image:
        main_image = product.images.first()

    if main_image and main_image.image and django_url:
        photo_url = f'{django_url}/media/{main_image.image}'
        sent = send_telegram_photo(photo_url, text)
        if sent:
            return True

    return send_telegram_message(text)