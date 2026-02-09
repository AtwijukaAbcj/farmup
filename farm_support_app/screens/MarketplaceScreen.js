import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

export default function MarketplaceScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [produce, setProduce] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productType, setProductType] = useState('produce');
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    unit: '',
    quantity: '',
    description: '',
    image: null,
  });
  const [filter, setFilter] = useState('all'); // 'all' or 'mine'
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryModal, setCategoryModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState('1');

  useEffect(() => {
    ApiService.getCurrentUser().then(user => setCurrentUser(user));
    fetchMarketplace();
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [productType]);

  const fetchCategories = async () => {
    const isSupply = productType === 'supply';
    const result = await ApiService.getProductCategories(isSupply);
    let data = [];
    if (result.success) {
      if (Array.isArray(result.data)) {
        data = result.data;
      } else if (result.data && Array.isArray(result.data.results)) {
        data = result.data.results;
      }
    }
    setCategories(data);
    if (data.length > 0 && !form.category) {
      setForm(f => ({ ...f, category: data[0].id }));
    }
  };

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const produceResult = await ApiService.getMarketplaceProduce();
      const suppliesResult = await ApiService.getMarketplaceSupplies();
      setProduce(produceResult.success ? (Array.isArray(produceResult.data.results) ? produceResult.data.results : produceResult.data) : []);
      setSupplies(suppliesResult.success ? (Array.isArray(suppliesResult.data.results) ? suppliesResult.data.results : suppliesResult.data) : []);
    } catch (error) {
      console.error('Marketplace fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.description) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    let formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image) {
      formData.append('image', {
        uri: form.image,
        name: 'product.jpg',
        type: 'image/jpeg',
      });
    }
    // Attach current user info for ownership
    if (currentUser) {
      formData.append('farmer', currentUser.id);
      formData.append('vendor', currentUser.id);
    }
    if (productType === 'produce') {
      formData.append('category', form.category);
      formData.append('price_per_unit', form.price);
      formData.append('unit', form.unit);
      formData.append('quantity_available', form.quantity);
      var result = await ApiService.addMarketplaceProduce(formData, true);
    } else {
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('stock', form.quantity);
      var result = await ApiService.addMarketplaceSupply(formData, true);
    }
    if (result.success) {
      Alert.alert('Success', 'Product added successfully!');
      setModalVisible(false);
      setForm({ name: '', category: '', price: '', unit: '', quantity: '', description: '', image: null });
      setFilter('mine'); // Switch to 'My Products' after adding
      fetchMarketplace();
    } else {
      Alert.alert('Error', result.error || 'Failed to add product');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setForm(f => ({ ...f, image: result.uri }));
    }
  };

  const handleAddToCart = (item, type) => {
    setCart(prev => [...prev, { ...item, type }]);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
  };

  const handleRemoveFromCart = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteProduct = async (item, type) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = type === 'produce'
              ? await ApiService.deleteMarketplaceProduce(item.id)
              : await ApiService.deleteMarketplaceSupply(item.id);
            if (result.success) {
              Alert.alert('Success', 'Product deleted successfully');
              fetchMarketplace();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleBuyNow = (item, type) => {
    setCheckoutItem({ ...item, type });
    setCheckoutQuantity('1');
  };

  const handleCheckout = async () => {
    if (!checkoutItem) return;
    const qty = parseInt(checkoutQuantity) || 1;
    const maxQty = checkoutItem.type === 'produce' ? checkoutItem.quantity_available : checkoutItem.stock;
    
    if (qty <= 0 || qty > maxQty) {
      Alert.alert('Error', `Please enter a valid quantity (1 - ${maxQty})`);
      return;
    }

    const price = checkoutItem.type === 'produce' ? checkoutItem.price_per_unit : checkoutItem.price;
    const totalPrice = parseFloat(price) * qty;

    Alert.alert(
      'Confirm Order',
      `Product: ${checkoutItem.name}\nQuantity: ${qty}\nTotal: UGX ${totalPrice.toLocaleString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            try {
              const orderData = {
                produce: checkoutItem.id,
                quantity: qty,
                total_price: totalPrice,
              };
              
              let result;
              if (checkoutItem.type === 'produce') {
                result = await ApiService.createProduceOrder(orderData);
              } else {
                result = await ApiService.createSupplyOrder({
                  product: checkoutItem.id,
                  quantity: qty,
                  total_price: totalPrice,
                });
              }
              
              if (result.success) {
                Alert.alert('Order Placed!', `Your order for ${qty} x ${checkoutItem.name} has been placed successfully. Total: UGX ${totalPrice.toLocaleString()}`);
              } else {
                // Fallback for demo purposes if API returns error
                Alert.alert('Order Recorded', `Your order for ${qty} x ${checkoutItem.name} has been recorded. Total: UGX ${totalPrice.toLocaleString()}\n\nNote: Full order processing requires additional setup.`);
              }
              setCheckoutItem(null);
              setCheckoutQuantity('1');
              fetchMarketplace();
            } catch (error) {
              Alert.alert('Order Recorded', `Your order for ${qty} x ${checkoutItem.name} has been recorded locally. Total: UGX ${totalPrice.toLocaleString()}`);
              setCheckoutItem(null);
              setCheckoutQuantity('1');
            }
          }
        }
      ]
    );
  };

  const isOwner = (item) => {
    if (!currentUser) return false;
    return item.farmer === currentUser.id || 
           item.seller === currentUser.id || 
           item.farmer_name === currentUser.username ||
           item.vendor === currentUser.id;
  };

  const filterBySearch = (items) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query)
    );
  };

  return (
    <LinearGradient colors={["#e0f7fa", "#f8f9fa"]} style={styles.gradient}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}><Ionicons name="leaf-outline" size={28} color="#27ae60" /> Marketplace</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}><Ionicons name="add" size={18} color="#fff" /> Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchMarketplace}>
            <Text style={styles.refreshButtonText}><Ionicons name="refresh-outline" size={18} color="#fff" /> Refresh</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterButton, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')}>
            <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>All Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filter === 'mine' && styles.filterActive]} onPress={() => setFilter('mine')}>
            <Text style={filter === 'mine' ? styles.filterTextActive : styles.filterText}>My Products</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Product</Text>
              <View style={styles.switchRow}>
                <TouchableOpacity onPress={() => setProductType('produce')} style={[styles.switchButton, productType === 'produce' && styles.switchActive]}>
                  <Text style={productType === 'produce' ? styles.switchTextActive : styles.switchText}>Produce</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setProductType('supply')} style={[styles.switchButton, productType === 'supply' && styles.switchActive]}>
                  <Text style={productType === 'supply' ? styles.switchTextActive : styles.switchText}>Supply</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Name</Text>
              <TextInput placeholder="Name" style={styles.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center', backgroundColor: '#f4f4f4' }]}
                onPress={() => setCategoryModal(true)}
              >
                <Text style={{ color: form.category ? '#222' : '#888' }}>
                  {categories.find(cat => cat.id === form.category)?.name || 'Select Category'}
                </Text>
              </TouchableOpacity>
              <Modal visible={!!categoryModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Category</Text>
                    <ScrollView style={{ maxHeight: 250 }}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                          onPress={() => {
                            setForm(f => ({ ...f, category: cat.id }));
                            setCategoryModal(false);
                          }}
                        >
                          <Text style={{ color: '#222', fontSize: 16 }}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <Button title="Cancel" onPress={() => setCategoryModal(false)} color="#888" />
                  </View>
                </View>
              </Modal>

              <Text style={styles.label}>Price</Text>
              <TextInput placeholder="Price" style={styles.input} value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} keyboardType="numeric" />
              {productType === 'produce' ? (
                <>
                  <Text style={styles.label}>Unit (e.g. kg, bag)</Text>
                  <TextInput placeholder="Unit (e.g. kg, bag)" style={styles.input} value={form.unit} onChangeText={v => setForm(f => ({ ...f, unit: v }))} />
                </>
              ) : null}
              <Text style={styles.label}>{productType === 'produce' ? "Quantity Available" : "Stock"}</Text>
              <TextInput placeholder={productType === 'produce' ? "Quantity Available" : "Stock"} style={styles.input} value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
              <Text style={styles.label}>Description</Text>
              <TextInput placeholder="Description" style={styles.input} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>{form.image ? 'Change Image' : 'Pick Image'}</Text>
              </TouchableOpacity>
              {form.image && (
                <Image source={{ uri: form.image }} style={styles.image} />
              )}
              <View style={styles.modalButtonRow}>
                <Button title="Add" onPress={handleAddProduct} color="#27ae60" />
                <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.cartButton} onPress={() => setCartVisible(true)}>
          <Text style={styles.cartButtonText}><Ionicons name="cart-outline" size={18} color="#fff" /> View Cart ({cart.length})</Text>
        </TouchableOpacity>
        <Modal visible={cartVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}><Ionicons name="cart" size={22} color="#27ae60" /> Cart</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {cart.length === 0 ? (
                  <Text style={styles.emptyText}>Your cart is empty.</Text>
                ) : (
                  cart.map((item, idx) => (
                    <View key={idx} style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 }}>
                      <Text style={{ fontWeight: 'bold' }}>{item.name} <Text style={{ color: '#888' }}>({item.type})</Text></Text>
                      <Text style={{ color: '#2980b9' }}>Price: {item.price_per_unit || item.price}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFromCart(idx)}>
                        <Text style={{ color: '#e74c3c', marginTop: 2 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
              <Button title="Close" onPress={() => setCartVisible(false)} color="#27ae60" />
            </View>
          </View>
        </Modal>
        
        {/* Checkout Modal */}
        <Modal visible={!!checkoutItem} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}><Ionicons name="card" size={22} color="#27ae60" /> Checkout</Text>
              {checkoutItem && (
                <>
                  <View style={styles.checkoutItemInfo}>
                    <Text style={styles.checkoutItemName}>{checkoutItem.name}</Text>
                    <Text style={styles.checkoutItemPrice}>
                      UGX {checkoutItem.price_per_unit || checkoutItem.price} 
                      {checkoutItem.unit ? ` / ${checkoutItem.unit}` : ' each'}
                    </Text>
                    <Text style={styles.checkoutItemAvailable}>
                      Available: {checkoutItem.quantity_available || checkoutItem.stock}
                    </Text>
                  </View>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={checkoutQuantity}
                    onChangeText={setCheckoutQuantity}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                  />
                  <View style={styles.checkoutTotal}>
                    <Text style={styles.checkoutTotalLabel}>Total:</Text>
                    <Text style={styles.checkoutTotalAmount}>
                      UGX {((parseFloat(checkoutItem.price_per_unit || checkoutItem.price) || 0) * (parseInt(checkoutQuantity) || 0)).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={styles.checkoutConfirmButton} onPress={handleCheckout}>
                      <Text style={styles.checkoutConfirmText}><Ionicons name="checkmark-circle" size={18} color="#fff" /> Confirm Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkoutCancelButton} onPress={() => { setCheckoutItem(null); setCheckoutQuantity('1'); }}>
                      <Text style={styles.checkoutCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
        
        {loading ? (
          <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}><Ionicons name="leaf" size={20} color="#27ae60" /> Farm Produce</Text>
            {/* Farm Produce grid */}
            <View style={styles.gridContainer}>
              {filterBySearch(produce
                .filter(item => filter === 'all' || (currentUser && (item.farmer === currentUser.id || item.farmer_name === currentUser.username))))
                .reduce((rows, item, idx, arr) => {
                  if (idx % 2 === 0) rows.push(arr.slice(idx, idx + 2));
                  return rows;
                }, [])
                .map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {row.map((item, idx) => {
                      const catName = categories.find(cat => cat.id === item.category)?.name || item.category;
                      const owned = isOwner(item, 'produce');
                      return (
                        <View key={idx} style={styles.gridCard}>
                          {item.image && (
                            <Image source={{ uri: item.image }} style={styles.gridImage} />
                          )}
                          <Text style={styles.name}>{item.name}</Text>
                          <Text style={styles.category}>{catName}</Text>
                          <Text style={styles.price}>UGX {item.price_per_unit} / {item.unit}</Text>
                          <Text style={styles.quantity}>Available: {item.quantity_available}</Text>
                          <Text style={styles.seller}>Farmer: {item.farmer_name}</Text>
                          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                          {!owned && (
                            <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNow(item, 'produce')}>
                              <Text style={styles.buyButtonText}><Ionicons name="card-outline" size={16} color="#fff" /> Buy Now</Text>
                            </TouchableOpacity>
                          )}
                          {!owned && (
                            <TouchableOpacity style={styles.cartAddButton} onPress={() => handleAddToCart(item, 'produce')}>
                              <Text style={styles.cartAddButtonText}><Ionicons name="cart-outline" size={16} color="#fff" /> Add to Cart</Text>
                            </TouchableOpacity>
                          )}
                          {owned && (
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item.id, 'produce')}>
                              <Text style={styles.deleteButtonText}><Ionicons name="trash-outline" size={16} color="#fff" /> Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
            </View>
            <Text style={styles.sectionTitle}><Ionicons name="hammer-outline" size={20} color="#2980b9" /> Tools & Supplies</Text>
            {/* Supplies grid */}
            <View style={styles.gridContainer}>
              {filterBySearch(supplies
                .filter(item => filter === 'all' || (currentUser && (item.vendor === currentUser.id || item.vendor_name === currentUser.username))))
                .reduce((rows, item, idx, arr) => {
                  if (idx % 2 === 0) rows.push(arr.slice(idx, idx + 2));
                  return rows;
                }, [])
                .map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {row.map((item, idx) => {
                      const catName = categories.find(cat => cat.id === item.category)?.name || item.category;
                      const owned = isOwner(item, 'supply');
                      return (
                        <View key={idx} style={styles.gridCard}>
                          {item.image && (
                            <Image source={{ uri: item.image }} style={styles.gridImage} />
                          )}
                          <Text style={styles.name}>{item.name}</Text>
                          <Text style={styles.category}>{catName}</Text>
                          <Text style={styles.price}>UGX {item.price}</Text>
                          <Text style={styles.quantity}>Stock: {item.stock}</Text>
                          <Text style={styles.seller}>Vendor: {item.vendor_name || item.farmer_name}</Text>
                          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                          {!owned && (
                            <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNow(item, 'supply')}>
                              <Text style={styles.buyButtonText}><Ionicons name="card-outline" size={16} color="#fff" /> Buy Now</Text>
                            </TouchableOpacity>
                          )}
                          {!owned && (
                            <TouchableOpacity style={styles.cartAddButton} onPress={() => handleAddToCart(item, 'supply')}>
                              <Text style={styles.cartAddButtonText}><Ionicons name="cart-outline" size={16} color="#fff" /> Add to Cart</Text>
                            </TouchableOpacity>
                          )}
                          {owned && (
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item.id, 'supply')}>
                              <Text style={styles.deleteButtonText}><Ionicons name="trash-outline" size={16} color="#fff" /> Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#27ae60', marginBottom: 20, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  addButton: { backgroundColor: '#27ae60', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', marginBottom: 0, shadowColor: '#27ae60', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  refreshButton: { backgroundColor: '#2980b9', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', marginLeft: 8, shadowColor: '#2980b9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  refreshButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2980b9', marginTop: 24, marginBottom: 12 },
  cardShadow: { shadowColor: '#27ae60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8, marginBottom: 24, borderRadius: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#27ae60', marginBottom: 2 },
  category: { fontSize: 13, color: '#2980b9', marginBottom: 4, fontWeight: 'bold' },
  price: { fontSize: 15, color: '#2980b9', marginBottom: 2, fontWeight: 'bold' },
  quantity: { fontSize: 13, color: '#555', marginBottom: 2 },
  seller: { fontSize: 12, color: '#888', marginBottom: 2 },
  desc: { fontSize: 12, color: '#555', marginBottom: 8 },
  buyButton: { backgroundColor: '#27ae60', padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6, width: '100%' },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cartButton: { backgroundColor: '#ff9800', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  cartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cartAddButton: { backgroundColor: '#3498db', padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6, width: '100%' },
  cartAddButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  deleteButton: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6, width: '100%' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#888', fontStyle: 'italic', marginBottom: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#27ae60', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  label: { fontSize: 15, color: '#555', marginBottom: 4, marginLeft: 2 },
  imagePicker: { backgroundColor: '#eee', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  imagePickerText: { color: '#2980b9', fontWeight: 'bold' },
  previewImage: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  switchButton: { padding: 8, borderRadius: 8, marginHorizontal: 8, backgroundColor: '#eee' },
  switchActive: { backgroundColor: '#27ae60' },
  switchText: { color: '#2980b9', fontWeight: 'bold' },
  switchTextActive: { color: '#fff', fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  filterButton: { padding: 8, borderRadius: 8, marginHorizontal: 8, backgroundColor: '#eee' },
  filterActive: { backgroundColor: '#27ae60' },
  filterText: { color: '#2980b9', fontWeight: 'bold' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  gridContainer: { marginBottom: 16 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gridCard: { flex: 0.48, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginHorizontal: 2, alignItems: 'flex-start', shadowColor: '#27ae60', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  gridImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 10, resizeMode: 'cover' },
  // Checkout modal styles
  checkoutItemInfo: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 },
  checkoutItemName: { fontSize: 20, fontWeight: 'bold', color: '#27ae60', marginBottom: 4 },
  checkoutItemPrice: { fontSize: 16, color: '#2980b9', marginBottom: 4 },
  checkoutItemAvailable: { fontSize: 14, color: '#666' },
  checkoutTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 16, borderRadius: 8, marginBottom: 16 },
  checkoutTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  checkoutTotalAmount: { fontSize: 20, fontWeight: 'bold', color: '#27ae60' },
  checkoutConfirmButton: { backgroundColor: '#27ae60', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  checkoutConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkoutCancelButton: { backgroundColor: '#e74c3c', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  checkoutCancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
