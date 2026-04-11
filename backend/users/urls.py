from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, EquipmentViewSet, BookingViewSet, StudyMaterialViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'materials', StudyMaterialViewSet, basename='material')

urlpatterns = [
    path('', include(router.urls)),
]