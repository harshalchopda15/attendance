import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

export default function Navbar({ user, setUser }) {
	const navigate = useNavigate();

	function goHome() {
		if (!user) return navigate('/login');
		if (user.role === 'student') return navigate('/student');
		if (user.role === 'teacher') return navigate('/teacher');
		if (user.role === 'admin') return navigate('/admin');
		navigate('/login');
	}

	async function handleLogout() {
		try { await api.post('/auth/logout'); } catch {}
		setUser(null);
		setAuthToken(null);
		navigate('/login');
	}

	return (
		<nav className="w-full border-b bg-white">
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button className="text-sm px-3 py-2 rounded hover:bg-gray-100" onClick={goHome}>Home</button>
					<Link className="text-sm px-3 py-2 rounded hover:bg-gray-100" to="/about">About Us</Link>
				</div>
				<div className="font-bold tracking-wide">ATTENDLY</div>
				<div className="flex items-center gap-3">
					{!user ? (
						<>
							<Link className="text-sm px-3 py-2 rounded bg-blue-600 text-white" to="/login">Login</Link>
							<Link className="text-sm px-3 py-2 rounded border" to="/signup">Sign Up</Link>
						</>
					) : (
						<>
							<button className="text-sm px-3 py-2 rounded border" onClick={handleLogout}>Logout</button>
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
									{user.name?.[0]?.toUpperCase() || '?'}
								</div>
								<div className="text-sm">{user.name}</div>
							</div>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}


