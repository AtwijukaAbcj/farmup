import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function ProfileSetupScreen({ navigation }) {
  useEffect(() => {
    const checkRole = async () => {
      const user = await ApiService.getCurrentUser();
      if (user?.role === 'seller') {
        navigation.replace('Dashboard');
      }
    };
    checkRole();
  }, []);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Farmer details
  const [farmerId, setFarmerId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('M');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Address
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Farm details
  const [totalLandArea, setTotalLandArea] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [farmingExperience, setFarmingExperience] = useState('');
  
  // KYC
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await ApiService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
    }
  };

  const generateFarmerId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FARM${timestamp}${randomNum}`;
  };

  const handleSave = async () => {
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !aadharNumber || !address || !village || !district) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate Aadhar number
    if (aadharNumber.length !== 12 || !/^\d{12}$/.test(aadharNumber)) {
      Alert.alert('Error', 'Aadhar number must be 12 digits');
      return;
    }

    setLoading(true);
    
    try {
      const farmerData = {
        farmer_id: farmerId || generateFarmerId(),
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        date_of_birth: dateOfBirth || '1990-01-01', // Default if not provided
        gender,
        phone_number: phoneNumber,
        email: email || '',
        address,
        village,
        district,
        state: state || 'Unknown',
        pincode: pincode || '000000',
        total_land_area: parseFloat(totalLandArea) || 0,
        primary_crop: primaryCrop || 'Mixed',
        farming_experience: parseInt(farmingExperience) || 0,
        aadhar_number: aadharNumber,
        pan_number: panNumber || '',
        bank_account_number: bankAccountNumber || '0000000000',
        bank_ifsc: bankIfsc || 'BANK0000000',
        bank_name: bankName || 'Not Provided',
        status: 'active'
      };

      const result = await ApiService.createFarmer(farmerData);
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Farmer profile created successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
      } else {
        Alert.alert('Error', JSON.stringify(result.error) || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="person-outline" size={24} color="#fff" /> Farmer Registration</Text>
        <Text style={styles.subtitle}>Create your farmer profile</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TextInput
          placeholder="Farmer ID (auto-generated)"
          value={farmerId}
          onChangeText={setFarmerId}
          style={styles.input}
        />
        
        <View style={styles.row}>
          <TextInput
            placeholder="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Last Name *"
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, styles.halfInput]}
          />
        </View>
        
        <TextInput
          placeholder="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          style={styles.input}
        />
        
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Gender:</Text>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
            <Picker.Item label="Other" value="O" />
          </Picker>
        </View>
        
        <TextInput
          placeholder="Phone Number *"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />
        
        <TextInput
          placeholder="Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      {/* Address Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        
        <TextInput
          placeholder="Full Address *"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
          style={[styles.input, styles.textArea]}
        />
        
        <View style={styles.row}>
          <TextInput
            placeholder="Village *"
            value={village}
            onChangeText={setVillage}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="District *"
            value={district}
            onChangeText={setDistrict}
            style={[styles.input, styles.halfInput]}
          />
        </View>
        
        <View style={styles.row}>
          <TextInput
            placeholder="State"
            value={state}
            onChangeText={setState}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>
      </View>

      {/* Farm Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Information</Text>
        
        <TextInput
          placeholder="Total Land Area (acres)"
          value={totalLandArea}
          onChangeText={setTotalLandArea}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <TextInput
          placeholder="Primary Crop"
          value={primaryCrop}
          onChangeText={setPrimaryCrop}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Farming Experience (years)"
          value={farmingExperience}
          onChangeText={setFarmingExperience}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* KYC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KYC Information</Text>
        
        <TextInput
          placeholder="Aadhar Number (12 digits) *"
          value={aadharNumber}
          onChangeText={setAadharNumber}
          keyboardType="numeric"
          maxLength={12}
          style={styles.input}
        />
        
        <TextInput
          placeholder="PAN Number (optional)"
          value={panNumber}
          onChangeText={setPanNumber}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Bank Account Number"
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <TextInput
          placeholder="Bank IFSC Code"
          value={bankIfsc}
          onChangeText={setBankIfsc}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Bank Name"
          value={bankName}
          onChangeText={setBankName}
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Create Farmer Profile</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.bottomPadding} />
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
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#27ae60',
    paddingBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    margin: 15,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
