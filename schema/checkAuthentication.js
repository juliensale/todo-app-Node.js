const jwt = require('jsonwebtoken');
require('dotenv').config();


// returns [errorMessage (string), user]
const checkAuthentication = async (User, headers) => {
	try {
		const { username } = jwt.verify(headers.headers.authenticationtoken, process.env.TOKEN_KEY)

		// If the jwt verify worked
		return await User.findOne({ where: { username: username } })
			.then(user => {
				if (!user) {
					// No user with the given username					
					return ["Invalid 'AuthenticationToken' header.", null];
				} else {
					// All good
					return [null, user]
				}

			})
			.catch(() => {
				return ["Server error.", null]
			})

	} catch {
		// If the jwt verify fails
		return ["You must provide an 'AuthenticationToken' header.", null];
	}
}

module.exports = checkAuthentication;