from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Build, BuildComponent
from .serializers import (
    BuildSerializer,
    BuildCreateSerializer,
    AddComponentSerializer,
    AIBuildSerializer
)
from .compatibility import check_compatibility
from .ai_build import get_ai_build_recommendation


@extend_schema(tags=['builds'])
class BuildViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BuildSerializer

    def get_queryset(self):
        return Build.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_builds(self, request):
        builds = self.get_queryset()
        serializer = BuildSerializer(builds, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_build(self, request):
        serializer = BuildCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            build = serializer.save()
            return Response(
                BuildSerializer(build).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def detail_build(self, request, pk=None):
        try:
            build = self.get_queryset().get(pk=pk)
            return Response(BuildSerializer(build).data)
        except Build.DoesNotExist:
            return Response(
                {'error': 'Build not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def add_component(self, request, pk=None):
        try:
            build = self.get_queryset().get(pk=pk)
        except Build.DoesNotExist:
            return Response(
                {'error': 'Build not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AddComponentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        component_type = serializer.validated_data['component_type']
        product_id = serializer.validated_data.get('product_id')
        custom_name = serializer.validated_data.get('custom_name', '')
        notes = serializer.validated_data.get('notes', '')

        BuildComponent.objects.update_or_create(
            build=build,
            component_type=component_type,
            defaults={
                'product_id': product_id,
                'custom_name': custom_name,
                'notes': notes
            }
        )

        components_dict = {
            c.component_type: c.product
            for c in build.components.all()
            if c.product
        }
        result = check_compatibility(components_dict)
        build.is_compatible = result['is_compatible']
        build.compatibility_notes = result['notes']
        build.calculate_total()

        return Response(BuildSerializer(build).data)

    @action(detail=True, methods=['delete'])
    def remove_component(self, request, pk=None):
        try:
            build = self.get_queryset().get(pk=pk)
        except Build.DoesNotExist:
            return Response(
                {'error': 'Build not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        component_type = request.data.get('component_type')
        if not component_type:
            return Response(
                {'error': 'component_type required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        BuildComponent.objects.filter(
            build=build,
            component_type=component_type
        ).delete()
        build.calculate_total()
        return Response(BuildSerializer(build).data)

    @action(detail=True, methods=['delete'])
    def delete_build(self, request, pk=None):
        try:
            build = self.get_queryset().get(pk=pk)
            build.delete()
            return Response({'message': 'Build deleted'})
        except Build.DoesNotExist:
            return Response(
                {'error': 'Build not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def ai_generate(self, request):
        serializer = AIBuildSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt = serializer.validated_data['prompt']
        budget = serializer.validated_data.get('budget')

        ai_result = get_ai_build_recommendation(prompt, budget)

        build = Build.objects.create(
            user=request.user,
            name=ai_result.get('build_name', 'AI Build'),
            description=ai_result.get('description', ''),
            status=Build.Status.AI_GENERATED,
            ai_prompt=prompt,
            total_price=ai_result.get('estimated_price', 0),
            compatibility_notes=ai_result.get('notes', '')
        )

        for component_type, component_name in ai_result.get('components', {}).items():
            if component_name:
                BuildComponent.objects.create(
                    build=build,
                    component_type=component_type,
                    custom_name=component_name
                )

        return Response({
            'build': BuildSerializer(build).data,
            'ai_recommendation': ai_result
        }, status=status.HTTP_201_CREATED)