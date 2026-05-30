from rest_framework import serializers
from .models import Build, BuildComponent, ComponentType
from products.serializers import ProductListSerializer


class BuildComponentSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = BuildComponent
        fields = [
            'id', 'component_type', 'product',
            'product_id', 'custom_name', 'notes'
        ]


class BuildSerializer(serializers.ModelSerializer):
    components = BuildComponentSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Build
        fields = [
            'id', 'name', 'description', 'status',
            'total_price', 'is_compatible', 'compatibility_notes',
            'ai_prompt', 'components', 'user_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_price', 'is_compatible',
            'compatibility_notes', 'created_at', 'updated_at'
        ]


class BuildCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Build
        fields = ['name', 'description']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AddComponentSerializer(serializers.Serializer):
    component_type = serializers.ChoiceField(choices=ComponentType.choices)
    product_id = serializers.IntegerField(required=False)
    custom_name = serializers.CharField(required=False)
    notes = serializers.CharField(required=False)


class AIBuildSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        max_length=1000,
        help_text="Describe your needs. Example: 'Gaming PC under $1000' or 'Office PC for video editing'"
    )
    budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Optional budget in USD"
    )