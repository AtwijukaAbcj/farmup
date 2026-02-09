import { useEffect, useState } from 'react';
import { fetchProduce, fetchSupplies } from '../api.js';

export function AdminDashboard() {
  const [produce, setProduce] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [users, setUsers] = useState([]); // Placeholder, implement fetchUsers
  const [orders, setOrders] = useState([]); // Placeholder, implement fetchOrders
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // TODO: Replace with real API calls for users and orders
      const [prod, supp] = await Promise.all([
        fetchProduce(),
        fetchSupplies()
      ]);
      setProduce(prod);
      setSupplies(supp);
      setUsers([]); // Replace with real data
      setOrders([]); // Replace with real data
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#e0ffe0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Users</h3>
          <p><b>Total:</b> {users.length} (API integration needed)</p>
          <button disabled>Manage Users</button>
        </div>
        <div style={{ background: '#e0ffe0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Produce Listings</h3>
          <p><b>Total:</b> {produce.length}</p>
          <button disabled>Manage Produce</button>
        </div>
        <div style={{ background: '#e0ffe0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Supply Products</h3>
          <p><b>Total:</b> {supplies.length}</p>
          <button disabled>Manage Supplies</button>
        </div>
        <div style={{ background: '#e0ffe0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Orders & Credits</h3>
          <p><b>Total:</b> {orders.length} (API integration needed)</p>
          <button disabled>Manage Orders</button>
        </div>
      </div>
      <p>Assign roles and permissions (coming soon)</p>
    </div>
  );
}
