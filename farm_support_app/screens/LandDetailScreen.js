import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LandDetailScreen({ route, navigation }) {
  const { land } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Land Details</Text>
        <Text style={styles.label}>Farm Name:</Text>
        <Text style={styles.value}>{land.farm_name}</Text>
        <Text style={styles.label}>Total Area:</Text>
        <Text style={styles.value}>{land.total_area} acres</Text>
        <Text style={styles.label}>Latitude:</Text>
        <Text style={styles.value}>{land.latitude}</Text>
        <Text style={styles.label}>Longitude:</Text>
        <Text style={styles.value}>{land.longitude}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Land List</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#2980b9' }]} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#27ae60', textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 10, color: '#2980b9' },
  value: { fontSize: 16, marginBottom: 8, color: '#555' },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
