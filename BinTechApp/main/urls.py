from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogoutView, trashcans_to_empty, receive_measurement
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import TrashCanViewSet, UserViewSet
from .views import register_gps_data
from .views import search_by_zone
from .views import detect_unreachable_sensors

router = DefaultRouter()
router.register(r'trashcans', TrashCanViewSet)
router.register(r'users', UserViewSet)
urlpatterns = [
    path('', include(router.urls)),  # Expose /api/trashcans/ endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='auth_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('map/register/', register_gps_data),
    path('map/search/', search_by_zone),
    path('sensors/status/', detect_unreachable_sensors),
    path('trashcans/to-empty/', trashcans_to_empty),
    path('sensors/measure/', receive_measurement),
]
