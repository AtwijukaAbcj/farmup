from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnimalViewSet, AnimalHealthRecordViewSet

router = DefaultRouter()
router.register(r'animals', AnimalViewSet, basename='animal')
router.register(r'health-records', AnimalHealthRecordViewSet, basename='health-record')

urlpatterns = [
    path('', include(router.urls)),
]
