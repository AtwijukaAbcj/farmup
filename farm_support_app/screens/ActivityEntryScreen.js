import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function ActivityEntryScreen({ navigation, route }) {
  useEffect(() => {
    const checkRole = async () => {
      const user = await ApiService.getCurrentUser();
      if (user?.role === 'seller') {
        navigation.replace('Dashboard');
      }
    };
    checkRole();
  }, []);
  // If coming from ActivitiesScreen, show ActivitiesScreen first
  // Always show the activity entry form directly
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(route.params?.land || null);
  const [cropType, setCropType] = useState('maize');
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [whichDate, setWhichDate] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLands = async () => {
      const currentUser = await ApiService.getCurrentUser();
      if (currentUser?.id) {
        const result = await ApiService.getLandEntries({ farmer: currentUser.id });
        if (result.success && Array.isArray(result.data?.results)) {
          setLands(result.data.results);
          if (!selectedLand && result.data.results.length > 0) {
            setSelectedLand(result.data.results[0]);
          }
        }
      }
    };
    fetchLands();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      whichDate === 'planting' ? setPlantingDate(selectedDate) : setHarvestDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!cropType || !yieldAmount || !selectedLand) {
      Alert.alert('Missing Info', 'Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await ApiService.getCurrentUser();
      
      const activityData = {
        activity_type: 'farming',
        crop_type: cropType,
        planting_date: plantingDate.toISOString().split('T')[0],
        expected_harvest_date: harvestDate.toISOString().split('T')[0],
        estimated_yield: parseFloat(yieldAmount),
        notes,
        farmer: currentUser?.id,
        land: selectedLand.id,
      };

      const result = await ApiService.createActivity(activityData);

      if (result.success) {
        // If coming from LandActivities, show two buttons below the form
        if (route.params?.land) {
          setShowSuccessOptions(true);
        } else {
          Alert.alert(
            'Success',
            'Farming activity recorded successfully!',
            [
              { text: 'Add Another', onPress: () => navigation.replace('ActivityEntry', { fromActivities: true }) },
              { text: 'Back to Activities', onPress: () => navigation.navigate('Activities') }
            ]
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Activity creation error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Success options state for LandActivities
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);

  if (showSuccessOptions) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 20, color: '#27ae60', marginBottom: 24 }}>Activity added successfully!</Text>
        <TouchableOpacity
          style={[styles.submitButton, { width: 220 }]}
          onPress={() => {
            setShowSuccessOptions(false);
            navigation.replace('ActivityEntry', { land: route.params.land });
          }}
        >
          <Text style={styles.submitButtonText}>Add Another Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { width: 220, backgroundColor: '#2980b9', marginTop: 16 }]}
          onPress={() => navigation.navigate('LandActivities')}
        >
          <Text style={styles.submitButtonText}>Back to Land Activities</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="leaf-outline" size={24} color="#fff" /> Farm Activity</Text>
        <Text style={styles.subtitle}>Record your farming activities</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Select Land</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLand?.id}
            onValueChange={(value) => {
              const land = lands.find(l => l.id === value);
              setSelectedLand(land);
            }}
            style={styles.picker}
          >
            {lands.map((land) => (
              <Picker.Item key={land.id} label={land.farm_name} value={land.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Crop Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cropType}
            onValueChange={setCropType}
            style={styles.picker}
          >
            <Picker.Item label="Maize" value="maize" />
            <Picker.Item label="Beans" value="beans" />
            <Picker.Item label="Rice" value="rice" />
            <Picker.Item label="Cassava" value="cassava" />
            <Picker.Item label="Banana" value="banana" />
            <Picker.Item label="Groundnuts" value="groundnuts" />
            <Picker.Item label="Sorghum" value="sorghum" />
            <Picker.Item label="Coffee" value="coffee" />
            <Picker.Item label="Vegetables" value="vegetables" />
            <Picker.Item label="Fruits" value="fruits" />
            <Picker.Item label="Sunflower" value="sunflower" />
            <Picker.Item label="Sugarcane" value="sugarcane" />
            <Picker.Item label="Cotton" value="cotton" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <Text style={styles.label}>Planting Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setWhichDate('planting');
            setShowPicker(true);
          }}
        >
          <Text style={styles.dateButtonText}>{plantingDate.toDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Expected Harvest Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setWhichDate('harvest');
            setShowPicker(true);
          }}
        >
          <Text style={styles.dateButtonText}>{harvestDate.toDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={whichDate === 'planting' ? plantingDate : harvestDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Estimated Yield (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter expected yield amount"
          keyboardType="numeric"
          value={yieldAmount}
          onChangeText={setYieldAmount}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional notes about this activity..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Activity</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
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
