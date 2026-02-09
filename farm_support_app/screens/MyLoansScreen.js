import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function MyLoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const result = await ApiService.getMyLoans();
      if (result.success) {
        setLoans(result.data.results || result.data || []);
      } else {
        Alert.alert('Error', result.error || 'Failed to load loans');
      }
    } catch (error) {
      console.error('Load loans error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'rejected':
        return '#e74c3c';
      case 'disbursed':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Ionicons name="checkmark-circle" size={20} color="#27ae60" />;
      case 'pending':
        return <Ionicons name="time" size={20} color="#f39c12" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={20} color="#e74c3c" />;
      case 'disbursed':
        return <Ionicons name="cash" size={20} color="#2ecc71" />;
      default:
        return <Ionicons name="document" size={20} color="#95a5a6" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLoanPress = (loan) => {
    Alert.alert(
      `Loan Details - ${loan.loan_id || 'N/A'}`,
      `Amount: ${formatCurrency(loan.requested_amount)}
Purpose: ${loan.purpose || 'N/A'}
Status: ${loan.status || 'N/A'}
Applied: ${formatDate(loan.application_date)}
${loan.approval_date ? `Approved: ${formatDate(loan.approval_date)}` : ''}
${loan.disbursement_date ? `Disbursed: ${formatDate(loan.disbursement_date)}` : ''}
${loan.admin_remarks ? `Remarks: ${loan.admin_remarks}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  const renderLoanCard = (loan, index) => (
    <TouchableOpacity
      key={loan.id || index}
      style={styles.loanCard}
      onPress={() => handleLoanPress(loan)}
    >
      <View style={styles.loanHeader}>
        <View style={styles.loanTitleContainer}>
          <Text style={styles.loanId}>
            {getStatusIcon(loan.status)} {loan.loan_id || `Loan #${loan.id}`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) }]}>
            <Text style={styles.statusText}>{loan.status?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.loanContent}>
        <View style={styles.loanRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{formatCurrency(loan.requested_amount)}</Text>
        </View>
        
        <View style={styles.loanRow}>
          <Text style={styles.label}>Purpose:</Text>
          <Text style={styles.value}>{loan.purpose || 'N/A'}</Text>
        </View>
        
        <View style={styles.loanRow}>
          <Text style={styles.label}>Applied:</Text>
          <Text style={styles.value}>{formatDate(loan.application_date)}</Text>
        </View>

        {loan.approved_amount && (
          <View style={styles.loanRow}>
            <Text style={styles.label}>Approved:</Text>
            <Text style={[styles.value, styles.approvedAmount]}>
              {formatCurrency(loan.approved_amount)}
            </Text>
          </View>
        )}

        {loan.tenure_months && (
          <View style={styles.loanRow}>
            <Text style={styles.label}>Tenure:</Text>
            <Text style={styles.value}>{loan.tenure_months} months</Text>
          </View>
        )}
      </View>

      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>Tap for more details</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading your loans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="cash-outline" size={24} color="#fff" /> My Loans</Text>
        <Text style={styles.subtitle}>Track your loan applications</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Loans Yet</Text>
            <Text style={styles.emptyText}>
              You haven't applied for any loans yet. Start by submitting your first loan application!
            </Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => navigation.navigate('LoanApplication')}
            >
              <Text style={styles.applyButtonText}>Apply for Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                You have {loans.length} loan application{loans.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {loans.map((loan, index) => renderLoanCard(loan, index))}

            <TouchableOpacity
              style={styles.newLoanButton}
              onPress={() => navigation.navigate('LoanApplication')}
            >
              <Text style={styles.newLoanButtonText}>+ Apply for New Loan</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#27ae60',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e8',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  loanHeader: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  loanTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loanContent: {
    padding: 15,
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  approvedAmount: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  tapHint: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  applyButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newLoanButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  newLoanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});