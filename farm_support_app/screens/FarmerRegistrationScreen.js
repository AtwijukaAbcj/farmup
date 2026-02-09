import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DatePickerField from '../components/DatePickerField';
import { Picker } from '@react-native-picker/picker';

import ApiService from '../services/ApiService';

export default function FarmerRegistrationScreen({ navigation }) {
  useEffect(() => {
    const checkRole = async () => {
      const user = await ApiService.getCurrentUser();
      if (user?.role === 'seller') {
        navigation.replace('Dashboard');
      }
    };
    checkRole();
  }, []);
  // Helper for validation
  const validateForm = () => {
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'nin_number',
      'village', 'district', 'username', 'password'
    ];
    for (let field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        Alert.alert('Missing Field', `Please fill in the ${field.replace('_', ' ')} field.`);
        return false;
      }
    }
    // Date format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date_of_birth)) {
      Alert.alert('Invalid Date', 'Date of birth must be in YYYY-MM-DD format.');
      return false;
    }
    // Gender check
    if (!['M', 'F', 'O'].includes(form.gender)) {
      Alert.alert('Invalid Gender', 'Gender must be M, F, or O.');
      return false;
    }
    return true;
  };
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    nin_number: '',
    email: '',
    village: '',
    district: '',
    username: '',
    password: '',
    // Removed fields: pincode, total_land_area, primary_crop, farming_experience, aadhar_number, bank_account_number, bank_ifsc, bank_name
  });
  const [selfie, setSelfie] = useState(null);
  // Removed camera state, not needed
  const [loading, setLoading] = useState(false);
  // Remove showDatePicker and date state, handled by DatePickerField
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Very Weak' });

  const passwordCriteria = [
    { regex: /.{8,}/, label: '8+ characters' },
    { regex: /[a-z]/, label: 'Lowercase letter' },
    { regex: /[A-Z]/, label: 'Uppercase letter' },
    { regex: /[0-9]/, label: 'Number' },
    { regex: /[!@#$%^&*]/, label: 'Special symbol' },
  ];

  const getPasswordStrength = (password) => {
    const score = passwordCriteria.reduce((acc, curr) => acc + curr.regex.test(password), 0);
    const label = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][score];
    return { score, label };
  };

  const handlePasswordChange = (value) => {
    handleChange('password', value);
    setPasswordStrength(getPasswordStrength(value));
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const pickSelfie = async () => {
    try {
      // Use ImagePicker for all platforms
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take a selfie.');
        return;
      }
      const mediaType = ImagePicker.MediaType ? ImagePicker.MediaType.IMAGE : (ImagePicker.MediaTypeOptions ? ImagePicker.MediaTypeOptions.Images : undefined);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('ImagePicker result:', result);
      if (result.canceled) {
        Alert.alert('Cancelled', 'Selfie capture was cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        setSelfie(result.assets[0]);
        Alert.alert('Success', 'Selfie captured successfully!');
      } else {
        Alert.alert('Error', 'No image was captured.');
      }
    } catch (error) {
      console.error('Selfie error:', error);
      Alert.alert('Error', error.message || 'Failed to capture selfie.');
    }
  };

  // Removed takePicture, not needed

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Prepare data with correct types
      const submitData = {
        ...form,
        total_land_area: Number(form.total_land_area),
        farming_experience: Number(form.farming_experience),
      };
      const response = await ApiService.createFarmer(submitData);
      if (!response.success) {
        Alert.alert('Registration Error', JSON.stringify(response.error));
        setLoading(false);
        return;
      }
      // Upload selfie if present
      if (selfie) {
        const formData = new FormData();
        formData.append('document_type', 'selfie');
        formData.append('document_name', 'Selfie');
        formData.append('document_file', {
          uri: selfie.uri,
          name: 'selfie.jpg',
          type: 'image/jpeg',
        });
        await ApiService.uploadFarmerDocument(response.data.farmer_id, formData);
      }
      Alert.alert('Success', 'Registration submitted! Awaiting approval.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Remove handleDateChange, handled by DatePickerField

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register as Farmer</Text>
      <TextInput style={styles.input} placeholder="First Name" value={form.first_name} onChangeText={v => handleChange('first_name', v)} />
      <TextInput style={styles.input} placeholder="Middle Name" value={form.middle_name} onChangeText={v => handleChange('middle_name', v)} />
      <TextInput style={styles.input} placeholder="Last Name" value={form.last_name} onChangeText={v => handleChange('last_name', v)} />
      <DatePickerField
        label="Date of Birth"
        value={form.date_of_birth ? new Date(form.date_of_birth) : null}
        onChange={date => handleChange('date_of_birth', date.toISOString().slice(0, 10))}
      />
      <View style={{ borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff' }}>
        <Picker
          selectedValue={form.gender}
          onValueChange={v => handleChange('gender', v)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="M" />
          <Picker.Item label="Female" value="F" />
          <Picker.Item label="Other" value="O" />
        </Picker>
      </View>
      <TextInput style={styles.input} placeholder="Phone Number" value={form.phone_number} onChangeText={v => handleChange('phone_number', v)} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="NIN Number" value={form.nin_number} onChangeText={v => handleChange('nin_number', v)} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Village" value={form.village} onChangeText={v => handleChange('village', v)} />
      <TextInput style={styles.input} placeholder="District" value={form.district} onChangeText={v => handleChange('district', v)} />
      <TextInput style={styles.input} placeholder="Username" value={form.username} onChangeText={v => handleChange('username', v)} />
      {/* Removed fields: pincode, total_land_area, primary_crop, farming_experience, aadhar_number, bank_account_number, bank_ifsc, bank_name */}
      <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={handlePasswordChange} secureTextEntry />
      <View style={{ marginBottom: 10 }}>
        <Text>Password strength: <Text style={{ fontWeight: 'bold' }}>{passwordStrength.label}</Text></Text>
        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, marginVertical: 4 }}>
          <View style={{ width: `${(passwordStrength.score / passwordCriteria.length) * 100}%`, height: 8, backgroundColor: passwordStrength.score >= 4 ? '#27ae60' : passwordStrength.score >= 2 ? '#f1c40f' : '#e74c3c', borderRadius: 4 }} />
        </View>
        <View>
          {passwordCriteria.map(c => (
            <Text key={c.label} style={{ color: c.regex.test(form.password) ? 'green' : 'red', fontSize: 12 }}>
              {c.label}
            </Text>
          ))}
        </View>
      </View>
      <TextInput style={styles.input} placeholder="Re-enter Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Text style={{ color: confirmPassword ? (confirmPassword === form.password ? 'green' : 'red') : '#888', marginBottom: 10 }}>
        {confirmPassword ? (confirmPassword === form.password ? 'Passwords match' : 'Passwords do not match') : 'Please re-enter password'}
      </Text>
      <TouchableOpacity style={styles.selfieButton} onPress={pickSelfie}>
        <Text style={styles.selfieButtonText}>{selfie ? 'Retake Selfie' : 'Take Selfie'}</Text>
      </TouchableOpacity>
      {selfie && <Image source={{ uri: selfie.uri }} style={styles.selfiePreview} />}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  selfieButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  selfieButtonText: { color: '#fff', fontWeight: 'bold' },
  selfiePreview: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 10 },
  submitButton: { backgroundColor: '#2980b9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cameraModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  cameraPreview: {
    width: 300,
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: 200,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  closeCameraButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
  },
  closeCameraButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
