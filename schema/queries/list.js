const graphql = require('graphql');
const { GraphQLInt, GraphQLList } = graphql;
const checkAuthentication = require('../checkAuthentication');

const jwt = require('jsonwebtoken');
require('dotenv').config()

const createListQueries = (User, List, ListType) => {
	const list = {
		type: ListType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return List.findOne({ where: { id: args.id, UserId: user.id } })
						.then(list => {
							if (!list) {
								throw new Error('No list found.')
							}
							return list
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const lists = {
		type: new GraphQLList(ListType),
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return List.findAll({ where: { UserId: user.id } });
				})
				.catch(err => { throw err });
		}
	};

	return { list, lists };
};

module.exports = createListQueries;

