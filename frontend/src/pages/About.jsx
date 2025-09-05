import React from 'react';

export default function About() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white shadow rounded p-6 text-center">
				<h1 className="text-xl font-semibold mb-3">About Us</h1>
				<p className="text-sm text-gray-700">
					Attendly is a simple college-level attendance management system designed for students,
					teachers, and admins. It helps automate attendance with QR codes and provides dashboards
					for easy tracking.
				</p>
			</div>
		</div>
	);
}


