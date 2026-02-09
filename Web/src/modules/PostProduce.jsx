import { useState } from 'react';
import { postProduce } from '../api.js';

export function PostProduce({ onPosted }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('fruits');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const data = {
        name,
        category,
        price_per_unit: parseFloat(price),
        unit,
        quantity_available: parseFloat(quantity),
      };
      const res = await postProduce(data);
      if (res.id) {
        setSuccess(true);
        setName(''); setCategory('fruits'); setPrice(''); setUnit('kg'); setQuantity('');
        if (onPosted) onPosted();
      } else {
        setError('Failed to post produce.');
      }
    } catch (err) {
      setError('Error posting produce.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Post New Produce</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="fruits">Fruits</option>
        <option value="vegetables">Vegetables</option>
        <option value="grains">Grains</option>
        <option value="dairy">Dairy</option>
        <option value="other">Other</option>
      </select>
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price per unit" type="number" step="0.01" required />
      <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit (e.g. kg)" required />
      <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity available" type="number" required />
      <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Produce'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Produce posted!</div>}
    </form>
  );
}
