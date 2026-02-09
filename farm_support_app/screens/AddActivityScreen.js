import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from '../services/ApiService';

export default function AddActivityScreen({ route, navigation }) {
  const { land } = route.params;
  const [cropType, setCropType] = useState('maize');
  const [cropModal, setCropModal] = useState(false);
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [yieldAmount, setYieldAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [whichDate, setWhichDate] = useState('');
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      const user = await ApiService.getCurrentUser();
      setFarmer(user);
    };
    fetchFarmer();
  }, []);

  const handleSubmit = async () => {
    if (!cropType || !yieldAmount || !plantingDate || !harvestDate) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }
    if (!farmer || !farmer.id) {
      Alert.alert('Error', 'Farmer information not found.');
      return;
    }
    try {
      const activityData = {
        crop_type: cropType,
        planting_date: plantingDate.toISOString().split('T')[0],
        expected_harvest_date: harvestDate.toISOString().split('T')[0],
        estimated_yield: parseFloat(yieldAmount),
        notes: description,
        land: land.id,
        farmer: farmer.id,
      };
      const result = await ApiService.createActivity(activityData);
      if (result.success) {
        Alert.alert('Success', 'Activity added successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add activity.');
      }
    } catch (error) {
      console.error('Add activity error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Add Activity</Text>
      <View style={[styles.input, { backgroundColor: '#e1e8ed', borderColor: '#e1e8ed' }]}> 
        <Text style={{ fontWeight: 'bold', color: '#27ae60' }}>{land.farm_name}</Text>
      </View>
      <Text style={styles.label}>Select Crop</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', backgroundColor: '#f4f4f4' }]}
        onPress={() => setCropModal(true)}
      >
        <Text style={{ color: cropType ? '#222' : '#888' }}>
          {cropType ? cropType.charAt(0).toUpperCase() + cropType.slice(1) : 'Select Crop'}
        </Text>
      </TouchableOpacity>
      <Modal visible={!!cropModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Crop</Text>
            <ScrollView style={{ maxHeight: 250 }}>
              {['maize','beans','rice','cassava','banana','groundnuts','sorghum','coffee','poultry','vegetables','fruits','sunflower','sugarcane','cotton','other'].map(crop => (
                <TouchableOpacity
                  key={crop}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setCropType(crop);
                    setCropModal(false);
                  }}
                >
                  <Text style={{ color: '#222', fontSize: 16 }}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setCropModal(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={styles.label}>Planting Date</Text>
      <View style={styles.datePickerInline}>
        <DateTimePicker
          value={plantingDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) setPlantingDate(selectedDate);
          }}
        />
      </View>
      <Text style={styles.label}>Expected Harvest Date</Text>
      <View style={styles.datePickerInline}>
        <DateTimePicker
          value={harvestDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) setHarvestDate(selectedDate);
          }}
        />
      </View>
      <Text style={styles.label}>Estimated Yield (kg)</Text>
      <TextInput
        placeholder="Enter estimated yield"
        style={styles.input}
        keyboardType="numeric"
        value={yieldAmount}
        onChangeText={setYieldAmount}
      />
      <Text style={styles.label}>Description / Notes</Text>
      <TextInput
        placeholder="Enter any additional information..."
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Activity</Text>
      </TouchableOpacity>
      {/* Date pickers are now inline */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#27ae60' },
  input: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, backgroundColor: '#fff', marginBottom: 15 },
  dateButton: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, backgroundColor: '#fff', marginBottom: 15, justifyContent: 'center' },
  dateButtonText: { fontSize: 16, color: '#2c3e50' },
  submitButton: { backgroundColor: '#2980b9', padding: 15, borderRadius: 24, alignItems: 'center', marginTop: 20, shadowColor: '#2980b9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  datePickerInline: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e1e8ed', padding: 4 },
});
