import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function AnimalMonitoringScreen({ navigation }) {
  useEffect(() => {
    const checkRole = async () => {
      const user = await ApiService.getCurrentUser();
      if (user?.role === 'seller') {
        navigation.replace('Dashboard');
      }
    };
    checkRole();
  }, []);
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAnimals();
  }, []);

  useEffect(() => {
    filterAnimals();
  }, [searchQuery, filterType, animals]);

  const loadAnimals = async () => {
    try {
      const [animalsResult, statsResult] = await Promise.all([
        ApiService.getAnimals(),
        ApiService.getAnimalStats(),
      ]);

      if (animalsResult.success) {
        setAnimals(animalsResult.data);
      }
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading animals:', error);
      Alert.alert('Error', 'Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals();
    setRefreshing(false);
  };

  const filterAnimals = () => {
    let filtered = animals;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((animal) => animal.animal_type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (animal) =>
          animal.rfid_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (animal.name && animal.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (animal.breed && animal.breed.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredAnimals(filtered);
  };

  const handleAnimalPress = (animal) => {
    setSelectedAnimal(animal);
    setModalVisible(true);
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return '#27ae60';
      case 'sick':
        return '#e74c3c';
      case 'under_treatment':
        return '#f39c12';
      case 'quarantined':
        return '#e67e22';
      case 'deceased':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  const renderAnimalCard = ({ item }) => (
    <TouchableOpacity
      style={styles.animalCard}
      onPress={() => handleAnimalPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.animalType}>
            {item.animal_type.charAt(0).toUpperCase() + item.animal_type.slice(1)}
          </Text>
          <Text style={styles.rfidTag}>🏷️ {item.rfid_tag}</Text>
        </View>
        <View
          style={[
            styles.healthBadge,
            { backgroundColor: getHealthStatusColor(item.health_status) },
          ]}
        >
          <Text style={styles.healthBadgeText}>
            {item.health_status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {item.name && <Text style={styles.animalName}>Name: {item.name}</Text>}
        {item.breed && <Text style={styles.animalInfo}>Breed: {item.breed}</Text>}
        <Text style={styles.animalInfo}>
          Gender: {item.gender === 'M' ? 'Male' : 'Female'}
        </Text>
        <Text style={styles.animalInfo}>Age: {item.age_months} months</Text>
        <Text style={styles.animalInfo}>Weight: {item.weight_kg} kg</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAnimalDetails = () => {
    if (!selectedAnimal) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Animal Details</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Identification</Text>
                <Text style={styles.detailText}>RFID Tag: {selectedAnimal.rfid_tag}</Text>
                <Text style={styles.detailText}>
                  Type: {selectedAnimal.animal_type}
                </Text>
                {selectedAnimal.breed && (
                  <Text style={styles.detailText}>Breed: {selectedAnimal.breed}</Text>
                )}
                {selectedAnimal.name && (
                  <Text style={styles.detailText}>Name: {selectedAnimal.name}</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Physical Details</Text>
                <Text style={styles.detailText}>
                  Gender: {selectedAnimal.gender === 'M' ? 'Male' : 'Female'}
                </Text>
                <Text style={styles.detailText}>Age: {selectedAnimal.age_months} months</Text>
                <Text style={styles.detailText}>Weight: {selectedAnimal.weight_kg} kg</Text>
                {selectedAnimal.color && (
                  <Text style={styles.detailText}>Color: {selectedAnimal.color}</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Health Status</Text>
                <Text
                  style={[
                    styles.detailText,
                    { color: getHealthStatusColor(selectedAnimal.health_status) },
                  ]}
                >
                  Status: {selectedAnimal.health_status.replace('_', ' ').toUpperCase()}
                </Text>
                {selectedAnimal.last_vaccination_date && (
                  <Text style={styles.detailText}>
                    Last Vaccination: {selectedAnimal.last_vaccination_date}
                  </Text>
                )}
                {selectedAnimal.last_checkup_date && (
                  <Text style={styles.detailText}>
                    Last Checkup: {selectedAnimal.last_checkup_date}
                  </Text>
                )}
                {selectedAnimal.medical_notes && (
                  <Text style={styles.detailText}>
                    Medical Notes: {selectedAnimal.medical_notes}
                  </Text>
                )}
              </View>

              {(selectedAnimal.current_location || selectedAnimal.pen_number) && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  {selectedAnimal.current_location && (
                    <Text style={styles.detailText}>
                      Location: {selectedAnimal.current_location}
                    </Text>
                  )}
                  {selectedAnimal.pen_number && (
                    <Text style={styles.detailText}>
                      Pen Number: {selectedAnimal.pen_number}
                    </Text>
                  )}
                </View>
              )}

              {selectedAnimal.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.detailText}>{selectedAnimal.notes}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('AnimalHealthRecord', {
                      animalId: selectedAnimal.id,
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}><Ionicons name="document-text-outline" size={18} color="#fff" /> Health Records</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_animals}</Text>
            <Text style={styles.statLabel}>Total Animals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#27ae60' }]}>
              {stats.healthy_count}
            </Text>
            <Text style={styles.statLabel}>Healthy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#e74c3c' }]}>
              {stats.sick_count}
            </Text>
            <Text style={styles.statLabel}>Needs Care</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by RFID, name, or breed..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'cattle', 'buffalo', 'goat', 'sheep', 'pig', 'poultry'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type && styles.filterButtonTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Animals List */}
      <FlatList
        data={filteredAnimals}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No animals found</Text>
            <Text style={styles.emptySubtext}>Add your first animal with RFID tag</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AnimalEntry')}
      >
        <Text style={styles.addButtonText}>+ Add Animal</Text>
      </TouchableOpacity>

      {/* Animal Details Modal */}
      {renderAnimalDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#27ae60',
  },
  filterButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  animalType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  rfidTag: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  animalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  animalInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  modalActions: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
