import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/ApiService';

export default function AnimalEntryScreen({ navigation }) {
  const [formData, setFormData] = useState({
    rfid_tag: '',
    animal_type: 'cattle',
    breed: '',
    name: '',
    gender: 'M',
    date_of_birth: '',
    age_months: '',
    color: '',
    weight_kg: '',
    health_status: 'healthy',
    purchase_date: '',
    purchase_price: '',
    current_location: '',
    pen_number: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.rfid_tag.trim()) {
      Alert.alert('Error', 'RFID Tag is required');
      return false;
    }
    if (!formData.animal_type) {
      Alert.alert('Error', 'Animal Type is required');
      return false;
    }
    if (!formData.gender) {
      Alert.alert('Error', 'Gender is required');
      return false;
    }
    if (!formData.age_months || isNaN(formData.age_months)) {
      Alert.alert('Error', 'Valid age in months is required');
      return false;
    }
    if (!formData.weight_kg || isNaN(formData.weight_kg)) {
      Alert.alert('Error', 'Valid weight in kg is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        age_months: parseInt(formData.age_months),
        weight_kg: parseFloat(formData.weight_kg),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      };

      // Remove empty optional fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key];
        }
      });

      const result = await ApiService.createAnimal(submitData);

      if (result.success) {
        Alert.alert('Success', 'Animal registered successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to register animal');
      }
    } catch (error) {
      console.error('Error registering animal:', error);
      Alert.alert('Error', 'An error occurred while registering the animal');
    } finally {
      setLoading(false);
    }
  };

  const handleScanRFID = () => {
    // Placeholder for RFID scanning functionality
    // In a real app, this would integrate with an RFID scanner
    Alert.alert(
      'RFID Scanner',
      'RFID scanning would be implemented here with hardware integration',
      [
        {
          text: 'Manual Entry',
          style: 'cancel',
        },
        {
          text: 'Demo Scan',
          onPress: () => {
            const demoRFID = `RFID-${Date.now().toString().slice(-8)}`;
            handleInputChange('rfid_tag', demoRFID);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Register New Animal</Text>

      {/* RFID Tag */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RFID Identification *</Text>
        <View style={styles.rfidContainer}>
          <TextInput
            style={[styles.input, styles.rfidInput]}
            placeholder="RFID Tag Number"
            value={formData.rfid_tag}
            onChangeText={(value) => handleInputChange('rfid_tag', value)}
          />
          <TouchableOpacity style={styles.scanButton} onPress={handleScanRFID}>
            <Text style={styles.scanButtonText}>📡 Scan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animal Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animal Information *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.animal_type}
            onValueChange={(value) => handleInputChange('animal_type', value)}
            style={styles.picker}
          >
            <Picker.Item label="Cattle" value="cattle" />
            <Picker.Item label="Buffalo" value="buffalo" />
            <Picker.Item label="Goat" value="goat" />
            <Picker.Item label="Sheep" value="sheep" />
            <Picker.Item label="Pig" value="pig" />
            <Picker.Item label="Poultry" value="poultry" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Breed (optional)"
          value={formData.breed}
          onChangeText={(value) => handleInputChange('breed', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Name (optional)"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      </View>

      {/* Physical Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Details *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => handleInputChange('gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Age in Months *"
          value={formData.age_months}
          onChangeText={(value) => handleInputChange('age_months', value)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Weight in Kg *"
          value={formData.weight_kg}
          onChangeText={(value) => handleInputChange('weight_kg', value)}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Color (optional)"
          value={formData.color}
          onChangeText={(value) => handleInputChange('color', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD, optional)"
          value={formData.date_of_birth}
          onChangeText={(value) => handleInputChange('date_of_birth', value)}
        />
      </View>

      {/* Health Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.health_status}
            onValueChange={(value) => handleInputChange('health_status', value)}
            style={styles.picker}
          >
            <Picker.Item label="Healthy" value="healthy" />
            <Picker.Item label="Sick" value="sick" />
            <Picker.Item label="Under Treatment" value="under_treatment" />
            <Picker.Item label="Quarantined" value="quarantined" />
          </Picker>
        </View>
      </View>

      {/* Purchase Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purchase Information (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Purchase Date (YYYY-MM-DD)"
          value={formData.purchase_date}
          onChangeText={(value) => handleInputChange('purchase_date', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Purchase Price"
          value={formData.purchase_price}
          onChangeText={(value) => handleInputChange('purchase_price', value)}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Location"
          value={formData.current_location}
          onChangeText={(value) => handleInputChange('current_location', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Pen/Cage Number"
          value={formData.pen_number}
          onChangeText={(value) => handleInputChange('pen_number', value)}
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional notes..."
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Registering...' : 'Register Animal'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  rfidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rfidInput: {
    flex: 1,
    marginRight: 10,
  },
  scanButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});
