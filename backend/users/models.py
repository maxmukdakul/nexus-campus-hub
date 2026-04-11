from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# 1. Multi-User Role System
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('STAFF', 'Lab Manager'),
        ('ADMIN', 'System Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"

# 2. Resource Library (Digital Files & Physical Equipment)
class Equipment(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    is_available = models.BooleanField(default=True)
    condition_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# 3. The Booking Engine (High-Risk Area)
class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('RETURNED', 'Returned'),
    )
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='bookings')
    request_date = models.DateTimeField(default=timezone.now)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    approved_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_bookings'
    )

    def __str__(self):
        return f"{self.equipment.name} booked by {self.student.username}"

# 4. The Digital Resource Library (Peer-Reviewed Study Materials)
class StudyMaterial(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    file = models.FileField(upload_to='study_materials/')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='uploaded_materials')
    upload_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False) # Requires Staff Approval
    tags = models.CharField(max_length=100, help_text="e.g. Physics, Midterm, Notes")

    def __str__(self):
        return self.title