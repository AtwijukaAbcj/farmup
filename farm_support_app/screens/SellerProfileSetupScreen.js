import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function SellerProfileSetupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selfie, setSelfie] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await ApiService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setPhoneNumber(user.phone_number || '');
    }
  };

  const pickSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera permission is required to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.cancelled) {
      setSelfie(result.assets ? result.assets[0] : result.uri ? { uri: result.uri } : null);
    }
  };

  const handleSave = async () => {
    if (!businessName || !businessAddress || !phoneNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('business_name', businessName);
      formData.append('business_address', businessAddress);
      formData.append('phone_number', phoneNumber);
      if (selfie && selfie.uri) {
        formData.append('selfie', { uri: selfie.uri, name: 'selfie.jpg', type: 'image/jpeg' });
      }
      const result = await ApiService.createOrUpdateSellerProfile(formData, true);
      if (result.success) {
        Alert.alert('Success!', 'Seller profile created successfully!', [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]);
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
        <Text style={styles.title}><Ionicons name="storefront-outline" size={24} color="#fff" /> Seller Profile Setup</Text>
        <Text style={styles.subtitle}>Set up your business profile</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <TextInput
          placeholder="Business Name *"
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
        />
        <TextInput
          placeholder="Business Address *"
          value={businessAddress}
          onChangeText={setBusinessAddress}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number *"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TouchableOpacity style={styles.selfieButton} onPress={pickSelfie}>
          <Text style={styles.selfieButtonText}>{selfie ? 'Retake Selfie' : 'Take Selfie'}</Text>
        </TouchableOpacity>
        {selfie && (
          <Image source={{ uri: selfie.uri }} style={styles.selfiePreview} />
        )}
      </View>
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Create Seller Profile</Text>
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
  selfieButton: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  selfieButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selfiePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 12,
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
