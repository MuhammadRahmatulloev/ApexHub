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
        return SellerLocation.objects.select_related('seller').all()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def list_locations(self, request):
        qs = self.get_queryset()
        seller_id = request.query_params.get('seller_id')
        if seller_id:
            qs = qs.filter(seller_id=seller_id)
        serializer = SellerLocationSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def detail_location(self, request, pk=None):
        try:
            location = self.get_queryset().get(pk=pk)
            return Response(SellerLocationSerializer(location).data)
        except SellerLocation.DoesNotExist:
            return Response(
                {'error': 'Location not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_locations(self, request):
        locations = SellerLocation.objects.filter(seller=request.user).order_by('-is_main', 'name')
        serializer = SellerLocationSerializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrSeller])
    def create_location(self, request):
        serializer = SellerLocationSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            count = SellerLocation.objects.filter(seller=request.user).count()
            if count == 0:
                data = serializer.validated_data
                data['is_main'] = True
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrSeller])
    def update_location(self, request, pk=None):
        try:
            location = SellerLocation.objects.get(pk=pk, seller=request.user)
        except SellerLocation.DoesNotExist:
            return Response(
                {'error': 'Location not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = SellerLocationSerializer(
            location,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminOrSeller])
    def delete_location(self, request, pk=None):
        try:
            location = SellerLocation.objects.get(pk=pk, seller=request.user)
        except SellerLocation.DoesNotExist:
            return Response(
                {'error': 'Location not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        was_main = location.is_main
        location.delete()
        if was_main:
            next_loc = SellerLocation.objects.filter(seller=request.user).first()
            if next_loc:
                next_loc.is_main = True
                next_loc.save()
        return Response({'message': 'Location deleted'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSeller])
    def set_main(self, request, pk=None):
        try:
            location = SellerLocation.objects.get(pk=pk, seller=request.user)
        except SellerLocation.DoesNotExist:
            return Response(
                {'error': 'Location not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        SellerLocation.objects.filter(seller=request.user).update(is_main=False)
        location.is_main = True
        location.save()
        return Response(SellerLocationSerializer(location).data)