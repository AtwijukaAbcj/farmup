from rest_framework import generics, permissions
from .models import Land
from .serializers import LandSerializer

class LandListCreateView(generics.ListCreateAPIView):
    serializer_class = LandSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Land.objects.all()
        user = self.request.user
        
        # For farmer users: Only show their own lands
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(farmer=user.farmer_profile)
        else:
            # For admin/staff: Allow filtering by farmer ID parameter
            farmer_id = self.request.query_params.get('farmer', None)
            if farmer_id:
                queryset = queryset.filter(farmer_id=farmer_id)
        
        return queryset.order_by('-id')

    def perform_create(self, serializer):
        # Use farmer from validated data, not from request.user
        serializer.save()
