from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg
from .models import Farmer, FarmerDocument
from .serializers import (
    FarmerSerializer, FarmerCreateSerializer, FarmerListSerializer,
    FarmerDocumentSerializer, FarmerStatsSerializer
)


class FarmerListCreateView(generics.ListCreateAPIView):
    queryset = Farmer.objects.select_related('user')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender', 'district', 'username']
    search_fields = ['farmer_id', 'first_name', 'last_name', 'phone_number', 'village', 'username']
    ordering_fields = ['created_at', 'farmer_id', 'first_name', 'total_land_area']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FarmerCreateSerializer
        elif self.request.query_params.get('detailed') == 'true':
            return FarmerSerializer
        return FarmerListSerializer

    def perform_create(self, serializer):
        serializer.save()


class FarmerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Farmer.objects.select_related('user')
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'farmer_id'
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]


class FarmerDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = FarmerDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        farmer_id = self.kwargs.get('farmer_id')
        return FarmerDocument.objects.filter(farmer__farmer_id=farmer_id).select_related('farmer', 'uploaded_by')
    
    def perform_create(self, serializer):
        farmer_id = self.kwargs.get('farmer_id')
        farmer = Farmer.objects.get(farmer_id=farmer_id)
        serializer.save(farmer=farmer, uploaded_by=self.request.user)


class FarmerDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FarmerDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        farmer_id = self.kwargs.get('farmer_id')
        return FarmerDocument.objects.filter(farmer__farmer_id=farmer_id).select_related('farmer', 'uploaded_by')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def farmer_stats_view(request):
    """Get farmer statistics"""
    stats = {
        'total_farmers': Farmer.objects.count(),
        'active_farmers': Farmer.objects.filter(status='active').count(),
        'inactive_farmers': Farmer.objects.filter(status='inactive').count(),
        'suspended_farmers': Farmer.objects.filter(status='suspended').count(),
    }
    
    # Farmers by district
    district_stats = Farmer.objects.values('district').annotate(count=Count('id')).order_by('-count')
    stats['farmers_by_district'] = {item['district']: item['count'] for item in district_stats}
    
    # Farmers by gender
    gender_stats = Farmer.objects.values('gender').annotate(count=Count('id'))
    stats['farmers_by_gender'] = {item['gender']: item['count'] for item in gender_stats}
    
    # Land area statistics
    land_stats = Farmer.objects.aggregate(
        total_land=Sum('total_land_area'),
        avg_land=Avg('total_land_area')
    )
    stats['total_land_area'] = land_stats['total_land'] or 0
    stats['avg_land_per_farmer'] = land_stats['avg_land'] or 0
    
    serializer = FarmerStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_update_farmer_status(request):
    """Bulk update farmer status"""
    farmer_ids = request.data.get('farmer_ids', [])
    new_status = request.data.get('status')
    
    if not farmer_ids or not new_status:
        return Response(
            {'error': 'farmer_ids and status are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_status not in ['active', 'inactive', 'suspended']:
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Farmer.objects.filter(farmer_id__in=farmer_ids).update(status=new_status)
    
    return Response({
        'message': f'Updated {updated_count} farmers status to {new_status}',
        'updated_count': updated_count
    })