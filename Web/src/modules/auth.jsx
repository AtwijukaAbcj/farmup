import { useState } from 'react';

export function AuthModule({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [role, setRole] = useState('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with real API call
      setTimeout(() => {
        setLoading(false);
        if (onAuth) onAuth({ username, role, email, dob });
      }, 1000);
    } catch (err) {
      setError(isLogin ? 'Login failed.' : 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 400, margin: '2rem auto', background: '#fff', padding: 24, borderRadius: 8 }}>
      {!showRegister ? (
        <>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Username:
              <input value={username} onChange={e => setUsername(e.target.value)} required />
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
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          </form>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={() => setShowRegister(true)} style={{ color: '#fff', background: '#007b5e', border: 'none', borderRadius: 4, padding: '8px 24px', cursor: 'pointer', fontWeight: 600 }}>Register</button>
          </div>
        </>
      ) : (
        <>
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Username:
              <input value={username} onChange={e => setUsername(e.target.value)} required />
            </label>
            <label>
              Email:
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>
              Date of Birth:
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
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
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          </form>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={() => setShowRegister(false)} style={{ color: '#007b5e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Back to Login</button>
          </div>
        </>
      )}
    </div>
  );
}
