const User = require('../models/user');
const sha256 = require('sha256');
const jwt = require('jsonwebtoken');

const register = (req, res) => {
	try {
		let { username, password } = req.body;

		// Validates the credentials
		if (
			!(typeof (username) === 'string' && username
				&& typeof (password) === 'string' && password)
		) {
			res.status(400).send('Invalid credentials.');
		};

		// Secure password with SHA256
		const secure_password = sha256(password);

		// Creates the user instance
		User.create({ username: username, password: secure_password })
			.then(() => {
				// Creates JWT Token for later use
				const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
				res.status(201).send({ authentication_token: token });
			})
			.catch(() => {
				res.status(500).send('Server error.')
			})

	} catch {
		res.status(400).send('Invalid credentials.');
	}
}

const login = (req, res) => {
	console.log(req.body);
	try {
		const { username, password } = req.body;

		// Validates the credentials
		if (
			!(typeof (username) === 'string' && username
				&& typeof (password) === 'string' && password)
		) {
			res.status(400).send('Invalid credentials.');
		};

		// Secure password with SHA256
		const secure_password = sha256(password);

		// Connects the user
		User.findOne({ where: { username: username } })
			.then(user => {
				if (!user) {
					return res.status(400).send('No user found with this username.');
				}
				if (user.password === secure_password) {
					// Creates JWT Token for later use
					const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
					res.status(201).send({ authentication_token: token });
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
		res.status(400).send('Invalid credentials. (catch)');
	}
}

module.exports = { register, login }