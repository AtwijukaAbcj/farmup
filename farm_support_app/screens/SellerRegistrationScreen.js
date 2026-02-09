import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import ApiService from '../services/ApiService';

export default function SellerRegistrationScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const checkPasswordStrength = (pwd) => {
    if (pwd.length < 6) return 'Weak';
    if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(pwd)) return 'Strong';
    if (/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(pwd)) return 'Medium';
    return 'Weak';
  };

  const handlePasswordChange = (pwd) => {
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleRegister = async () => {
    const usernamePattern = /^[\w.@+-]+$/;
    if (!username.trim() || !password.trim() || !email.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!usernamePattern.test(username.trim())) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and @/./+/-/_ characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (checkPasswordStrength(password) === 'Weak') {
      Alert.alert('Error', 'Password is too weak. Use at least 6 characters, with uppercase, number, and symbol for best security.');
      return;
    }
    setLoading(true);
    try {
      const userData = {
        username: username.trim(),
        password,
        password_confirm: confirmPassword,
        email: email.trim(),
        role: 'seller',
      };
      const result = await ApiService.register(userData);
      if (result.success) {
        Alert.alert('Success', 'Seller account created! Please log in.');
        navigation.replace('Login');
      } else {
        let errorMsg = result.error;
        if (typeof errorMsg === 'object') {
          errorMsg = Object.values(errorMsg).flat().join('\n');
        }
        Alert.alert('Registration Failed', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Register as Seller</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          style={styles.input}
        />
        <Text style={{ alignSelf: 'flex-start', marginBottom: 8, color: passwordStrength === 'Strong' ? '#27ae60' : passwordStrength === 'Medium' ? '#f39c12' : '#e74c3c' }}>
          Password Strength: {passwordStrength}
        </Text>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Register</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginTop: 16 }}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#e0f7fa', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '92%', maxWidth: 400, shadowColor: '#27ae60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#27ae60', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: '#f8f9fa' },
  registerButton: { backgroundColor: '#27ae60', padding: 14, borderRadius: 8, alignItems: 'center', width: '100%' },
  registerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  loginLink: { color: '#2980b9', fontWeight: 'bold', fontSize: 16 },
});
