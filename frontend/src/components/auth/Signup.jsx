import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../../services/api';

export default function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, role });
      const user = { name: data.name, email: data.email, role: data.role };
      // Auto-login after signup is not implemented server-side; no token here.
      if (onSignup) onSignup(user);
      if (role === 'student') navigate('/student');
      else if (role === 'teacher') navigate('/teacher');
      else navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={name} onChange={e=>setName(e.target.value)} required />
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block text-sm mb-1">Password</label>
        <input className="w-full border rounded px-3 py-2 mb-3" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label className="block text-sm mb-1">Role</label>
        <select className="w-full border rounded px-3 py-2 mb-4" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-blue-600 text-white rounded py-2">Sign Up</button>
        <div className="text-sm mt-3">Have an account? <Link to="/login" className="text-blue-600">Login</Link></div>
      </form>
    </div>
  );
}


