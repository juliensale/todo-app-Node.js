const graphql = require('graphql');
const { GraphQLInt, GraphQLList } = graphql;

const jwt = require('jsonwebtoken');
require('dotenv').config()

const createListQueries = (User, List, ListType) => {
	const list = {
		type: ListType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args) {
			return List.findOne({ where: { id: args.id } });
		}
	};

	const lists = {
		type: new GraphQLList(ListType),
		resolve(parent, args, headers) {
			try {
				const { username } = jwt.verify(headers.headers.authenticationtoken, process.env.TOKEN_KEY)

				return User.findOne({ where: { username: username } })
					.then(user => {
						if (user) {
							return List.findAll({ where: { UserId: user.id } });
						}
						return user

					})
			} catch {
				throw new Error("You must provide an 'AuthenticationToken'.")
			}

		}
	};

	return { list, lists };
};

module.exports = createListQueries;

