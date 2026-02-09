import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import ActivityEntryScreen from '../screens/ActivityEntryScreen';
import LoanApplicationScreen from '../screens/LoanApplicationScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import LandEntryScreen from '../screens/LandEntryScreen';
import MyLoansScreen from '../screens/MyLoansScreen';
import AnimalMonitoringScreen from '../screens/AnimalMonitoringScreen';
import AnimalEntryScreen from '../screens/AnimalEntryScreen';
import AnimalHealthRecordScreen from '../screens/AnimalHealthRecordScreen';
import ApiService from '../services/ApiService';
import FarmerRegistrationScreen from '../screens/FarmerRegistrationScreen';
import AddLandScreen from '../screens/AddLandScreen';
import LandDetailScreen from '../screens/LandDetailScreen';
import LandActivitiesScreen from '../screens/LandActivitiesScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import SellerRegistrationScreen from '../screens/SellerRegistrationScreen';
import SellerProfileSetupScreen from '../screens/SellerProfileSetupScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await ApiService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Dashboard" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#27ae60',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Activities" 
          component={ActivitiesScreen}
          options={{ title: 'All Activities' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }}
        />
        <Stack.Screen 
          name="Marketplace" 
          component={MarketplaceScreen}
          options={{ title: 'Marketplace' }}
        />
        <Stack.Screen 
          name="LandEntry" 
          component={LandEntryScreen}
          options={{ title: 'Land Information' }}
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{ title: 'Profile Setup' }}
        />
        <Stack.Screen 
          name="ActivityEntry" 
          component={ActivityEntryScreen}
          options={{ title: 'Farm Activity' }}
        />
        <Stack.Screen 
          name="LoanApplication" 
          component={LoanApplicationScreen}
          options={{ title: 'Loan Application' }}
        />
        <Stack.Screen 
          name="MapPicker" 
          component={MapPickerScreen}
          options={{ title: 'Select Location' }}
        />
        <Stack.Screen 
          name="MyLoans" 
          component={MyLoansScreen}
          options={{ title: 'My Loans' }}
        />
        <Stack.Screen 
          name="FarmerRegistration" 
          component={FarmerRegistrationScreen}
          options={{ title: 'Register as Farmer' }}
        />
        <Stack.Screen 
          name="AnimalMonitoring" 
          component={AnimalMonitoringScreen}
          options={{ title: 'Animal Monitoring' }}
        />
        <Stack.Screen 
          name="AnimalEntry" 
          component={AnimalEntryScreen}
          options={{ title: 'Register Animal' }}
        />
        <Stack.Screen 
          name="AnimalHealthRecord" 
          component={AnimalHealthRecordScreen}
          options={{ title: 'Health Records' }}
        />
        <Stack.Screen 
          name="AddLandScreen" 
          component={AddLandScreen}
          options={{ title: 'Add New Land' }}
        />
        <Stack.Screen 
          name="LandDetail" 
          component={LandDetailScreen}
          options={{ title: 'Land Details' }}
        />
        <Stack.Screen 
          name="LandActivities" 
          component={LandActivitiesScreen}
          options={{ title: 'Land Activities' }}
        />
        <Stack.Screen 
          name="AddActivity" 
          component={AddActivityScreen}
          options={{ title: 'Add Activity' }}
        />
        <Stack.Screen 
          name="ActivityDetail" 
          component={ActivityDetailScreen}
          options={{ title: 'Activity Details' }}
        />
        <Stack.Screen
          name="SellerRegistration"
          component={SellerRegistrationScreen}
          options={{ title: 'Register as Seller' }}
        />
        <Stack.Screen
          name="SellerProfileSetup"
          component={SellerProfileSetupScreen}
          options={{ title: 'Seller Profile Setup' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
