from rest_framework import serializers
from .models import CustomUser, Equipment, Booking, StudyMaterial
from django.db.models import Q

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'department']

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    equipment_name = serializers.ReadOnlyField(source='equipment.name')

    class Meta:
        model = Booking
        fields = ['id', 'student', 'student_name', 'equipment', 'equipment_name', 'request_date', 'start_time', 'end_time', 'status', 'approved_by']
        read_only_fields = ['status', 'approved_by', 'student']

    def validate(self, data):
        equipment = data.get('equipment')
        start = data.get('start_time')
        end = data.get('end_time')

        if start and end and start >= end:
            raise serializers.ValidationError({"time": "End time must be after the start time."})

        if start and end:
            overlapping_bookings = Booking.objects.filter(
                equipment=equipment,
                status__in=['PENDING', 'APPROVED']
            ).filter(
                Q(start_time__lt=end) & Q(end_time__gt=start)
            ).exists()

            if overlapping_bookings:
                raise serializers.ValidationError({"conflict": "This equipment is already reserved for that time slot."})

        return data

class StudyMaterialSerializer(serializers.ModelSerializer):
    uploader_name = serializers.ReadOnlyField(source='uploaded_by.username')

    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'description', 'file', 'uploader_name', 'upload_date', 'is_approved', 'tags']
        read_only_fields = ['is_approved', 'uploader_name']