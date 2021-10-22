const jwt = require('jsonwebtoken');

const createAuthentication = (User) => {
	const isAuthenticated = async (req, res) => {
		const { authenticationtoken } = req.headers;
		if (authenticationtoken === undefined) {
			res.status(403).send('Authentication required. Set `AuthenticationToken` header with the authentication token.');
			return [{ token: true }, null];
		}
		try {
			const { username } = jwt.verify(authenticationtoken, process.env.TOKEN_KEY);
			return await User.findOne({ where: { username: username } })
				.then(user => {
					if (user === null) {
						res.status(403).send('User does not exist.')
						return [{ token: true }, null]
					} else {
						return [null, user]
					}
				})
				.catch(() => {
					res.status(403).send('Invalid token.');
					return [{ token: true }, null];
				});
		} catch {
			res.status(403).send('Invalid token.');
			return [{ token: true }, null];
		}

	};

	return { isAuthenticated };
};

module.exports = createAuthentication;