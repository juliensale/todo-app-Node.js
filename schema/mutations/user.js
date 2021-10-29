const { GraphQLNonNull, GraphQLString } = require("graphql");
const { AuthType } = require('../types');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUserMutations = (User) => {
	const register = {
		type: AuthType,
		args: {
			username: { type: new GraphQLNonNull(GraphQLString) },
			password: { type: new GraphQLNonNull(GraphQLString) }
		},
		resolve(parent, args) {
			return User.create({
				username: args.username,
				password: args.password
			})
				.then(() => {
					// Creates JWT Token for later use
					const token = jwt.sign({ username: args.username }, process.env.TOKEN_KEY);
					return { authentication_token: token };
				})
				.catch((err) => {
					if (err.errors[0].message === 'username must be unique') {
						throw new Error('A user with this username already exists.');
					}
					throw new Error('Server error.');
				})
		}
	}

	const login = {
		type: AuthType,
		args: {
			username: { type: new GraphQLNonNull(GraphQLString) },
			password: { type: new GraphQLNonNull(GraphQLString) }
		},
		resolve(parent, args) {
			return User.findOne({ where: { username: args.username } })
				.then(user => {
					if (!user) {
						throw new Error("There is no account with this username.");
					};
					if (user.checkPassword(args.password)) {
						const token = jwt.sign({ username: args.username }, process.env.TOKEN_KEY);
						return { authentication_token: token };
					} else {
						throw new Error("Wrong password.")
					}
				})
				.catch(err => { throw err });
		}
	};

	return { register, login };
}

module.exports = createUserMutations;