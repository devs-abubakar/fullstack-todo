from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Task, TaskGroup
from .serializers import TaskSerializer, TaskGroupSerializer, UserSerializer


from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(APIView):
    # 🚨 CRITICAL: Allow anyone to access this, otherwise they can't sign up!
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create the User
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=email
        )

        # 2. THE AUTO-LOGIN: Generate JWT tokens immediately
        refresh = RefreshToken.for_user(user)
        
        # 3. Return user data + tokens
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
# 1. AUTH: Keep this for the Frontend to know who is logged in
class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# 2. SIDEBAR: This provides the list of groups for the Shadcn Sidebar
class TaskGroupViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskGroupSerializer

    def get_queryset(self):
        # Only show groups where the user is a member
        return TaskGroup.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        # Automatically make the creator a member of their own group
        group = serializer.save(creator=self.request.user)
        group.members.add(self.request.user)

# 3. TASKS: The core logic for collaborative and personal tasks
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated] # You can add back IsAssignedorCreator later

    def get_queryset(self):
        user = self.request.user
        group_id = self.request.query_params.get('group')

        # SCENARIO A: User clicked a Group in the Sidebar
        if group_id:
            return Task.objects.filter(group_id=group_id, group__members=user)
        
        # SCENARIO B: Personal View (Tasks with no group OR assigned specifically to me)
        return Task.objects.filter(
            Q(group__isnull=True, creator=user) | Q(assigned_to=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['patch', 'post'])
    def toggle(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        return Response({'status': 'task toggled', 'completed': task.completed})