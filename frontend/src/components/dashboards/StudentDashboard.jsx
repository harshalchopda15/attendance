import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { Html5Qrcode } from 'html5-qrcode';

export default function StudentDashboard() {
	const [qrInput, setQrInput] = useState('');
	const [message, setMessage] = useState('');
	const [records, setRecords] = useState([]);
	const [scanning, setScanning] = useState(false);
	const [cameras, setCameras] = useState([]);
	const [selectedCameraId, setSelectedCameraId] = useState('');
	const scannerRef = useRef(null);
	const html5QrRef = useRef(null);

	async function mark() {
		setMessage('');
		try {
			console.log('Attempting to mark attendance with QR:', qrInput);
			console.log('Current auth token:', localStorage.getItem('attendly_token'));
			
			const response = await api.post('/student/mark-attendance', { qr: qrInput });
			console.log('Attendance marked successfully:', response.data);
			setMessage('Attendance marked successfully');
			// Refresh attendance records
			loadMine();
		} catch (e) {
			console.error('Error marking attendance:', e);
			console.error('Response data:', e?.response?.data);
			console.error('Response status:', e?.response?.status);
			setMessage(e?.response?.data?.message || 'Failed to mark attendance');
		}
	}

	async function loadMine() {
		const { data } = await api.get('/student/my-attendance');
		setRecords(data);
	}

	useEffect(() => {
		return () => {
			if (html5QrRef.current) {
				try {
					html5QrRef.current.stop();
					html5QrRef.current.clear();
				} catch {}
			}
		};
	}, []);

	async function ensurePermission() {
		if (!navigator?.mediaDevices?.getUserMedia) return;
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			stream.getTracks().forEach(t => t.stop());
		} catch (err) {
			throw err;
		}
	}

	async function startScan() {
		if (scanning) return;
		setMessage('');
		setScanning(true);
		try {
			await ensurePermission();
			const config = { fps: 10, qrbox: { width: 250, height: 250 } };
			const html5QrCode = new Html5Qrcode('qr-reader');
			html5QrRef.current = html5QrCode;
			let available = [];
			try {
				available = await Html5Qrcode.getCameras();
				setCameras(available);
			} catch (e) {
				// continue, will fail below if none
			}
			const cameraId = selectedCameraId || available?.[0]?.id;
			if (!cameraId) {
				setMessage('No camera found. In Brave, allow camera access and disable Shields for this site.');
				setScanning(false);
				return;
			}
			await html5QrCode.start(
				cameraId,
				config,
				(decodedText) => {
					setQrInput(decodedText);
					setMessage('QR detected');
					stopScan();
				},
				() => {}
			);
		} catch (err) {
			const msg = String(err?.message || err || 'Failed to start camera');
			if (msg.includes('NotAllowedError')) {
				setMessage('Camera permission denied. In Brave, click the lock icon > allow Camera, and disable Shields for localhost.');
			} else if (msg.includes('NotFoundError')) {
				setMessage('No camera device found. Connect a camera or try a different browser/device.');
			} else {
				setMessage('Failed to start camera: ' + msg);
			}
			setScanning(false);
		}
	}

	async function stopScan() {
		if (!html5QrRef.current) {
			setScanning(false);
			return;
		}
		try {
			await html5QrRef.current.stop();
			await html5QrRef.current.clear();
		} catch {}
		html5QrRef.current = null;
		setScanning(false);
	}

	return (
		<div className="p-4 max-w-3xl mx-auto">
			<h1 className="text-2xl font-semibold mb-4">Student Dashboard</h1>
			<div className="bg-white shadow p-4 rounded mb-4">
				<h2 className="font-medium mb-2">Scan or paste QR payload</h2>
				<div className="flex items-center gap-2 mb-3">
					{!scanning && cameras.length > 1 && (
						<select
							className="border rounded px-2 py-2"
							value={selectedCameraId}
							onChange={(e) => setSelectedCameraId(e.target.value)}
						>
							<option value="">Default camera</option>
							{cameras.map((c) => (
								<option key={c.id} value={c.id}>{c.label || c.id}</option>
							))}
						</select>
					)}
					<button
						className={`px-3 py-2 rounded text-white ${scanning ? 'bg-gray-500' : 'bg-blue-600'}`}
						onClick={() => (scanning ? stopScan() : startScan())}
					>
						{scanning ? 'Stop Camera' : 'Scan with Camera'}
					</button>
					<button className="bg-green-600 text-white px-3 py-2 rounded" onClick={mark}>Mark Attendance</button>
				</div>
				{scanning && (
					<div className="mb-3">
						<div id="qr-reader" ref={scannerRef} className="w-full max-w-xs aspect-square border rounded" />
						<div className="text-xs text-gray-600 mt-1">Allow camera permission. In Brave, disable Shields and allow Camera permission.</div>
					</div>
				)}
				<textarea className="w-full border rounded p-2 h-28 mb-3" value={qrInput} onChange={e=>setQrInput(e.target.value)} placeholder="Paste QR JSON string here" />
				{message && <div className="mt-2 text-sm">{message}</div>}
			</div>
			<div className="bg-white shadow p-4 rounded">
				<div className="flex items-center justify-between mb-2">
					<h2 className="font-medium">My Attendance</h2>
					<button className="text-blue-600" onClick={loadMine}>Refresh</button>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left border-b">
							<th className="py-2">Class</th>
							<th className="py-2">Subject</th>
							<th className="py-2">Date</th>
						</tr>
					</thead>
					<tbody>
						{records.map((r) => (
							<tr key={r.id} className="border-b">
								<td className="py-2">{r.class_id}</td>
								<td className="py-2">{r.class?.subject}</td>
								<td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


