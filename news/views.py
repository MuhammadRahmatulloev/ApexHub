from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema
from .models import News
from .serializers import NewsSerializer, NewsListSerializer
from products.permissions import IsAdminOnly


@extend_schema(tags=['news'])
class NewsViewSet(viewsets.GenericViewSet):
    serializer_class = NewsSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return News.objects.filter(is_published=True)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def list_news(self, request):
        news = self.get_queryset()
        serializer = NewsListSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def detail_news(self, request, pk=None):
        try:
            news = News.objects.get(pk=pk, is_published=True)
            serializer = NewsSerializer(news, context={'request': request})
            return Response(serializer.data)
        except News.DoesNotExist:
            return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOnly])
    def create_news(self, request):
        serializer = NewsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOnly])
    def update_news(self, request, pk=None):
        try:
            news = News.objects.get(pk=pk)
        except News.DoesNotExist:
            return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = NewsSerializer(news, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminOnly])
    def delete_news(self, request, pk=None):
        try:
            news = News.objects.get(pk=pk)
            news.delete()
            return Response({'message': 'News deleted'})
        except News.DoesNotExist:
            return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminOnly])
    def all_news(self, request):
        news = News.objects.all().order_by('-created_at')
        serializer = NewsListSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOnly])
    def toggle_publish(self, request, pk=None):
        try:
            news = News.objects.get(pk=pk)
            news.is_published = not news.is_published
            news.save()
            return Response({'is_published': news.is_published})
        except News.DoesNotExist:
            return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)