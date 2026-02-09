from rest_framework import serializers
from .models import Loan, LoanRepayment, LoanDocument


class LoanSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    monthly_emi = serializers.ReadOnlyField()
    total_amount_payable = serializers.ReadOnlyField()
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Loan
        fields = [
            'id', 'loan_id', 'farmer', 'farmer_name', 'loan_type',
            'requested_amount', 'approved_amount', 'interest_rate', 'tenure_months',
            'purpose', 'crop_details', 'land_area_for_loan',
            'application_date', 'approval_date', 'disbursement_date', 'maturity_date',
            'status', 'repayment_status', 'monthly_emi', 'total_amount_payable',
            'processed_by', 'processed_by_name', 'approved_by', 'approved_by_name',
            'admin_remarks', 'rejection_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_requested_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested amount must be greater than 0")
        return value
    
    def validate_interest_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Interest rate must be between 0 and 100")
        return value
    
    def validate_tenure_months(self, value):
        if value <= 0:
            raise serializers.ValidationError("Tenure must be greater than 0 months")
        return value


class LoanCreateSerializer(LoanSerializer):
    """Serializer for creating loans with required fields validation"""
    
    def validate_loan_id(self, value):
        if Loan.objects.filter(loan_id=value).exists():
            raise serializers.ValidationError("Loan ID already exists")
        return value


class LoanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for loan list views"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    monthly_emi = serializers.ReadOnlyField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'loan_id', 'farmer_name', 'loan_type', 'requested_amount',
            'approved_amount', 'status', 'repayment_status', 'monthly_emi',
            'application_date', 'maturity_date'
        ]


class LoanRepaymentSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    farmer_name = serializers.CharField(source='loan.farmer.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = LoanRepayment
        fields = [
            'id', 'loan', 'loan_id', 'farmer_name', 'installment_number',
            'due_date', 'due_amount', 'paid_amount', 'payment_date', 'payment_method',
            'status', 'transaction_reference', 'late_fee', 'is_overdue',
            'recorded_by', 'recorded_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoanDocumentSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.loan_id', read_only=True)
    farmer_name = serializers.CharField(source='loan.farmer.full_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = LoanDocument
        fields = [
            'id', 'loan', 'loan_id', 'farmer_name', 'document_type',
            'document_name', 'document_file', 'uploaded_by', 'uploaded_by_name',
            'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']


class LoanStatsSerializer(serializers.Serializer):
    """Serializer for loan statistics"""
    total_loans = serializers.IntegerField()
    pending_loans = serializers.IntegerField()
    approved_loans = serializers.IntegerField()
    disbursed_loans = serializers.IntegerField()
    rejected_loans = serializers.IntegerField()
    closed_loans = serializers.IntegerField()
    total_disbursed_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_outstanding_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_repayments = serializers.IntegerField()
    loans_by_type = serializers.DictField()
    repayment_status_breakdown = serializers.DictField()