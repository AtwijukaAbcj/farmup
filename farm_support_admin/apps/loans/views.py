from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q
from datetime import date
from .models import Loan, LoanRepayment, LoanDocument
from .serializers import (
    LoanSerializer, LoanCreateSerializer, LoanListSerializer,
    LoanRepaymentSerializer, LoanDocumentSerializer, LoanStatsSerializer
)


class LoanListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'loan_type', 'repayment_status']
    search_fields = ['loan_id', 'farmer__farmer_id', 'farmer__first_name', 'farmer__last_name']
    ordering_fields = ['created_at', 'loan_id', 'requested_amount', 'application_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Loan.objects.select_related('farmer', 'processed_by', 'approved_by')
        user = self.request.user
        
        # For farmer users: Only show their own loans
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(farmer=user.farmer_profile)
        else:
            # For admin/staff: Allow filtering by farmer ID parameter
            farmer_id = self.request.query_params.get('farmer', None)
            if farmer_id:
                queryset = queryset.filter(farmer_id=farmer_id)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LoanCreateSerializer
        elif self.request.query_params.get('detailed') == 'true':
            return LoanSerializer
        return LoanListSerializer
    
    def perform_create(self, serializer):
        serializer.save(processed_by=self.request.user)


class LoanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'loan_id'
    
    def get_queryset(self):
        queryset = Loan.objects.select_related('farmer', 'processed_by', 'approved_by')
        user = self.request.user
        
        # For farmer users: Only allow access to their own loans
        if hasattr(user, 'farmer_profile') and user.role in ['user', 'farmer']:
            queryset = queryset.filter(farmer=user.farmer_profile)
        
        return queryset


class LoanRepaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanRepaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        return LoanRepayment.objects.filter(loan__loan_id=loan_id).select_related('loan', 'recorded_by')
    
    def perform_create(self, serializer):
        loan_id = self.kwargs.get('loan_id')
        loan = Loan.objects.get(loan_id=loan_id)
        serializer.save(loan=loan, recorded_by=self.request.user)


class LoanRepaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanRepaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        return LoanRepayment.objects.filter(loan__loan_id=loan_id).select_related('loan', 'recorded_by')


class LoanDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        return LoanDocument.objects.filter(loan__loan_id=loan_id).select_related('loan', 'uploaded_by')
    
    def perform_create(self, serializer):
        loan_id = self.kwargs.get('loan_id')
        loan = Loan.objects.get(loan_id=loan_id)
        serializer.save(loan=loan, uploaded_by=self.request.user)


class LoanDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LoanDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        return LoanDocument.objects.filter(loan__loan_id=loan_id).select_related('loan', 'uploaded_by')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def loan_stats_view(request):
    """Get loan statistics"""
    stats = {
        'total_loans': Loan.objects.count(),
        'pending_loans': Loan.objects.filter(status='pending').count(),
        'approved_loans': Loan.objects.filter(status='approved').count(),
        'disbursed_loans': Loan.objects.filter(status='disbursed').count(),
        'rejected_loans': Loan.objects.filter(status='rejected').count(),
        'closed_loans': Loan.objects.filter(status='closed').count(),
    }
    
    # Financial statistics
    disbursed_total = Loan.objects.filter(status='disbursed').aggregate(
        total=Sum('approved_amount')
    )['total'] or 0
    stats['total_disbursed_amount'] = disbursed_total
    stats['total_outstanding_amount'] = disbursed_total  # Simplified calculation
    
    # Overdue repayments
    stats['overdue_repayments'] = LoanRepayment.objects.filter(
        status='pending', due_date__lt=date.today()
    ).count()
    
    # Loans by type
    loan_type_stats = Loan.objects.values('loan_type').annotate(
        count=Count('id')
    ).order_by('-count')
    stats['loans_by_type'] = {item['loan_type']: item['count'] for item in loan_type_stats}
    
    # Repayment status breakdown
    repayment_stats = Loan.objects.values('repayment_status').annotate(
        count=Count('id')
    )
    stats['repayment_status_breakdown'] = {
        item['repayment_status']: item['count'] for item in repayment_stats
    }
    
    serializer = LoanStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def overdue_repayments_view(request):
    """Get overdue repayments"""
    overdue_repayments = LoanRepayment.objects.filter(
        status='pending', due_date__lt=date.today()
    ).select_related('loan', 'loan__farmer').order_by('due_date')
    
    serializer = LoanRepaymentSerializer(overdue_repayments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_update_loan_status(request):
    """Bulk update loan status"""
    loan_ids = request.data.get('loan_ids', [])
    new_status = request.data.get('status')
    
    if not loan_ids or not new_status:
        return Response(
            {'error': 'loan_ids and status are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    valid_statuses = ['pending', 'under_review', 'approved', 'disbursed', 'rejected', 'closed']
    if new_status not in valid_statuses:
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Loan.objects.filter(loan_id__in=loan_ids).update(status=new_status)
    
    return Response({
        'message': f'Updated {updated_count} loans status to {new_status}',
        'updated_count': updated_count
    })