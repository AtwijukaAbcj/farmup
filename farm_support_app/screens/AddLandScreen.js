import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ApiService from '../services/ApiService';

export default function AddLandScreen({ navigation, route }) {
  const [farmName, setFarmName] = useState('');
  const [acres, setAcres] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Set picked location from navigation params
  useEffect(() => {
    if (route.params?.pickedLocation) {
      setLatitude(route.params.pickedLocation.latitude.toString());
      setLongitude(route.params.pickedLocation.longitude.toString());
    }
  }, [route.params?.pickedLocation]);

  const handleSubmit = async () => {
    if (!farmName || !acres || !latitude || !longitude) {
      Alert.alert('Error', 'All fields and location are required.');
      return;
    }
    try {
      const currentUser = await ApiService.getCurrentUser();
      const landData = {
        farm_name: farmName,
        total_area: parseFloat(acres),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        farmer: currentUser?.id,
      };
      const result = await ApiService.createLandEntry(landData);
      if (result.success) {
        Alert.alert('Success', 'Land entry saved successfully.', [
          { text: 'OK', onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'LandEntry' }]
            }) }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to save land entry.');
      }
    } catch (error) {
      console.error('Land entry error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handlePickLocation = () => {
    navigation.navigate('MapPicker', {
      onLocationPicked: (pickedLocation) => {
        if (pickedLocation) {
          setLatitude(pickedLocation.latitude.toString());
          setLongitude(pickedLocation.longitude.toString());
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Land</Text>
      <TextInput
        style={styles.input}
        placeholder="Farm Name"
        value={farmName}
        onChangeText={setFarmName}
      />
      <TextInput
        style={styles.input}
        placeholder="Total Acres (e.g. 5.5)"
        value={acres}
        keyboardType="numeric"
        onChangeText={setAcres}
      />
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Land Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        keyboardType="numeric"
        onChangeText={setLatitude}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        keyboardType="numeric"
        onChangeText={setLongitude}
      />
      <TouchableOpacity style={styles.locationButton} onPress={handlePickLocation}>
        <Text style={styles.locationButtonText}>📍 Pick Location on Map</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Land</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  locationButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  locationButtonText: { color: '#fff', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#2980b9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
