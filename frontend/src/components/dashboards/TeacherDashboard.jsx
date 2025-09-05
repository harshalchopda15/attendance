import React, { useState } from 'react';
import api from '../../services/api';

export default function TeacherDashboard() {
  const [subject, setSubject] = useState('');
  const [qr, setQr] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]);
  const [classId, setClassId] = useState('');

  async function generate() {
    const { data } = await api.post('/teacher/generate-qr', { subject });
    setQr(data);
    setClassId(data.classId);
  }

  async function getPresentStudents() {
    if (!classId) {
      alert('Please generate a QR code first to get the class ID');
      return;
    }
    try {
      const { data } = await api.get(`/teacher/present-students/${classId}`);
      setPresentStudents(data);
    } catch (err) {
      console.error('Error fetching present students:', err);
      alert('Error fetching present students');
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Teacher Dashboard</h1>
      <div className="bg-white shadow p-4 rounded mb-4">
        <h2 className="font-medium mb-2">Generate QR for class</h2>
        <input className="border rounded px-3 py-2 mr-2" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generate}>Generate</button>
        {qr && (
          <div className="mt-4">
            <img src={qr.qr} alt="QR" className="w-56 h-56 border" />
            <div className="text-sm mt-2">Expires: {new Date(qr.expiresAt).toLocaleTimeString()}</div>
            <div className="text-xs text-gray-500 break-all mt-1">Payload: {qr.qr && '(embedded in image)'}</div>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow p-4 rounded mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Present Students</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={getPresentStudents}>
            Get Present Students
          </button>
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
          <p className="text-gray-500 text-sm">No students have marked attendance yet.</p>
        )}
      </div>
    </div>
  );
}


