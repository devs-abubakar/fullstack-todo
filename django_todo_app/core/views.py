from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Task, TaskGroup, Friendship
from .serializers import TaskSerializer, TaskGroupSerializer, UserSerializer, FriendshipSerializer


from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import generics, permissions, filters

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Keep these, but we'll make get_queryset smarter
    filter_backends = [filters.SearchFilter]
    search_fields = ['username']

    def get_queryset(self):
        # 1. Start with everyone EXCEPT the logged-in user
        queryset = User.objects.exclude(id=self.request.user.id)
        
        # 2. Get the 'q' parameter from the URL (?q=...)
        # Note: If your frontend uses ?search=, SearchFilter handles it.
        # If your frontend uses ?q=, we handle it manually here:
        query = self.request.query_params.get('q', None)
        
        if query:
            # __icontains is essential for PostgreSQL (Neon)
            queryset = queryset.filter(username__icontains=query)
            
        return queryset.order_by('username')
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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 🚨 THE FIX: If we are targeting a specific task (DELETE/PATCH),
        # look at ALL tasks the user has a right to see, ignoring the group filter.
        if self.detail:
            return Task.objects.filter(Q(creator=user) | Q(assigned_to=user) | Q(group__members=user)).distinct()

        group_id = self.request.query_params.get('group')
        if group_id:
            return Task.objects.filter(group_id=group_id, group__members=user)
        
        return Task.objects.filter(
            Q(group__isnull=True, creator=user) | Q(assigned_to=user)
        ).distinct()
    
    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        # Only the person who created the task can kill it
        if task.creator != request.user:
            return Response(
                {"error": "You didn't create this. Hands off."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['patch', 'post'])
    def toggle(self, request, pk=None):
        task = self.get_object()
        user=request.user
        if task.creator != user and task.assigned_to != user:
            return Response(
                {"error": "You aren't responsible for this task!"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        task.completed = not task.completed
        task.save()
        return Response({'status': 'task toggled', 'completed': task.completed})
    
    #4 Adding Friends

class FriendshipViewset(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Base queryset MUST return Friendship objects.
        We filter to only show friendships the current user is part of.
        """
        user = self.request.user
        return Friendship.objects.filter(Q(creator=user) | Q(friend=user))

    def perform_create(self, serializer):
        """
        Handle the 'Send Request' logic with proper error raising.
        """
        friend = serializer.validated_data.get('friend')
        user = self.request.user

        if friend == user:
            raise ValidationError({"error": "You cannot friend yourself."})

        # Check if any relationship (pending or accepted) already exists
        exists = Friendship.objects.filter(
            (Q(creator=user, friend=friend) | Q(creator=friend, friend=user))
        ).exists()

        if exists:
            raise ValidationError({"error": "Friendship or request already exists."})
        
        serializer.save(creator=user)

    @action(detail=False, methods=['get'])
    def discover_people(self, request):
        """
        Logic to find users you ARE NOT friends with yet.
        """
        user = request.user
        # Get all IDs of people you have a relationship with
        friend_ids = Friendship.objects.filter(
            Q(creator=user) | Q(friend=user)
        ).values_list('creator_id', 'friend_id')
        
        flattened_ids = {uid for tup in friend_ids for uid in tup}
        
        # Exclude them and yourself
        users = User.objects.exclude(id__in=flattened_ids).exclude(id=user.id).order_by('username')
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def requests(self, request):
        """
        Get incoming pending requests.
        """
        pending = Friendship.objects.filter(friend=request.user, status='pending')
        serializer = FriendshipSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accept a specific friendship request.
        """
        try:
            # We use the base queryset here
            friendship = self.get_object()
            
            if friendship.friend != request.user:
                return Response({"error": "Only the recipient can accept this."}, status=status.HTTP_403_FORBIDDEN)
            
            friendship.status = 'accepted'
            friendship.save()
            return Response({"status": "Friendship Accepted"}, status=status.HTTP_200_OK)
            
        except Friendship.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def accepted_friends(self, request):
        """
        Get list of confirmed friends.
        """
        friends = Friendship.objects.filter(
            (Q(creator=request.user) | Q(friend=request.user)),
            status='accepted'
        )
        serializer = FriendshipSerializer(friends, many=True, context={'request': request})
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        friendship = self.get_object()
        # Only the creator or the receiver can cancel/delete a friendship
        if friendship.creator != request.user and friendship.friend != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)