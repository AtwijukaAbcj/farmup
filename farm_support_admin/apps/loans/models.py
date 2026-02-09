from django.db import models
from django.contrib.auth import get_user_model
from apps.farmers.models import Farmer

User = get_user_model()


class Loan(models.Model):
    LOAN_TYPES = [
        ('crop_loan', 'Crop Loan'),
        ('equipment_loan', 'Equipment Loan'),
        ('land_development', 'Land Development Loan'),
        ('livestock_loan', 'Livestock Loan'),
        ('emergency_loan', 'Emergency Loan'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('disbursed', 'Disbursed'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]
    
    REPAYMENT_STATUS = [
        ('not_started', 'Not Started'),
        ('on_time', 'On Time'),
        ('overdue', 'Overdue'),
        ('completed', 'Completed'),
        ('defaulted', 'Defaulted'),
    ]
    
    # Basic Information
    loan_id = models.CharField(max_length=20, unique=True)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPES)
    
    # Financial Details
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Annual interest rate in %")
    tenure_months = models.PositiveIntegerField(help_text="Loan tenure in months")
    
    # Purpose and Details
    purpose = models.TextField(help_text="Purpose of the loan")
    crop_details = models.TextField(blank=True, null=True, help_text="Details about crop if applicable")
    land_area_for_loan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Land area in acres")
    
    # Dates
    application_date = models.DateTimeField(auto_now_add=True)
    approval_date = models.DateTimeField(null=True, blank=True)
    disbursement_date = models.DateTimeField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    repayment_status = models.CharField(max_length=20, choices=REPAYMENT_STATUS, default='not_started')
    
    # System Information
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='processed_loans')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_loans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Remarks
    admin_remarks = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.loan_id} - {self.farmer.full_name} - {self.get_loan_type_display()}"
    
    @property
    def monthly_emi(self):
        if self.approved_amount and self.interest_rate and self.tenure_months:
            principal = float(self.approved_amount)
            rate = float(self.interest_rate) / 12 / 100  # Monthly interest rate
            months = self.tenure_months
            
            if rate > 0:
                emi = principal * rate * (1 + rate) ** months / ((1 + rate) ** months - 1)
                return round(emi, 2)
            else:
                return round(principal / months, 2)
        return 0
    
    @property
    def total_amount_payable(self):
        return self.monthly_emi * self.tenure_months if self.monthly_emi else 0


class LoanRepayment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('partial', 'Partial'),
    ]
    
    PAYMENT_METHODS = [
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('online', 'Online Payment'),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='repayments')
    installment_number = models.PositiveIntegerField()
    due_date = models.DateField()
    due_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True, null=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    
    # Payment Details
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    late_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # System Information
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date']
        unique_together = ['loan', 'installment_number']
    
    def __str__(self):
        return f"{self.loan.loan_id} - Installment {self.installment_number}"
    
    @property
    def is_overdue(self):
        from datetime import date
        return self.status == 'pending' and self.due_date < date.today()


class LoanDocument(models.Model):
    DOCUMENT_TYPES = [
        ('application', 'Loan Application'),
        ('income_proof', 'Income Proof'),
        ('land_document', 'Land Document'),
        ('crop_plan', 'Crop Plan'),
        ('bank_statement', 'Bank Statement'),
        ('guarantor_document', 'Guarantor Document'),
        ('approval_letter', 'Approval Letter'),
        ('agreement', 'Loan Agreement'),
        ('other', 'Other'),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_name = models.CharField(max_length=200)
    document_file = models.FileField(upload_to='loan_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['loan', 'document_type']
    
    def __str__(self):
        return f"{self.loan.loan_id} - {self.document_type}"