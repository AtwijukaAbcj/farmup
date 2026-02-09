import React, { useState } from 'react';
import { View, Text, Button, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePickerField({ label, value, onChange }) {
  const [show, setShow] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 4 }}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: 12,
          backgroundColor: '#fff',
        }}
      >
        <Text>{value ? value.toLocaleDateString() : 'Select date'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}
