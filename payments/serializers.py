from rest_framework import serializers
from .models import Payment, Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'status', 'response_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'user_email', 'order', 'amount', 'status', 'method', 'transaction_id', 'transactions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_email', 'amount', 'status', 'transaction_id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'method']

    def create(self, validated_data):
        user = self.context['request'].user
        order = validated_data['order']
        if order.user != user:
            raise serializers.ValidationError('This is not your order')
        if hasattr(order, 'payment'):
            raise serializers.ValidationError('Payment already exists for this order')
        payment = Payment.objects.create(
            user=user,
            order=order,
            amount=order.total_price,
            **validated_data
        )
        return payment