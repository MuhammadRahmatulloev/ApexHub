from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from .models import Category, Brand, Product
from .serializers import (
    CategorySerializer,
    BrandSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer
)
from .permissions import IsAdminOrSeller, IsAdminOnly, IsProductOwnerOrAdmin
from .pagination import CustomPagination


@extend_schema(tags=['categories'])
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOnly()] 


@extend_schema(tags=['brands'])
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOnly()]  # только Admin


@extend_schema(tags=['products'])
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'product_type', 'is_available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'average_rating']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductCreateSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsAdminOrSeller()]  
        return [IsProductOwnerOrAdmin()]  

    @extend_schema(tags=['products'])
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def top_rated(self, request):
        products = Product.objects.filter(
            is_available=True
        ).order_by('-average_rating')[:10]
        serializer = ProductListSerializer(
            products, many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @extend_schema(tags=['products'])
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_type(self, request):
        product_type = request.query_params.get('type', None)
        if not product_type:
            return Response(
                {'error': 'type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        products = Product.objects.filter(
            product_type=product_type,
            is_available=True
        )
        serializer = ProductListSerializer(
            products, many=True,
            context={'request': request}
        )
        return Response(serializer.data)