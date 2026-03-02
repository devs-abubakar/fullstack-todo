from django import forms
from .models import Task

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'deadline']
        # Adding some CSS classes so it doesn't look like it's from 1995
        widgets = {
            'deadline': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }