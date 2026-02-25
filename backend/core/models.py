from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('worker', 'Worker'),
        ('poster', 'Job Poster'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Job(models.Model):
    URGENCY_CHOICES = (
        ('regular', 'Regular'),
        ('urgent', 'Urgent'),
    )
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    description = models.TextField()
    wages = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    due_date = models.DateField()
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='regular')
    is_digital = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='jobs/', null=True, blank=True)
    status = models.CharField(max_length=20, default='open') # open, approved, pending, completed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    negotiated_wage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    completion_photo = models.ImageField(upload_to='completions/', null=True, blank=True)

    def __str__(self):
        return f"{self.worker.username} -> {self.job.title}"

class ChatMessage(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message[:20]}"

class Review(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='review')
    worker_rating = models.IntegerField(null=True, blank=True) # Rating given to worker
    worker_feedback = models.TextField(null=True, blank=True)
    poster_rating = models.IntegerField(null=True, blank=True) # Rating given to poster
    poster_feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
