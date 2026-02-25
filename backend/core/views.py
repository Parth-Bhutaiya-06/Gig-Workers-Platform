from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Job, Application, ChatMessage, Review
from .serializers import UserSerializer, JobSerializer, ApplicationSerializer, ChatMessageSerializer, ReviewSerializer
from django.db.models import Sum, Avg, Q

class IsPosterOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.poster == request.user

class UserSignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsPosterOrReadOnly)

    def perform_destroy(self, instance):
        if instance.poster != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own jobs.")
        instance.delete()

    def perform_create(self, serializer):
        serializer.save(poster=self.request.user)

    def get_queryset(self):
        queryset = Job.objects.all()
        category = self.request.query_params.get('category')
        urgency = self.request.query_params.get('urgency')
        search = self.request.query_params.get('search')
        if category:
            queryset = queryset.filter(category=category)
        if urgency:
            queryset = queryset.filter(urgency=urgency)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        return queryset

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(worker=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'worker':
            return Application.objects.filter(worker=user)
        return Application.objects.filter(job__poster=user)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        
        # 1. Handle Wage Update (Finalizing/Appointing)
        if 'negotiated_wage' in serializer.validated_data:
            if instance.job.poster != user:
                raise permissions.PermissionDenied("Only the job poster can update the wage.")
            if instance.negotiated_wage is not None:
                raise permissions.PermissionDenied("The wage has already been finalized and cannot be changed.")
            # Automatically set status to approved when wage is locked
            serializer.save(status='approved')
            return

        # 2. Handle Status Update
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            
            # Rejecting
            if new_status == 'rejected':
                if instance.job.poster != user:
                     raise permissions.PermissionDenied("Only the job poster can reject applications.")
                if instance.negotiated_wage is not None:
                    raise permissions.PermissionDenied("Cannot reject application after wage is finalized (Worker is already appointed).")
            
            # Completing
            if new_status == 'completed':
                if instance.job.poster != user:
                    raise permissions.PermissionDenied("Only the job poster can mark the job as completed.")
                if instance.status != 'approved':
                    raise permissions.PermissionDenied("Job must be in progress (approved) before completing.")

        serializer.save()

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        queryset = ChatMessage.objects.filter(
            Q(application__worker=user) | Q(application__job__poster=user)
        )
        app_id = self.request.query_params.get('application')
        if app_id:
            queryset = queryset.filter(application_id=app_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class DashboardView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'worker':
            # Worker Stats
            completed_apps = Application.objects.filter(worker=user, status='completed')
            total_earned = completed_apps.aggregate(Sum('negotiated_wage'))['negotiated_wage__sum'] or 0
            jobs_done = completed_apps.count()
            avg_rating = Review.objects.filter(application__worker=user).aggregate(Avg('worker_rating'))['worker_rating__avg'] or 0
            working_areas = list(completed_apps.values_list('job__location', flat=True).distinct())
            
            stats = {
                'avg_rating': avg_rating,
                'total_earned': total_earned,
                'jobs_done': jobs_done,
                'joined_at': user.joined_at,
                'working_areas': working_areas,
            }
        else:
            # Poster Stats
            posted_jobs = Job.objects.filter(poster=user)
            total_posted = posted_jobs.count()
            pending_jobs = Application.objects.filter(job__poster=user, status='approved').count()
            avg_rating = Review.objects.filter(application__job__poster=user).aggregate(Avg('poster_rating'))['poster_rating__avg'] or 0
            
            stats = {
                'avg_rating': avg_rating,
                'total_posted': total_posted,
                'pending_jobs': pending_jobs,
                'total_jobs': total_posted,
            }
        return Response(stats)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Review.objects.filter(Q(application__worker=user) | Q(application__job__poster=user))

    def perform_create(self, serializer):
        app_id = self.request.data.get('application')
        application = Application.objects.get(id=app_id)
        
        user = self.request.user
        if application.worker != user and application.job.poster != user:
             raise permissions.PermissionDenied("You are not part of this job.")
             
        if application.status != 'completed':
            raise permissions.PermissionDenied("Job must be completed before reviewing.")
            
        serializer.save()
