import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function AnimalHealthRecordScreen({ route, navigation }) {
  const { animalId } = route.params;
  const [animal, setAnimal] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    record_type: 'checkup',
    record_date: '',
    veterinarian_name: '',
    diagnosis: '',
    treatment_given: '',
    medication: '',
    cost: '',
    next_visit_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [animalResult, recordsResult] = await Promise.all([
        ApiService.getAnimalById(animalId),
        ApiService.getAnimalHealthRecords(animalId),
      ]);

      if (animalResult.success) {
        setAnimal(animalResult.data);
      }
      if (recordsResult.success) {
        setHealthRecords(recordsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.record_date) {
      Alert.alert('Error', 'Record date is required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        animal: animalId,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      // Remove empty fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === '') {
          delete submitData[key];
        }
      });

      const result = await ApiService.addAnimalHealthRecord(animalId, submitData);

      if (result.success) {
        Alert.alert('Success', 'Health record added successfully');
        setModalVisible(false);
        setFormData({
          record_type: 'checkup',
          record_date: '',
          veterinarian_name: '',
          diagnosis: '',
          treatment_given: '',
          medication: '',
          cost: '',
          next_visit_date: '',
          notes: '',
        });
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to add health record');
      }
    } catch (error) {
      console.error('Error adding health record:', error);
      Alert.alert('Error', 'An error occurred');
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return <Ionicons name="medical" size={18} color="#27ae60" />;
      case 'checkup':
        return <Ionicons name="fitness" size={18} color="#2980b9" />;
      case 'treatment':
        return <Ionicons name="medkit" size={18} color="#e67e22" />;
      case 'surgery':
        return <Ionicons name="cut" size={18} color="#e74c3c" />;
      case 'injury':
        return <Ionicons name="bandage" size={18} color="#f39c12" />;
      case 'disease':
        return <Ionicons name="bug" size={18} color="#9b59b6" />;
      default:
        return <Ionicons name="document-text" size={18} color="#95a5a6" />;
    }
  };

  const renderHealthRecord = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordType}>
          {getRecordTypeIcon(item.record_type)} {item.record_type.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.recordDate}>{item.record_date}</Text>
      </View>

      {item.veterinarian_name && (
        <Text style={styles.recordInfo}>Veterinarian: {item.veterinarian_name}</Text>
      )}
      {item.diagnosis && (
        <Text style={styles.recordInfo}>Diagnosis: {item.diagnosis}</Text>
      )}
      {item.treatment_given && (
        <Text style={styles.recordInfo}>Treatment: {item.treatment_given}</Text>
      )}
      {item.medication && (
        <Text style={styles.recordInfo}>Medication: {item.medication}</Text>
      )}
      {item.cost && (
        <Text style={styles.recordInfo}>Cost: ₹{item.cost}</Text>
      )}
      {item.next_visit_date && (
        <Text style={styles.recordInfo}>Next Visit: {item.next_visit_date}</Text>
      )}
      {item.notes && (
        <Text style={styles.recordNotes}>{item.notes}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animal Info Header */}
      {animal && (
        <View style={styles.animalHeader}>
          <Text style={styles.animalTitle}>
            {animal.animal_type} - {animal.rfid_tag}
          </Text>
          {animal.name && <Text style={styles.animalName}>{animal.name}</Text>}
          <Text style={styles.animalHealth}>
            Health Status: {animal.health_status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      )}

      {/* Health Records List */}
      <FlatList
        data={healthRecords}
        renderItem={renderHealthRecord}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No health records yet</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Record</Text>
      </TouchableOpacity>

      {/* Add Record Modal */}
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
                <Text style={styles.modalTitle}>Add Health Record</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.record_type}
                  onValueChange={(value) => handleInputChange('record_type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Routine Checkup" value="checkup" />
                  <Picker.Item label="Vaccination" value="vaccination" />
                  <Picker.Item label="Treatment" value="treatment" />
                  <Picker.Item label="Surgery" value="surgery" />
                  <Picker.Item label="Injury" value="injury" />
                  <Picker.Item label="Disease" value="disease" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Record Date (YYYY-MM-DD) *"
                value={formData.record_date}
                onChangeText={(value) => handleInputChange('record_date', value)}
              />

              <TextInput
                style={styles.input}
                placeholder="Veterinarian Name"
                value={formData.veterinarian_name}
                onChangeText={(value) => handleInputChange('veterinarian_name', value)}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Diagnosis"
                value={formData.diagnosis}
                onChangeText={(value) => handleInputChange('diagnosis', value)}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Treatment Given"
                value={formData.treatment_given}
                onChangeText={(value) => handleInputChange('treatment_given', value)}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.input}
                placeholder="Medication"
                value={formData.medication}
                onChangeText={(value) => handleInputChange('medication', value)}
              />

              <TextInput
                style={styles.input}
                placeholder="Cost"
                value={formData.cost}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Next Visit Date (YYYY-MM-DD)"
                value={formData.next_visit_date}
                onChangeText={(value) => handleInputChange('next_visit_date', value)}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional Notes"
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Add Record</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  animalHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  animalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  animalName: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  animalHealth: {
    fontSize: 14,
    color: '#27ae60',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  recordType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recordDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  recordInfo: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  recordNotes: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
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
    fontSize: 20,
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
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
