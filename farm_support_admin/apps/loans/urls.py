from django.urls import path
from . import views

app_name = 'loans'

urlpatterns = [
    # Loan URLs
    path('', views.LoanListCreateView.as_view(), name='loan_list_create'),
    path('<str:loan_id>/', views.LoanDetailView.as_view(), name='loan_detail'),
    path('stats/', views.loan_stats_view, name='loan_stats'),
    path('bulk-update-status/', views.bulk_update_loan_status, name='bulk_update_status'),
    
    # Loan Repayment URLs
    path('<str:loan_id>/repayments/', views.LoanRepaymentListCreateView.as_view(), name='loan_repayments'),
    path('<str:loan_id>/repayments/<int:pk>/', views.LoanRepaymentDetailView.as_view(), name='loan_repayment_detail'),
    path('repayments/overdue/', views.overdue_repayments_view, name='overdue_repayments'),
    
    # Loan Document URLs
    path('<str:loan_id>/documents/', views.LoanDocumentListCreateView.as_view(), name='loan_documents'),
    path('<str:loan_id>/documents/<int:pk>/', views.LoanDocumentDetailView.as_view(), name='loan_document_detail'),
]