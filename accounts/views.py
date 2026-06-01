from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiResponse
import random
from django.conf import settings
from .models import VerificationCode
from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


@extend_schema(tags=['auth'])
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description='Registration successful'),
            400: OpenApiResponse(description='Validation error'),
        }
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            code = str(random.randint(100000, 999999))
            VerificationCode.objects.create(user=user, code=code)
            from django.core.mail import send_mail
            try:
                send_mail(
                    subject='ApexHub - Email Verification',
                    message=f'Your verification code: {code}\n\nExpires in 10 minutes.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email error: {e}")
            return Response(
                {'message': 'Registration successful. Check your email for verification code.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=VerifyEmailSerializer,
        responses={
            200: OpenApiResponse(description='Email verified successfully'),
            400: OpenApiResponse(description='Invalid or expired code'),
            404: OpenApiResponse(description='User not found'),
        }
    )
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            verification = VerificationCode.objects.filter(
                user=user,
                code=code,
                is_used=False,
                created_at__gte=timezone.now() - timedelta(minutes=10)
            ).last()

            if not verification:
                return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)

            verification.is_used = True
            verification.save()
            user.is_verified = True
            user.is_active = True
            user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Email verified successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: UserProfileSerializer,
            401: OpenApiResponse(description='Invalid credentials'),
            403: OpenApiResponse(description='Email not verified'),
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_verified:
                return Response({'error': 'Email not verified'}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: OpenApiResponse(description='Logged out successfully'),
            400: OpenApiResponse(description='Invalid token'),
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserProfileSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Wrong current password'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['auth'])
class BecomeSellerView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: OpenApiResponse(description='You are now a seller'),
            400: OpenApiResponse(description='Already a seller or admin'),
        }
    )
    def post(self, request):
        user = request.user
        if user.role == 'SELLER':
            return Response({'error': 'You are already a seller'}, status=status.HTTP_400_BAD_REQUEST)
        if user.role == 'ADMIN':
            return Response({'error': 'Admin cannot become a seller'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = 'SELLER'
        user.save()
        return Response({
            'message': 'Congratulations! You are now a seller',
            'user': UserProfileSerializer(user).data
        })


@extend_schema(tags=['auth'])
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ForgotPasswordSerializer)
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If this email exists, a reset code has been sent.'})
        code = str(random.randint(100000, 999999))
        VerificationCode.objects.create(user=user, code=code)
        from django.core.mail import send_mail
        send_mail(
            subject='ApexHub - Password Reset',
            message=f'Your password reset code: {code}\n\nExpires in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return Response({'message': 'If this email exists, a reset code has been sent.'})


@extend_schema(tags=['auth'])
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        verification = VerificationCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            created_at__gte=timezone.now() - timedelta(minutes=10)
        ).last()
        if not verification:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
        verification.is_used = True
        verification.save()
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully'})