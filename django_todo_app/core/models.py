from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User

def get_deadline():
    return timezone.now() + timedelta(hours=24)

# 1. NEW: The "Container" for your collaborative work
class TaskGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_groups")
    members = models.ManyToManyField(User, related_name="joined_groups")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    
    # 2. UPDATED: Link the task to a group
    # null=True allows for "Private" tasks that don't belong to any group
    group = models.ForeignKey(TaskGroup, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    
    # 3. ASSIGNMENT LOGIC: Change to ForeignKey if one person handles it, 
    # or keep ManyToMany if multiple people do. (I recommend ForeignKey for 'Tagging' one person)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tasks")
    
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(default=get_deadline)
    completed = models.BooleanField(default=False)

    def __str__(self):
        status = "✅" if self.completed else "⏳"
        return f"{status} {self.title} | Group: {self.group.name if self.group else 'Private'}"