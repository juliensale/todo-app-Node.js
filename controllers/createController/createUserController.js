const jwt = require('jsonwebtoken');
const createAuthentication = require('../../middleware/createAuthentication');

const createUserController = (User) => {
	const isAuthenticated = createAuthentication(User);

	const register = (req, res) => {
		try {
			let { username, password } = req.body;

			// Validates the credentials
			if (
				!(typeof (username) === 'string' && username
					&& typeof (password) === 'string' && password)
			) {
				return res.status(400).send('Invalid credentials.');
			};

			// Creates the user instance
			User.create({ username: username, password: password })
				.then(() => {
					// Creates JWT Token for later use
					const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
					res.status(201).send({ authentication_token: token });
				})
				.catch((err) => {
					if (err.errors[0].message === 'username must be unique') {
						return res.status(400).send('This username is already used.')
					}
					return res.status(500).send('Server error.')
				})

		} catch {
			res.status(400).send('Invalid credentials.');
		}
	}

	const login = (req, res) => {
		try {
			const { username, password } = req.body;

			// Validates the credentials
			if (
				!(typeof (username) === 'string' && username
					&& typeof (password) === 'string' && password)
			) {
				return res.status(400).send('Invalid credentials.');
			};


			// Connects the user
			User.findOne({ where: { username: username } })
				.then(user => {
					if (!user) {
						return res.status(400).send('No user found with this username.');
					}
					if (user.checkPassword(password)) {
						// Creates JWT Token for later use
						const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
						res.status(200).send({ authentication_token: token });
					}
					else {
						res.status(400).send('Wrong password.');
					}
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				})
		} catch {
			console.log(req.body)
			res.status(400).send('Invalid credentials.');
		}
	}

	const get_info = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			res.status(200).send(user);
		}
	}

	return { register, login, get_info }

}

module.exports = createUserController

