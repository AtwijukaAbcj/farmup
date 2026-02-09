import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Switch, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function LoanApplicationScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('equipment');
  const [repaymentPeriod, setRepaymentPeriod] = useState('3');
  const [savings, setSavings] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Modal states for custom pickers
  const [purposeModalVisible, setPurposeModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  const purposeOptions = [
    { label: 'Farm Equipment', value: 'equipment' },
    { label: 'Seeds & Seedlings', value: 'seeds' },
    { label: 'Farm Labor', value: 'labor' },
    { label: 'Fertilizer & Pesticides', value: 'fertilizer' },
    { label: 'Land Preparation', value: 'land_preparation' },
    { label: 'Irrigation System', value: 'irrigation' },
    { label: 'Livestock Purchase', value: 'livestock' },
    { label: 'Storage & Processing', value: 'storage' },
  ];

  const periodOptions = [
    { label: '3 months (Short term)', value: '3' },
    { label: '6 months (Medium term)', value: '6' },
    { label: '12 months (Long term)', value: '12' },
    { label: '18 months (Extended)', value: '18' },
    { label: '24 months (Maximum)', value: '24' },
  ];

  const getPurposeLabel = () => {
    const option = purposeOptions.find(opt => opt.value === purpose);
    return option ? option.label : 'Select Purpose';
  };

  const getPeriodLabel = () => {
    const option = periodOptions.find(opt => opt.value === repaymentPeriod);
    return option ? option.label : 'Select Period';
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate amount
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Loan amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) < 50000) {
      newErrors.amount = 'Minimum loan amount is UGX 50,000';
    } else if (parseFloat(amount) > 10000000) {
      newErrors.amount = 'Maximum loan amount is UGX 10,000,000';
    }

    // Validate purpose
    if (!purpose) {
      newErrors.purpose = 'Please select loan purpose';
    }

    // Validate repayment period
    if (!repaymentPeriod) {
      newErrors.repaymentPeriod = 'Please select repayment period';
    }

    // Validate terms agreement
    if (!agreed) {
      newErrors.agreed = 'You must agree to terms and conditions';
    }

    // Validate savings if provided
    if (savings && savings.trim() !== '') {
      if (isNaN(parseFloat(savings)) || parseFloat(savings) < 0) {
        newErrors.savings = 'Please enter a valid savings amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setAmount(cleanText);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const handleSavingsChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setSavings(cleanText);
    
    // Clear savings error when user starts typing
    if (errors.savings) {
      setErrors(prev => ({ ...prev, savings: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Please Fix Errors', 'Please correct the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (!currentUser?.id) {
        Alert.alert('Error', 'Please log in again to submit loan application');
        setLoading(false);
        return;
      }
      // Generate a short unique loan_id (max 20 chars)
      const shortId = Math.random().toString(36).substr(2, 8).toUpperCase();
      const loan_id = `LN${Date.now().toString().slice(-6)}${shortId}`.slice(0, 20);
      const loanData = {
        loan_type: 'crop_loan',
        requested_amount: parseFloat(amount),
        purpose: purpose,
        tenure_months: parseInt(repaymentPeriod),
        interest_rate: 12.0,
        farmer: currentUser.id,
        crop_details: purpose === 'seeds' || purpose === 'fertilizer' ? purpose : null,
        loan_id,
      };
      if (!currentUser.id) {
        Alert.alert('Error', 'No valid farmer ID found. Please ensure your profile is set up.');
        setLoading(false);
        return;
      }
      console.log('Submitting loan data:', loanData);
      const result = await ApiService.createLoan(loanData);
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          `Your loan application for ${new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(parseFloat(amount))} has been submitted successfully!\n\nYou will receive a notification once it's reviewed.`,
          [{ text: 'View My Loans', onPress: () => navigation.navigate('MyLoans') }]
        );
      } else {
        console.error('Loan creation failed:', result.error);
        Alert.alert('Error', JSON.stringify(result.error) || 'Failed to submit loan application');
      }
    } catch (error) {
      console.error('Loan application error:', error);
      Alert.alert('Error', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="cash-outline" size={24} color="#fff" /> Loan Application</Text>
        <Text style={styles.subtitle}>Apply for farm financing</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Loan Amount (UGX) *</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="Enter requested amount (e.g., 500000)"
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        
        <View style={styles.amountHints}>
          <Text style={styles.hintText}>💡 Minimum: UGX 50,000</Text>
          <Text style={styles.hintText}>💡 Maximum: UGX 10,000,000</Text>
        </View>

        <Text style={styles.label}>Purpose of Loan *</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, errors.purpose && styles.inputError]}
          onPress={() => setPurposeModalVisible(true)}
        >
          <Text style={styles.pickerButtonText}>{getPurposeLabel()}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {errors.purpose && <Text style={styles.errorText}>{errors.purpose}</Text>}

        <Text style={styles.label}>Repayment Period *</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, errors.repaymentPeriod && styles.inputError]}
          onPress={() => setPeriodModalVisible(true)}
        >
          <Text style={styles.pickerButtonText}>{getPeriodLabel()}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {errors.repaymentPeriod && <Text style={styles.errorText}>{errors.repaymentPeriod}</Text>}

        <Text style={styles.label}>Current Savings (optional)</Text>
        <TextInput
          style={[styles.input, errors.savings && styles.inputError]}
          keyboardType="numeric"
          value={savings}
          onChangeText={handleSavingsChange}
          placeholder="Enter current savings amount"
        />
        {errors.savings && <Text style={styles.errorText}>{errors.savings}</Text>}
        <Text style={styles.hintText}>💡 Having savings can improve your loan approval chances</Text>

        <View style={[styles.switchRow, errors.agreed && styles.inputError]}>
          <Text style={styles.switchLabel}>I agree to Terms & Conditions *</Text>
          <Switch 
            value={agreed} 
            onValueChange={(value) => {
              setAgreed(value);
              if (errors.agreed) setErrors(prev => ({ ...prev, agreed: null }));
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={agreed ? '#27ae60' : '#f4f3f4'}
          />
        </View>
        {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}

        <View style={styles.interestInfo}>
          <Text style={styles.interestTitle}>📊 Loan Information</Text>
          <Text style={styles.interestText}>• Interest Rate: 12% per annum</Text>
          <Text style={styles.interestText}>• Processing Time: 3-5 business days</Text>
          <Text style={styles.interestText}>• No hidden charges</Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Loan Application</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Purpose Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={purposeModalVisible}
        onRequestClose={() => setPurposeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Loan Purpose</Text>
              <TouchableOpacity onPress={() => setPurposeModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={purposeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    purpose === item.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setPurpose(item.value);
                    if (errors.purpose) setErrors(prev => ({ ...prev, purpose: null }));
                    setPurposeModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    purpose === item.value && styles.modalOptionTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Repayment Period Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={periodModalVisible}
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Repayment Period</Text>
              <TouchableOpacity onPress={() => setPeriodModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={periodOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    repaymentPeriod === item.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setRepaymentPeriod(item.value);
                    if (errors.repaymentPeriod) setErrors(prev => ({ ...prev, repaymentPeriod: null }));
                    setPeriodModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    repaymentPeriod === item.value && styles.modalOptionTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 10,
    marginTop: 2,
  },
  hintText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  amountHints: {
    marginBottom: 15,
  },
  interestInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  interestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  interestText: {
    color: '#2c3e50',
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
    zIndex: 1000,
    elevation: 5, // For Android
  },
  picker: {
    height: 50,
    zIndex: 1000,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  modalOptionSelected: {
    backgroundColor: '#e8f5e8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalOptionTextSelected: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
});
