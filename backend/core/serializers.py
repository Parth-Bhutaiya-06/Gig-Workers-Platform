from rest_framework import serializers
from .models import User, Job, Application, ChatMessage, Review
from django.db.models import Avg

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'location', 'is_verified', 'profile_photo', 'joined_at', 'password')
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('id', 'is_verified', 'joined_at')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class JobSerializer(serializers.ModelSerializer):
    poster_name = serializers.ReadOnlyField(source='poster.username')
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('poster', 'created_at')

class ApplicationSerializer(serializers.ModelSerializer):
    worker_name = serializers.ReadOnlyField(source='worker.username')
    job_title = serializers.ReadOnlyField(source='job.title')
    job_details = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('worker', 'applied_at')

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender', 'timestamp')

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
