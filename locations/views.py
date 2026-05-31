from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema
from .models import SellerLocation
from .serializers import SellerLocationSerializer
from products.permissions import IsAdminOrSeller


@extend_schema(tags=['locations'])
class SellerLocationViewSet(viewsets.GenericViewSet):
    serializer_class = SellerLocationSerializer

    def get_queryset(self):
        return SellerLocation.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def list_locations(self, request):
        locations = self.get_queryset()
        serializer = SellerLocationSerializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def detail_location(self, request):
        seller_id = request.query_params.get('seller_id')
        if not seller_id:
            return Response({'error': 'seller_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            location = SellerLocation.objects.get(seller_id=seller_id)
            serializer = SellerLocationSerializer(location)
            return Response(serializer.data)
        except SellerLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrSeller])
    def create_location(self, request):
        if hasattr(request.user, 'location'):
            return Response({'error': 'Location already exists. Use update instead.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SellerLocationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'], permission_classes=[IsAdminOrSeller])
    def update_location(self, request):
        try:
            location = SellerLocation.objects.get(seller=request.user)
        except SellerLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SellerLocationSerializer(location, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], permission_classes=[IsAdminOrSeller])
    def delete_location(self, request):
        try:
            location = SellerLocation.objects.get(seller=request.user)
            location.delete()
            return Response({'message': 'Location deleted'})
        except SellerLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_location(self, request):
        try:
            location = SellerLocation.objects.get(seller=request.user)
            serializer = SellerLocationSerializer(location)
            return Response(serializer.data)
        except SellerLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)