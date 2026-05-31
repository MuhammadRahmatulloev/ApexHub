from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Category, Brand, Product, ProductImage
from .serializers import (
    CategorySerializer,
    BrandSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductImageSerializer,
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
        return [IsAdminOnly()]


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
        if self.action in ['list', 'retrieve', 'top_rated', 'by_type']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsAdminOrSeller()]
        return [IsProductOwnerOrAdmin()]

    @extend_schema(tags=['products'])
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def top_rated(self, request):
        products = Product.objects.filter(is_available=True).order_by('-average_rating')[:10]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(tags=['products'])
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_type(self, request):
        product_type = request.query_params.get('type')
        if not product_type:
            return Response({'error': 'type parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        products = Product.objects.filter(product_type=product_type, is_available=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(tags=['products'])
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='upload_image',
    )
    def upload_image(self, request, pk=None):
        product = self.get_object()

        if product.seller != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        is_main_str = request.data.get('is_main', 'false')
        is_main = is_main_str in ('true', 'True', '1', True)

        if not product.images.exists():
            is_main = True

        if is_main:
            product.images.filter(is_main=True).update(is_main=False)

        img = ProductImage.objects.create(
            product=product,
            image=image_file,
            is_main=is_main,
        )

        return Response(ProductImageSerializer(img).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=['products'])
    @action(
        detail=True,
        methods=['delete'],
        permission_classes=[IsAuthenticated],
        url_path='delete_image',
    )
    def delete_image(self, request, pk=None):
        product = self.get_object()

        if product.seller != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        image_id = request.query_params.get('image_id')
        if not image_id:
            return Response({'error': 'image_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            img = ProductImage.objects.get(id=image_id, product=product)
            img.delete()
            return Response({'message': 'Image deleted'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)