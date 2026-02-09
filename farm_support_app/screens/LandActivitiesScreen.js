import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ApiService from '../services/ApiService';

export default function LandActivitiesScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [lands, setLands] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);

  useEffect(() => {
    const fetchLands = async () => {
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
        console.error('Fetch lands error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  useEffect(() => {
    if (selectedLand) {
      fetchActivities(selectedLand.id);
    }
  }, [selectedLand]);

  const fetchActivities = async (landId) => {
    setLoading(true);
    try {
      const result = await ApiService.getActivities({ land: landId });
      if (result.success && Array.isArray(result.data?.results)) {
        setActivities(result.data.results);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Land Activities</Text>
      <Text style={styles.subtitle}>Pick a land to view activities</Text>
      <ScrollView horizontal style={{ marginVertical: 10 }}>
        {lands.map((land) => (
          <TouchableOpacity
            key={land.id}
            style={[{
              height: 100,
              minWidth: 100,
              maxWidth: 140,
              marginRight: 16,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: selectedLand?.id === land.id ? '#27ae60' : '#e1e8ed',
              backgroundColor: selectedLand?.id === land.id ? '#27ae60' : '#fff',
              shadowColor: selectedLand?.id === land.id ? '#27ae60' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedLand?.id === land.id ? 0.15 : 0.08,
              shadowRadius: 6,
              elevation: selectedLand?.id === land.id ? 4 : 2,
            }]} 
            onPress={() => setSelectedLand(land)}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: selectedLand?.id === land.id ? '#fff' : '#27ae60' }}>{land.farm_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedLand && (
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Activities for {selectedLand.farm_name}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate('ActivityDetail', { activity })}
                >
                  <Text style={styles.activityTitle}>Crop: {activity.crop_type || activity.title}</Text>
                  <Text style={styles.activityDetail}>Planting Date: {activity.planting_date || activity.date}</Text>
                  <Text style={styles.activityDetail}>Expected Harvest: {activity.expected_harvest_date || '-'}</Text>
                  <Text style={styles.activityDetail}>Yield: {activity.estimated_yield ? `${activity.estimated_yield} kg` : '-'}</Text>
                  <Text style={styles.activityDetail}>Notes: {activity.notes || activity.description || '-'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No activities found for this land.</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddActivity', { land: selectedLand })}>
            <Text style={styles.addButtonText}>+ Add Activity</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#27ae60' },
  subtitle: { fontSize: 16, color: '#2980b9', marginBottom: 10 },
  activitiesSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2980b9' },
  activityCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  activityTitle: { fontWeight: 'bold', fontSize: 16, color: '#27ae60' },
  activityDetail: { color: '#555', marginTop: 2 },
  activityDate: { color: '#888', marginTop: 2, fontSize: 12 },
  addButton: {
    backgroundColor: '#2980b9',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
