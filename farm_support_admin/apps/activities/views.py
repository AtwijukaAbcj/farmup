from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Activity
from .serializers import ActivitySerializer

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Activity.objects.all()
        user = self.request.user
        
        # For farmer users: Only show their own activities
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(farmer=user.farmer_profile)
        else:
            # For admin/staff: Allow filtering by farmer ID parameter
            farmer_id = self.request.query_params.get('farmer', None)
            if farmer_id:
                queryset = queryset.filter(farmer_id=farmer_id)
        
        return queryset.order_by('-created_at')
