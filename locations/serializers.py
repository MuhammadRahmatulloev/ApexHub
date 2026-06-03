from rest_framework import serializers
from .models import SellerLocation


class SellerLocationSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True)

    class Meta:
        model = SellerLocation
        fields = [
            'id', 'seller_name', 'seller_email',
            'name', 'address', 'lat', 'lng',
            'work_hours', 'phone', 'is_main', 'created_at'
        ]
        read_only_fields = ['id', 'seller_name', 'seller_email', 'is_main', 'created_at']

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)