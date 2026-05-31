from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SellerLocationViewSet

router = DefaultRouter()
router.register('', SellerLocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
]