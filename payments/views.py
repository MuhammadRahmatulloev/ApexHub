from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from products.permissions import IsAdminOnly
from notifications.utils import send_notification


@extend_schema(tags=['payments'])
class PaymentViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Payment.objects.all()
        return Payment.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        payments = self.get_queryset()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def detail_payment(self, request, pk=None):
        try:
            payment = self.get_queryset().get(pk=pk)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def create_payment(self, request):
        serializer = PaymentCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            payment = serializer.save()
            send_notification(
                user=request.user,
                title='Payment created',
                message=f'Payment #{payment.id} for order #{payment.order.id} created. Amount: {payment.amount} som',
                notification_type='PAYMENT'
            )
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOnly])
    def update_status(self, request, pk=None):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        if new_status not in ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        payment.status = new_status
        payment.save()
        if new_status == 'SUCCESS':
            payment.order.status = 'PAID'
            payment.order.save()
            stats = payment.user.stats if hasattr(payment.user, 'stats') else None
            if stats:
                from django.db.models import Sum
                total = Payment.objects.filter(
                    user=payment.user,
                    status='SUCCESS'
                ).aggregate(Sum('amount'))['amount__sum'] or 0
                stats.total_spent = total
                stats.save(update_fields=['total_spent'])
            send_notification(
                user=payment.user,
                title='Payment successful',
                message=f'Payment #{payment.id} for order #{payment.order.id} was successful!',
                notification_type='PAYMENT'
            )
        elif new_status == 'FAILED':
            send_notification(
                user=payment.user,
                title='Payment failed',
                message=f'Payment #{payment.id} for order #{payment.order.id} failed.',
                notification_type='PAYMENT'
            )
        return Response(PaymentSerializer(payment).data)