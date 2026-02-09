from django.urls import path
from .views import LandListCreateView

urlpatterns = [
    path('', LandListCreateView.as_view(), name='land_list_create'),
]
