from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Task, TaskGroup

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# 1. NEW: This powers the Sidebar and the "Member Picker"
class TaskGroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    # Allows adding members by ID during creation
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=User.objects.all(), source='members'
    )

    class Meta:
        model = TaskGroup
        fields = ['id', 'name', 'description', 'creator', 'members', 'member_ids', 'created_at']
        read_only_fields = ['creator']

class TaskSerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.username')
    # Show the name in the UI, but use ID for the database update
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'deadline', 
            'completed', 'assigned_to', 'assigned_to_username', 
            'creator', 'group'
        ]

    # 2. VALIDATION: Keeping your deadline check
    def validate_deadline(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    # 3. BRUTAL LOGIC: Enforce the "Group-Only Assignment"
    def validate(self, data):
        group = data.get('group')
        assigned_to = data.get('assigned_to')

        # If a group is set and an assignee is chosen, they MUST be in that group
        if group and assigned_to:
            if assigned_to not in group.members.all():
                raise serializers.ValidationError(
                    {"assigned_to": "That user is not a member of this workspace!"}
                )
        return data