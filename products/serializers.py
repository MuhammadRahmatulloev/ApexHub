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


# ОДИН класс ProductImageSerializer (убрали дубликат)
class ProductImageSerializer(serializers.ModelSerializer):
    # product принимает ID как число или строку — IntegerField справится
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
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description',
            'product_type', 'price', 'stock',
            'is_available', 'average_rating', 'total_reviews',
            'category', 'brand', 'images', 'specifications',
            'seller_name', 'created_at', 'updated_at'
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'product_type',
            'price', 'stock', 'is_available', 'category', 'brand'
        ]

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)