from django.contrib import admin
from .models import Loan, LoanRepayment, LoanDocument


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = [
        'loan_id', 'farmer', 'loan_type', 'requested_amount', 
        'approved_amount', 'status', 'repayment_status', 'application_date'
    ]
    list_filter = ['status', 'loan_type', 'repayment_status', 'application_date']
    search_fields = [
        'loan_id', 'farmer__farmer_id', 'farmer__first_name', 
        'farmer__last_name', 'purpose'
    ]
    readonly_fields = ['created_at', 'updated_at', 'monthly_emi', 'total_amount_payable']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'loan_id', 'farmer', 'loan_type', 'purpose'
            )
        }),
        ('Financial Details', {
            'fields': (
                'requested_amount', 'approved_amount', 'interest_rate', 
                'tenure_months', 'monthly_emi', 'total_amount_payable'
            )
        }),
        ('Loan Details', {
            'fields': (
                'crop_details', 'land_area_for_loan'
            )
        }),
        ('Dates', {
            'fields': (
                'application_date', 'approval_date', 'disbursement_date', 'maturity_date'
            )
        }),
        ('Status', {
            'fields': (
                'status', 'repayment_status'
            )
        }),
        ('System Information', {
            'fields': (
                'processed_by', 'approved_by', 'created_at', 'updated_at'
            )
        }),
        ('Remarks', {
            'fields': (
                'admin_remarks', 'rejection_reason'
            )
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('farmer', 'processed_by', 'approved_by')


@admin.register(LoanRepayment)
class LoanRepaymentAdmin(admin.ModelAdmin):
    list_display = [
        'loan', 'installment_number', 'due_date', 'due_amount',
        'paid_amount', 'status', 'payment_date'
    ]
    list_filter = ['status', 'payment_method', 'due_date', 'payment_date']
    search_fields = [
        'loan__loan_id', 'loan__farmer__farmer_id',
        'transaction_reference'
    ]
    readonly_fields = ['created_at', 'updated_at', 'is_overdue']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('loan', 'loan__farmer', 'recorded_by')


@admin.register(LoanDocument)
class LoanDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'loan', 'document_type', 'document_name', 
        'uploaded_by', 'uploaded_at'
    ]
    list_filter = ['document_type', 'uploaded_at']
    search_fields = [
        'loan__loan_id', 'loan__farmer__farmer_id',
        'document_name'
    ]
    readonly_fields = ['uploaded_at']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('loan', 'loan__farmer', 'uploaded_by')