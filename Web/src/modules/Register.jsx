import { useState } from 'react';

export function Register({ onRegister }) {
  const [role, setRole] = useState('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with real API call
      // Example: await api.register({ username, password, email, role })
      setTimeout(() => {
        setLoading(false);
        onRegister({ username, role });
      }, 1000);
    } catch (err) {
      setError('Registration failed.');
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label>
        Username:
        <input value={username} onChange={e => setUsername(e.target.value)} required />
      </label>
      <label>
        Email:
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="farmer">Farmer</option>
          <option value="customer">Customer</option>
          <option value="vendor">Hardware Vendor</option>
        </select>
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
