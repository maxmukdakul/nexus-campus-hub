from rest_framework import viewsets, permissions, filters
from .models import CustomUser, Equipment, Booking, StudyMaterial
from .serializers import UserSerializer, EquipmentSerializer, BookingSerializer, StudyMaterialSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    # EXPLICIT ROLE-BASED AUTHORIZATION
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            class IsAdminRole(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser)
            return [IsAdminRole()] 
        return [permissions.IsAuthenticated()]

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['STAFF', 'ADMIN'] or user.is_superuser:
            return Booking.objects.all()
        return Booking.objects.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')

        if new_status:
            # 1. Verify the user is a Staff or Admin
            if request.user.role not in ['STAFF', 'ADMIN'] and not request.user.is_superuser:
                raise PermissionDenied("Security Alert: Only Staff can approve bookings.")
            
            # 2. Bypass the read-only lock and save directly to the database
            instance.status = new_status
            instance.approved_by = request.user
            instance.save()

        # Continue with the rest of the standard update
        return super().partial_update(request, *args, **kwargs)

class StudyMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = StudyMaterialSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['STAFF', 'ADMIN'] or user.is_superuser:
            return StudyMaterial.objects.all().order_by('-upload_date')
        return StudyMaterial.objects.filter(is_approved=True).order_by('-upload_date')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if 'is_approved' in request.data:
            # 1. Verify the user is a Staff or Admin
            if request.user.role not in ['STAFF', 'ADMIN'] and not request.user.is_superuser:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Security Alert: Only Staff can approve documents.")
            
            # 2. Bypass the read-only lock and save directly to the database
            is_approved = request.data.get('is_approved')
            instance.is_approved = (str(is_approved).lower() == 'true' or is_approved is True)
            instance.save()

        return super().partial_update(request, *args, **kwargs)

    def get_permissions(self):
        # ... (Keep your existing get_permissions block here)
        if self.action in ['update', 'partial_update', 'destroy']:
            class IsStaffOrAdmin(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role in ['STAFF', 'ADMIN'] or request.user.is_superuser
            return [IsStaffOrAdmin()]
        return [permissions.IsAuthenticated()]