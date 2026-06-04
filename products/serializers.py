from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSpecification


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )

    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'is_main']


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'key', 'value']


class ProductLocationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    address = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    phone = serializers.CharField()
    work_hours = serializers.CharField()


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'product_type',
            'price', 'stock', 'is_available',
            'average_rating', 'total_reviews',
            'category', 'brand', 'main_image',
            'created_at'
        ]

    def get_main_image(self, obj):
        image = obj.images.filter(is_main=True).first()
        if image:
            from django.conf import settings
            return f"{settings.MEDIA_URL}{image.image}"
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    location = ProductLocationSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description',
            'product_type', 'price', 'stock',
            'is_available', 'average_rating', 'total_reviews',
            'category', 'brand', 'images', 'specifications',
            'seller_name', 'location',
            'created_at', 'updated_at'
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'product_type',
            'price', 'stock', 'is_available', 'category', 'brand', 'location'
        ]
        read_only_fields = ['id']

    def validate_location(self, value):
        if value and self.context['request'].user != value.seller:
            if self.context['request'].user.role != 'ADMIN':
                raise serializers.ValidationError('You can only assign your own locations.')
        return value

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)