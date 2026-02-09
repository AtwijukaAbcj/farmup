import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/ApiService';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // features array will be defined inside the render logic

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await ApiService.getCurrentUser();
        setUser(currentUser);
        // Try to load stats, but don't block UI if it fails
        ApiService.getDashboardStats().then(statsResult => {
          ApiService.getMyDashboardStats().then(myStatsResult => {
            if (statsResult.success) {
              setStats({
                ...statsResult.data,
                ...(myStatsResult.success ? myStatsResult.data : {})
              });
            }
          });
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await ApiService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleFeaturePress = (screen) => {
    if (screen === 'Settings') {
      handleLogout();
    } else {
      navigation.navigate(screen);
    }
  };

  if (loading || !user) {
    return null; // or a placeholder if you want
  }

  // Define features array here to always use latest user role
  const features = user?.role === 'seller'
    ? [
        { title: 'Seller Profile', screen: 'SellerProfileSetup', icon: 'storefront-outline' },
        { title: 'Marketplace', screen: 'Marketplace', icon: 'cart-outline' },
        { title: 'Loan Application', screen: 'LoanApplication', icon: 'cash-outline' },
        { title: 'My Loans', screen: 'MyLoans', icon: 'document-text-outline' },
        { title: 'Logout', screen: 'Settings', icon: 'log-out-outline' },
      ]
    : [
        { title: 'Profile Setup', screen: 'ProfileSetup', icon: 'person-outline' },
        { title: 'Land Entry', screen: 'LandEntry', icon: 'leaf-outline' },
        { title: 'Activity Entry', screen: 'Activities', icon: 'create-outline' },
        { title: 'Animal Monitoring', screen: 'AnimalMonitoring', icon: 'paw-outline' },
        { title: 'Loan Application', screen: 'LoanApplication', icon: 'cash-outline' },
        { title: 'My Loans', screen: 'MyLoans', icon: 'document-text-outline' },
        { title: 'Marketplace', screen: 'Marketplace', icon: 'cart-outline' },
        { title: 'Logout', screen: 'Settings', icon: 'log-out-outline' },
      ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Professional User Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#27ae60', '#2ecc71']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileHeader}
        >
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={user?.selfie_url ? { uri: user.selfie_url } : require('../assets/default_selfie.png')}
                style={styles.selfie}
              />
              {user?.selfie_url && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                </View>
              )}
            </View>
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileGreeting}>Welcome back,</Text>
              <Text style={styles.profileName}>{user?.first_name || user?.username || 'User'}</Text>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.profileBody}>
          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <View style={[styles.statusBadge, { backgroundColor: user?.status ? '#e8f5e9' : '#fff3e0' }]}>
                <Ionicons 
                  name={user?.status ? 'shield-checkmark' : 'alert-circle'} 
                  size={16} 
                  color={user?.status ? '#27ae60' : '#f39c12'} 
                />
                <Text style={[styles.statusBadgeText, { color: user?.status ? '#27ae60' : '#f39c12' }]}>
                  {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : user?.role === 'seller' ? 'Seller' : 'Pending'}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileStatItem}>
              <View style={[styles.roleBadge, { backgroundColor: user?.role === 'seller' ? '#e3f2fd' : '#f3e5f5' }]}>
                <Ionicons 
                  name={user?.role === 'seller' ? 'storefront' : 'person'} 
                  size={16} 
                  color={user?.role === 'seller' ? '#2196f3' : '#9c27b0'} 
                />
                <Text style={[styles.roleBadgeText, { color: user?.role === 'seller' ? '#2196f3' : '#9c27b0' }]}>
                  {user?.role === 'seller' ? 'Seller' : 'Farmer'}
                </Text>
              </View>
            </View>
          </View>
          
          {user?.role !== 'seller' && (
            <View style={styles.landInfoRow}>
              <Ionicons name="map" size={18} color="#27ae60" />
              <Text style={styles.landInfoText}>
                Total Land: <Text style={styles.landInfoValue}>{user?.total_land_area || 0} acres</Text>
              </Text>
            </View>
          )}
          
          {user?.role === 'seller' && !user?.seller_profile && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SellerProfileSetup')}>
              <Ionicons name="storefront-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Complete Seller Profile</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {user?.role !== 'seller' && !user?.status && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('FarmerRegistration')}>
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Register as Farmer</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {user?.role !== 'seller' && user?.status && !user?.selfie_url && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3498db' }]} onPress={() => navigation.navigate('FarmerRegistration')}>
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Upload Profile Photo</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loan Summary Section */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Loan Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statNumber}>{stats.my_loans?.total || 0}</Text><Text style={styles.statLabel}>Total</Text></View>
            <View style={styles.statCard}><Text style={styles.statNumber}>{stats.my_loans?.pending || 0}</Text><Text style={styles.statLabel}>Pending</Text></View>
            <View style={styles.statCard}><Text style={styles.statNumber}>{stats.my_loans?.approved || 0}</Text><Text style={styles.statLabel}>Approved</Text></View>
            <View style={styles.statCard}><Text style={styles.statNumber}>{stats.my_loans?.disbursed || 0}</Text><Text style={styles.statLabel}>Disbursed</Text></View>
          </View>
        </View>
      )}

      {/* Quick Actions Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {features.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleFeaturePress(item.screen)}
            >
              <Ionicons name={item.icon} size={32} color="#27ae60" style={styles.cardIcon} />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activities/Notifications */}
      <View style={styles.activitiesSection}>
        <Text style={styles.activitiesTitle}>Recent Activities</Text>
        <Text style={styles.activitiesPlaceholder}>No recent activities yet.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  profileHeader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  selfie: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: '#e1e8ed',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileBody: {
    padding: 16,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  profileStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  landInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  landInfoText: {
    fontSize: 14,
    color: '#555',
  },
  landInfoValue: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  actionButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '47%',
    aspectRatio: 1.1,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  activitiesSection: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  activitiesPlaceholder: {
    color: '#7f8c8d',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
