from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# -----------------------------
# Custom User Manager
# -----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# -----------------------------
# Custom User Model
# -----------------------------
class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=50)
    role = models.CharField(max_length=50)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'first_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.name}"

# -----------------------------
# Trash Management Models
# -----------------------------

class TrashCan(models.Model):
    status = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    last_emptied = models.DateTimeField()
    capacity = models.FloatField()
    managers = models.ManyToManyField(User, related_name='managed_trashcans')

    def __str__(self):
        return f"TrashCan {self.name} at {self.location}"


class Task(models.Model):
    task_type = models.CharField(max_length=100)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=50)
    trashcans = models.ManyToManyField(TrashCan, related_name='assigned_tasks')

    def __str__(self):
        return f"Task {self.task_type} on {self.scheduled_date}"


class Sensor(models.Model):
    sensor_type = models.CharField(max_length=50)
    current_value = models.FloatField()
    last_ping = models.DateTimeField(default=timezone.now)
    trashcan = models.OneToOneField(TrashCan, on_delete=models.CASCADE, related_name='sensor')

    def __str__(self):
        return f"Sensor {self.id} ({self.sensor_type})"


class Alert(models.Model):
    project_details = models.TextField()
    task_deadline = models.DateField()
    detail = models.TextField()
    notified_users = models.ManyToManyField(User, related_name='alerts_notified')

    def __str__(self):
        return f"Alert {self.id}"


class Measurement(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='measurements')
    fill_level = models.FloatField()
    date_time = models.DateTimeField()
    triggered_alert = models.OneToOneField(Alert, on_delete=models.SET_NULL, null=True, blank=True, related_name='triggering_measurement')

    def __str__(self):
        return f"Measurement at {self.date_time}"


class Verification(models.Model):
    date_verification = models.DateTimeField()
    total_verifications = models.IntegerField()
    trashcan = models.ForeignKey(TrashCan, on_delete=models.CASCADE, related_name='verifications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verifications_done')

    def __str__(self):
        return f"Verification on {self.date_verification} by {self.user}"
