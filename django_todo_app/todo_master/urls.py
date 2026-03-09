from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# Make sure these are the correct imports for your API-only views
from core.api_view import SignupApiView, LoginApiView 
from core.views import TaskViewSet,UserMeView,TaskGroupViewSet,RegisterView, FriendshipViewset,UserSearchView


router = DefaultRouter()
router.register(r'groups', TaskGroupViewSet,basename='taskgroup')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r"friendships",FriendshipViewset,basename="friendship")

urlpatterns = [
    path('admin/', admin.site.urls),

    # 1. THE ONLY LOGIN YOU NEED: Standard JWT for existing users
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    path('api/users/search/', UserSearchView.as_view(), name='user_search'),
    # 2. THE ONLY SIGNUP YOU NEED: Custom RegisterView (returns tokens + creates user)
    path('api/register/', RegisterView.as_view(), name='register'),

    # 3. USER INFO: To verify who is logged in on the frontend
    path('api/me/', UserMeView.as_view(), name='user_me'),



    # 4. DATA ENDPOINTS: Groups, Tasks and Friendships
    path('api/', include(router.urls)),
]