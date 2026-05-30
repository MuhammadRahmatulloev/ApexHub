# ApexHub — Technical Task

## Idea

ApexHub is a marketplace for PC and gaming components.
Buyers can browse products, place orders, and build custom PC configurations using AI assistance.
Sellers manage their own products and view sales statistics.
The platform includes an AI chat powered by Groq.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6.0.5 |
| API | Django REST Framework 3.17.1 |
| Auth | SimpleJWT |
| WebSocket | Django Channels 4.3.2 + Daphne |
| Task Queue | Celery + Redis |
| AI Chat | Groq API (via AIKeyPool) |
| Frontend | React + JavaScript |
| Media | Pillow |
| Docs | drf-spectacular |
| Admin | django-jazzmin |

---

## User Roles

| Role | Description |
|---|---|
| CLIENT | Browses products, places orders, creates PC builds |
| SELLER | Lists products, views own sales statistics |
| ADMIN | Full access via admin panel |

---

## Apps

| App | Purpose |
|---|---|
| accounts | User registration, login, JWT auth, email verification |
| products | Product catalog, categories, brands, specifications, seller stats |
| orders | Cart, cart items, orders, order items |
| builds | PC build configurator, AI-generated builds, component slots |
| chat | AI chat via Groq, conversation history, key pool |
| notifications | System notifications for orders, payments, verifications |

---

## DB Schema

### accounts

```
User
- id              PK
- email           unique
- username
- role            ADMIN | SELLER | CLIENT
- is_verified     bool
- avatar          image
- phone
- created_at
- updated_at

VerificationCode
- id              PK
- user_id         FK -> User
- code            6 chars
- is_used         bool
- attempts        int
- created_at
```

### products

```
Category
- id              PK
- name
- slug            unique
- image
- created_at

Brand
- id              PK
- name
- slug            unique
- logo
- created_at

Product
- id              PK
- seller_id       FK -> User
- category_id     FK -> Category (nullable)
- brand_id        FK -> Brand (nullable)
- name
- slug            unique
- description
- product_type    LAPTOP | PC | COMPONENT | PERIPHERAL
- price           decimal
- stock           int
- is_available    bool
- average_rating  float
- total_reviews   int
- created_at
- updated_at

ProductImage
- id              PK
- product_id      FK -> Product
- image
- is_main         bool
- created_at

ProductSpecification
- id              PK
- product_id      FK -> Product
- key
- value

SellerStats
- id              PK
- seller_id       FK -> User (OneToOne)
- total_products  int
- total_orders    int
- total_revenue   decimal
- avg_rating      float
- updated_at
```

### orders

```
Cart
- id              PK
- user_id         FK -> User (OneToOne)
- created_at
- updated_at

CartItem
- id              PK
- cart_id         FK -> Cart
- product_id      FK -> Product
- quantity        int
- created_at

Order
- id              PK
- user_id         FK -> User
- status          CREATED | PAID | SHIPPING | DELIVERED | CANCELLED
- total_price     decimal
- delivery_address
- delivery_time
- note
- created_at
- updated_at

OrderItem
- id              PK
- order_id        FK -> Order
- product_id      FK -> Product
- quantity        int
- price           decimal
```

### builds

```
Build
- id              PK
- user_id         FK -> User
- name
- description
- status          DRAFT | COMPLETE | AI_GENERATED
- total_price     decimal
- is_compatible   bool
- compatibility_notes
- ai_prompt
- created_at
- updated_at

BuildComponent
- id              PK
- build_id        FK -> Build
- product_id      FK -> Product (nullable)
- component_type  CPU | GPU | RAM | STORAGE | MOTHERBOARD | PSU | CASE | COOLING
- custom_name
- notes
```

### chat

```
Conversation
- id              PK
- user_id         FK -> User
- title
- created_at
- updated_at

Message
- id              PK
- conversation_id FK -> Conversation
- role            user | assistant
- content
- created_at

AIKeyPool
- id              PK
- key
- provider        groq (default)
- is_active       bool
- request_count   int
- last_used
```

### notifications

```
Notification
- id              PK
- user_id         FK -> User
- title
- message
- type            ORDER | PAYMENT | SYSTEM | CHAT | VERIFICATION
- is_read         bool
- created_at
```

---

## Relations

```
User         ||--o{ Product          : sells
User         ||--o{ Order            : places
User         ||--o| Cart             : has
User         ||--o{ Build            : creates
User         ||--o{ Notification     : receives
User         ||--o{ Conversation     : starts
User         ||--o| SellerStats      : has
User         ||--o{ VerificationCode : has

Category     ||--o{ Product          : contains
Brand        ||--o{ Product          : brands

Product      ||--o{ ProductImage     : has
Product      ||--o{ ProductSpec      : has
Product      ||--o{ CartItem         : in
Product      ||--o{ OrderItem        : in
Product      ||--o{ BuildComponent   : used_in

Cart         ||--o{ CartItem         : contains
Order        ||--o{ OrderItem        : contains
Build        ||--o{ BuildComponent   : contains
Conversation ||--o{ Message          : has
```

---

## What Needs to Be Built (Seller Dashboard)

### Backend

- `SellerStats` model in `products/models.py`
- `SellerStatsSerializer` in `products/serializers.py`
- `SellerDashboardView` in `products/views.py`
  - GET `/api/products/seller/dashboard/` — returns stats + product list
- `ProductCreateView`, `ProductUpdateView`, `ProductDeleteView`
  - POST `/api/products/` — create product
  - PUT/PATCH `/api/products/{id}/` — update
  - DELETE `/api/products/{id}/` — delete
- Permission class: `IsSeller` — only users with role SELLER

### Frontend (React)

- `/seller/dashboard` — seller stats page
  - Total products, total orders, total revenue, average rating
  - Table of own products with edit and delete buttons
- `/seller/products/create` — create product form
- `/seller/products/{id}/edit` — edit product form

### Signals (auto-update SellerStats)

- On `Order` status changes to `PAID` — update `total_orders` and `total_revenue`
- On `Product` save/delete — update `total_products`
- On review save — update `avg_rating`

---

## API Endpoints Plan

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products/seller/dashboard/ | Seller stats + product list |
| GET | /api/products/seller/products/ | Own products |
| POST | /api/products/seller/products/ | Create product |
| PUT | /api/products/seller/products/{id}/ | Update product |
| DELETE | /api/products/seller/products/{id}/ | Delete product |
| GET | /api/orders/seller/orders/ | Orders containing seller products |
