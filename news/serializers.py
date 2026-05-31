from rest_framework import serializers
from .models import News
from accounts.serializers import UserProfileSerializer


class NewsSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'image', 'author', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class NewsListSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = News
        fields = ['id', 'title', 'image', 'author', 'is_published', 'created_at']