from rest_framework import serializers
from .models import Review
from accounts.serializers import UserProfileSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'text', 'image', 'is_verified', 'created_at']
        read_only_fields = ['id', 'user', 'is_verified', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)