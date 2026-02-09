import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';

export default function MapPickerScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setManualLatitude(currentLocation.coords.latitude.toString());
      setManualLongitude(currentLocation.coords.longitude.toString());
    } catch (error) {
      console.log('Location error:', error);
      // Default location (India center)
      const defaultLocation = { latitude: 20.5937, longitude: 78.9629 };
      setLocation(defaultLocation);
      setManualLatitude(defaultLocation.latitude.toString());
      setManualLongitude(defaultLocation.longitude.toString());
    }
  };

  const handleSelectLocation = (event) => {
    if (Platform.OS !== 'web') {
      setPickedLocation(event.nativeEvent.coordinate);
      setManualLatitude(event.nativeEvent.coordinate.latitude.toString());
      setManualLongitude(event.nativeEvent.coordinate.longitude.toString());
    }
  };

  const handleManualLocationUpdate = () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }
    
    const coordinates = { latitude: lat, longitude: lng };
    setPickedLocation(coordinates);
  };

  const handleSaveLocation = () => {
    let locationToSave = pickedLocation;
    if (!locationToSave && manualLatitude && manualLongitude) {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        locationToSave = { latitude: lat, longitude: lng };
      }
    }
    if (!locationToSave) {
      Alert.alert('No location selected', 'Please select a location or enter coordinates manually.');
      return;
    }
    // Pass only serializable params
    navigation.navigate({
      name: 'AddLandScreen',
      params: { pickedLocation: locationToSave },
      merge: true,
    });
  };

  // Render native map for mobile platforms
  const renderNativeMap = () => {
    // For now, we'll use coordinate input on all platforms
    // This avoids web bundling issues with react-native-maps
    return renderWebLocationInput();
  };

  // Render web-compatible coordinate input
  const renderWebLocationInput = () => (
    <View style={styles.webContainer}>
      <Text style={styles.title}>📍 Select Farm Location</Text>
      <Text style={styles.subtitle}>Enter coordinates or use current location</Text>
      
      <View style={styles.coordinateContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude:</Text>
          <TextInput
            style={styles.input}
            value={manualLatitude}
            onChangeText={setManualLatitude}
            placeholder="e.g., 28.6139"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude:</Text>
          <TextInput
            style={styles.input}
            value={manualLongitude}
            onChangeText={setManualLongitude}
            placeholder="e.g., 77.2090"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <Button 
        title="Update Location" 
        onPress={handleManualLocationUpdate}
        color="#27ae60"
      />
      
      {pickedLocation && (
        <View style={styles.selectedLocation}>
          <Text style={styles.selectedText}>Selected Location:</Text>
          <Text>Lat: {pickedLocation.latitude.toFixed(6)}</Text>
          <Text>Lng: {pickedLocation.longitude.toFixed(6)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderWebLocationInput()}
      
      <View style={styles.bottomContainer}>
        <Button 
          title="Save Location" 
          onPress={handleSaveLocation}
          color="#27ae60"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  map: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 30,
  },
  coordinateContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  selectedLocation: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 5,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
});
