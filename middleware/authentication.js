const User = require('../models/user');
const jwt = require('jsonwebtoken');

const isAuthenticated = async (req, res) => {
	try {
		const { authenticationtoken } = req.headers;

		try {
			const { username } = jwt.verify(authenticationtoken, process.env.TOKEN_KEY);
			return await User.findOne({ where: { username: username } })
				.then(user => { return [null, user] })
				.catch(() => {
					res.status(403).send('Invalid token.');
					return [{ token: true }, null];
				});
		} catch {
			res.status(403).send('Invalid token.');
			return [{ token: true }, null];
		}

	} catch {
		res.status(403).send('Authentication required. Set `AuthenticationToken` header with the authentication token.');
		return [{ token: true }, null];
	}
};

module.exports = { isAuthenticated };