import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  async function load() {
    const [u, r] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/reports'),
    ]);
    setUsers(u.data);
    setReports(r.data);
  }

  async function getPresentStudents() {
    if (!selectedClassId) {
      alert('Please enter a Class ID');
      return;
    }
    try {
      const { data } = await api.get(`/admin/present-students/${selectedClassId}`);
      setPresentStudents(data);
    } catch (err) {
      console.error('Error fetching present students:', err);
      alert('Error fetching present students');
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white shadow p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Users</h2>
            <button onClick={load} className="text-blue-600">Refresh</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b"><th className="py-2">ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b"><td className="py-2">{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Reports</h2>
            <button onClick={load} className="text-blue-600">Refresh</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b"><th className="py-2">Class ID</th><th>Subject</th><th>Date</th><th>Present</th></tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.class_id} className="border-b">
                  <td className="py-2">{r.class_id}</td>
                  <td>{r.class?.subject}</td>
                  <td>{new Date(r.class?.date).toLocaleString()}</td>
                  <td>{r.presentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white shadow p-4 rounded">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Present Students by Class</h2>
          <div className="flex items-center gap-2">
            <input 
              className="border rounded px-3 py-2" 
              placeholder="Enter Class ID" 
              value={selectedClassId} 
              onChange={e => setSelectedClassId(e.target.value)} 
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={getPresentStudents}>
              Get Present Students
            </button>
          </div>
        </div>
        {presentStudents.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {presentStudents.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="py-2">{student.id}</td>
                  <td className="py-2">{student.name}</td>
                  <td className="py-2">{student.email}</td>
                  <td className="py-2">{new Date(student.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">Enter a Class ID and click "Get Present Students" to view attendance.</p>
        )}
      </div>
    </div>
  );
}


