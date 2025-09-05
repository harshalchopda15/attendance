const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function authenticate(req, res, next) {
	// Check both cookie and Authorization header
	const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
	
	if (!token) {
		console.log('No token found in request:', { 
			cookies: req.cookies, 
			authorization: req.headers.authorization,
			url: req.url,
			method: req.method
		});
		return res.status(401).json({ message: 'Unauthorized - No token provided' });
	}
	
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		console.log('Token verified successfully for user:', { id: payload.id, role: payload.role, url: req.url });
		next();
	} catch (err) {
		console.log('Token verification failed:', { error: err.message, token: token.substring(0, 20) + '...' });
		return res.status(401).json({ message: 'Invalid token' });
	}
}

function authorize(roles = []) {
	return (req, res, next) => {
		if (!roles.length) return next();
		if (!req.user || !roles.includes(req.user.role)) {
			console.log('Authorization failed:', { 
				user: req.user, 
				requiredRoles: roles, 
				url: req.url 
			});
			return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
		}
		next();
	};
}

module.exports = { authenticate, authorize };
