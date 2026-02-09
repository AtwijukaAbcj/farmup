from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from .models import Animal, AnimalHealthRecord
from .serializers import AnimalSerializer, AnimalListSerializer, AnimalHealthRecordSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing animals with RFID tags
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Animal.objects.select_related('farmer').all()
        user = self.request.user
        
        # For farmer users: Only show their own animals
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(farmer=user.farmer_profile)
        else:
            # For admin/staff: Allow filtering by farmer_id parameter
            farmer_id = self.request.query_params.get('farmer_id', None)
            if farmer_id:
                queryset = queryset.filter(farmer_id=farmer_id)
        
        # Additional filter parameters
        rfid_tag = self.request.query_params.get('rfid_tag', None)
        animal_type = self.request.query_params.get('animal_type', None)
        health_status = self.request.query_params.get('health_status', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if rfid_tag:
            queryset = queryset.filter(rfid_tag__icontains=rfid_tag)
        if animal_type:
            queryset = queryset.filter(animal_type=animal_type)
        if health_status:
            queryset = queryset.filter(health_status=health_status)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AnimalListSerializer
        return AnimalSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about animals"""
        queryset = self.get_queryset()
        
        stats = {
            'total_animals': queryset.count(),
            'active_animals': queryset.filter(is_active=True).count(),
            'by_type': {},
            'by_health_status': {},
            'healthy_count': queryset.filter(health_status='healthy').count(),
            'sick_count': queryset.filter(health_status__in=['sick', 'under_treatment']).count(),
            'average_weight': queryset.aggregate(Avg('weight_kg'))['weight_kg__avg'] or 0,
        }
        
        # Count by animal type
        type_counts = queryset.values('animal_type').annotate(count=Count('id'))
        for item in type_counts:
            stats['by_type'][item['animal_type']] = item['count']
        
        # Count by health status
        health_counts = queryset.values('health_status').annotate(count=Count('id'))
        for item in health_counts:
            stats['by_health_status'][item['health_status']] = item['count']
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def health_history(self, request, pk=None):
        """Get health history for a specific animal"""
        animal = self.get_object()
        records = animal.health_records.all()
        serializer = AnimalHealthRecordSerializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_health_record(self, request, pk=None):
        """Add a health record for an animal"""
        animal = self.get_object()
        serializer = AnimalHealthRecordSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(animal=animal)
            
            # Update animal's last checkup date if applicable
            if serializer.validated_data['record_type'] in ['checkup', 'treatment']:
                animal.last_checkup_date = serializer.validated_data['record_date']
            if serializer.validated_data['record_type'] == 'vaccination':
                animal.last_vaccination_date = serializer.validated_data['record_date']
            animal.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def scan(self, request):
        """Scan/lookup an animal by RFID tag"""
        rfid_tag = request.query_params.get('rfid_tag', None)
        
        if not rfid_tag:
            return Response(
                {'error': 'rfid_tag parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            animal = Animal.objects.select_related('farmer').get(rfid_tag=rfid_tag)
            serializer = AnimalSerializer(animal)
            return Response(serializer.data)
        except Animal.DoesNotExist:
            return Response(
                {'error': 'Animal with this RFID tag not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AnimalHealthRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing animal health records
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AnimalHealthRecordSerializer
    
    def get_queryset(self):
        queryset = AnimalHealthRecord.objects.select_related('animal', 'animal__farmer').all()
        user = self.request.user
        
        # For farmer users: Only show their own animals' health records
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(animal__farmer=user.farmer_profile)
        
        # Filter by animal
        animal_id = self.request.query_params.get('animal_id', None)
        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)
        
        return queryset
