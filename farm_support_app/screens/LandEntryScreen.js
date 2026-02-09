import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function LandEntryScreen({ navigation, route }) {
  useEffect(() => {
    const checkRole = async () => {
      const user = await ApiService.getCurrentUser();
      if (user?.role === 'seller') {
        navigation.replace('Dashboard');
      }
    };
    checkRole();
  }, []);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [lands, setLands] = useState([]); // Array of land entries

  // Check if location was passed from MapPicker
  useEffect(() => {
    if (route.params?.pickedLocation) {
      setLocation(route.params.pickedLocation);
    }
  }, [route.params]);

  // Fetch already saved lands for the current farmer
  useEffect(() => {
    const fetchSavedLands = async () => {
      setLoading(true);
      try {
        const currentUser = await ApiService.getCurrentUser();
        if (currentUser?.id) {
          const result = await ApiService.getLandEntries({ farmer: currentUser.id });
          if (result.success && Array.isArray(result.data?.results)) {
            setLands(result.data.results);
          }
        }
      } catch (error) {
        console.error('Fetch saved lands error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedLands();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Ionicons name="leaf-outline" size={24} color="#fff" /> Land Information</Text>
        <Text style={styles.subtitle}>Your registered farm lands</Text>
      </View>
      {/* List of registered lands only */}
      {lands.length > 0 ? (
        <ScrollView style={{ marginVertical: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 18, color: '#2980b9' }}>Registered Lands:</Text>
          {lands.map((land, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e1e8ed',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => navigation.navigate('LandDetail', { land })}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#27ae60' }}>Farm: {land.farm_name}</Text>
              <Text style={{ color: '#555', marginTop: 2 }}>Area: <Text style={{ fontWeight: 'bold' }}>{land.total_area} acres</Text></Text>
              <Text style={{ color: '#888', marginTop: 2 }}>Lat: {land.latitude.toFixed(6)}, Lng: {land.longitude.toFixed(6)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ marginVertical: 16, color: '#888', textAlign: 'center' }}>No lands registered yet.</Text>
      )}
      <TouchableOpacity style={[styles.submitButton, {
        backgroundColor: '#27ae60',
        marginBottom: 10,
        alignSelf: 'center',
        width: 200,
        borderRadius: 24,
        shadowColor: '#27ae60',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }]} onPress={() => navigation.navigate('AddLandScreen')}>
        <Text style={[styles.submitButtonText, { fontSize: 18, letterSpacing: 1 }]}>+ Add New Land</Text>
      </TouchableOpacity>
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
