from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    balance = models.DecimalField(null=False, decimal_places=2, max_digits=10, default=0)
