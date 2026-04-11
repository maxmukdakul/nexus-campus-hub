from django.contrib import admin
from .models import CustomUser, Equipment, Booking

# Registering the Custom User so you can change roles
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'department', 'is_staff')
    list_filter = ('role', 'is_staff')

# Registering the Equipment library
@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_available')
    search_fields = ('name',)

# Registering the Bookings table
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('equipment', 'student', 'status', 'start_time')
    list_filter = ('status',)