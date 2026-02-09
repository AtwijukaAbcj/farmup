import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import ApiService from '../services/ApiService';

export default function ActivitiesScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const result = await ApiService.getActivities();
      if (result.success && Array.isArray(result.data?.results)) {
        setActivities(result.data.results);
      }
      setLoading(false);
    };
    fetchActivities();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.crop_type} ({item.activity_type})</Text>
      <Text style={styles.detail}>Land: {item.land}</Text>
      <Text style={styles.detail}>Farmer: {item.farmer}</Text>
      <Text style={styles.detail}>Planting: {item.planting_date}</Text>
      <Text style={styles.detail}>Harvest: {item.expected_harvest_date}</Text>
      <Text style={styles.detail}>Yield: {item.estimated_yield} kg</Text>
      {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Activities</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No activities found.</Text>}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LandActivities')}>
        <Text style={styles.buttonText}>Go to Land Activities</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#27ae60', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2980b9' },
  detail: { fontSize: 15, color: '#2c3e50', marginTop: 2 },
  notes: { fontSize: 14, color: '#888', marginTop: 6 },
  button: { backgroundColor: '#27ae60', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
