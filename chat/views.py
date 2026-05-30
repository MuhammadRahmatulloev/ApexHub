from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    SendMessageSerializer,
)
from .ai_service import get_ai_response


@extend_schema(tags=['chat'])
class ChatViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        convs = self.get_queryset()
        serializer = ConversationListSerializer(convs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        try:
            conv = self.get_queryset().get(pk=pk)
            return Response(ConversationSerializer(conv).data)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def send(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')

        if conversation_id:
            try:
                conversation = self.get_queryset().get(pk=conversation_id)
            except Conversation.DoesNotExist:
                return Response(
                    {'error': 'Conversation not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            title = user_message[:50] + '...' if len(user_message) > 50 else user_message
            conversation = Conversation.objects.create(
                user=request.user,
                title=title
            )

        Message.objects.create(
            conversation=conversation,
            role=Message.Role.USER,
            content=user_message
        )

        history = list(conversation.messages.values('role', 'content'))
        ai_response = get_ai_response(history, user_message)

        ai_message = Message.objects.create(
            conversation=conversation,
            role=Message.Role.ASSISTANT,
            content=ai_response
        )

        conversation.save()

        return Response({
            'conversation_id': conversation.id,
            'user_message': user_message,
            'ai_response': ai_response,
            'created_at': ai_message.created_at
        })

    @action(detail=True, methods=['delete'])
    def delete_conversation(self, request, pk=None):
        try:
            conv = self.get_queryset().get(pk=pk)
            conv.delete()
            return Response({'message': 'Conversation deleted'})
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def new_conversation(self, request):
        conv = Conversation.objects.create(
            user=request.user,
            title='New Chat'
        )
        return Response(
            ConversationSerializer(conv).data,
            status=status.HTTP_201_CREATED
        )