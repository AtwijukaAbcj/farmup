"""farm_support_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

def home_view(request):
    return JsonResponse({
        'message': 'Farm Support Backend API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'authentication': '/api/auth/',
            'farmers': '/api/farmers/',
            'loans': '/api/loans/',
            'animals': '/api/animals/',
            'marketplace': '/api/marketplace/',
            'token_refresh': '/api/token/refresh/'
        }
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/farmers/', include('apps.farmers.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/animals/', include('apps.animals.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/land/', include('apps.lands.urls')),
    path('api/activities/', include('apps.activities.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)