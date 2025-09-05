import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../../services/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const role = data.role;
      const user = { name: data.name, email: data.email, role };
      if (data.token) setAuthToken(data.token);
      if (onLogin) onLogin(user);
      if (role === 'student') navigate('/student');
      else if (role === 'teacher') navigate('/teacher');
      else navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block text-sm mb-1">Password</label>
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white rounded py-2">Login</button>
        <div className="text-sm mt-3">No account? <Link to="/signup" className="text-blue-600">Sign up</Link></div>
      </form>
    </div>
  );
}


