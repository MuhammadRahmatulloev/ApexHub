# ApexHub

ApexHub is a full-featured marketplace platform for PC components, gaming hardware, laptops, and AI-powered custom PC builds.

The project allows users to browse products, manage shopping carts, place orders, create custom PC configurations, and receive AI-generated hardware recommendations. Sellers can manage products and monitor sales through a dedicated dashboard.

---

## Features

### Authentication & Authorization

* JWT Authentication
* User Registration
* Email Verification
* Password Reset
* User Profiles
* Role-Based Access Control
* Seller Account Upgrade

### Product Marketplace

* Product Catalog
* Categories & Brands
* Product Specifications
* Product Images
* Product Search & Filtering
* Inventory Management

### Shopping & Orders

* Shopping Cart
* Cart Items
* Order Creation
* Order Status Tracking
* Order History

### AI-Powered PC Builder

* Custom PC Configurations
* Component Compatibility Checking
* Automatic Price Calculation
* AI-Generated Build Recommendations
* Build Management

### AI Assistant

* Hardware Recommendations
* Product Comparisons
* PC Build Suggestions
* Technical Support Chat
* Conversation History

### Seller Dashboard

* Product Management
* Sales Statistics
* Revenue Tracking
* Inventory Monitoring

### Notifications

* Order Notifications
* Verification Notifications
* System Notifications

---

## Tech Stack

### Backend

* Django 6
* Django REST Framework
* SimpleJWT
* Celery
* Redis
* Django Channels
* drf-spectacular

### Frontend

* React
* JavaScript

### Database

* SQLite (Development)
* PostgreSQL (Recommended for Production)

### Additional Tools

* Jazzmin Admin
* Pillow
* Django Filter
* CORS Headers

---

## Architecture

```text
accounts/
products/
orders/
builds/
chat/
notifications/
reviews/
favorites/
payments/
locations/
news/
config/
```

### Main Applications

| App           | Description                                  |
| ------------- | -------------------------------------------- |
| accounts      | Authentication, profiles, email verification |
| products      | Products, categories, brands                 |
| orders        | Cart and order management                    |
| builds        | Custom PC builder                            |
| chat          | AI assistant and conversations               |
| notifications | System notifications                         |

---

## Database Design

Main entities:

* Users
* Products
* Categories
* Brands
* Orders
* Shopping Cart
* PC Builds
* Conversations
* Notifications

Relationships are designed using Django ORM and follow a modular architecture.

---

## API Documentation

Swagger UI:

```bash
/api/docs/
```

ReDoc:

```bash
/api/redoc/
```

OpenAPI Schema:

```bash
/api/schema/
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/MuhammadRahmatulloev/ApexHub.git

cd ApexHub
```

### Create Virtual Environment

Windows

```bash
python -m venv .venv

.venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv .venv

source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your_secret_key

DEBUG=True

EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password

REDIS_URL=redis://localhost:6379/0

GROQ_API_KEY1=your_key
GROQ_API_KEY2=your_key
GROQ_API_KEY3=your_key

OPENROUTER_API_KEY=your_key

TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## Database Setup

Apply migrations:

```bash
python manage.py makemigrations

python manage.py migrate
```

Create administrator:

```bash
python manage.py createsuperuser
```

---

## Run Development Server

```bash
python manage.py runserver
```

Server will be available at:

```text
http://127.0.0.1:8000
```

---

## Run Redis

```bash
redis-server
```

---

## Run Celery Worker

```bash
celery -A config worker -l info
```

---

## Planned Improvements

* Docker Support
* Docker Compose
* PostgreSQL Production Setup
* CI/CD Pipeline
* Elasticsearch Integration
* Payment Gateway Integration
* Real-Time Notifications
* Advanced Analytics Dashboard
* Product Review System

---

## Security Notes

Sensitive credentials are stored in environment variables and are not included in the repository.

Never commit:

```text
.env
API keys
tokens
database backups
production credentials
```

---

## Project Status

Currently under active development.

New features and improvements are continuously being added.

---

## Author

Muhammad Rahmatulloev

Backend Developer

Technologies:

* Python
* Django
* Django REST Framework
* PostgreSQL
* Redis
* Celery
* Docker

---

## License

This project is intended for educational, learning, and portfolio purposes.
