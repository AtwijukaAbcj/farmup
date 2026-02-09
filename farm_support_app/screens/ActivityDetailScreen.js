import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Activity not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}><Ionicons name="leaf-outline" size={24} color="#27ae60" /> Activity Details</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Crop Type</Text>
          <Text style={styles.value}>{activity.crop_type || activity.title || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Activity Type</Text>
          <Text style={styles.value}>{activity.activity_type || 'Farming'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Planting Date</Text>
          <Text style={styles.value}>{formatDate(activity.planting_date || activity.date)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expected Harvest Date</Text>
          <Text style={styles.value}>{formatDate(activity.expected_harvest_date)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Yield</Text>
          <Text style={styles.value}>
            {activity.estimated_yield ? `${activity.estimated_yield} kg` : 'N/A'}
          </Text>
        </View>

        {activity.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notesValue}>{activity.notes}</Text>
          </View>
        )}

        {activity.land && (
          <View style={styles.section}>
            <Text style={styles.label}>Land ID</Text>
            <Text style={styles.value}>{activity.land}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Activities</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.dashboardButton]} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2980b9',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#2c3e50',
  },
  notesValue: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
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
  dashboardButton: {
    backgroundColor: '#2980b9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
