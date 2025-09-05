import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';

function Layout({ children, user, setUser }) {
	const location = useLocation();
	useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar user={user} setUser={setUser} />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}

function AppRoutes() {
	const [user, setUser] = useState(null);
	useEffect(() => {
		try { const u = localStorage.getItem('attendly_user'); if (u) setUser(JSON.parse(u)); } catch {}
	}, []);
	useEffect(() => {
		if (user) localStorage.setItem('attendly_user', JSON.stringify(user));
		else localStorage.removeItem('attendly_user');
	}, [user]);
	return (
		<Layout user={user} setUser={setUser}>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/about" element={<About />} />
				<Route path="/login" element={<LoginWrapper setUser={setUser} />} />
				<Route path="/signup" element={<SignupWrapper setUser={setUser} />} />
				<Route path="/student" element={<StudentDashboard />} />
				<Route path="/teacher" element={<TeacherDashboard />} />
				<Route path="/admin" element={<AdminDashboard />} />
			</Routes>
		</Layout>
	);
}

function LoginWrapper({ setUser }) {
	return <Login onLogin={(u) => setUser(u)} />;
}

function SignupWrapper({ setUser }) {
	return <Signup onSignup={(u) => setUser(u)} />;
}

function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	);
}

export default App;
