from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserSignupView, UserProfileView, JobViewSet, 
    ApplicationViewSet, ChatMessageViewSet, DashboardView, ReviewViewSet
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'chat', ChatMessageViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
