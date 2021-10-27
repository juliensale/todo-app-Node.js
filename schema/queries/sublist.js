const graphql = require('graphql');
const { GraphQLInt, GraphQLList } = graphql;
const checkAuthentication = require('../checkAuthentication');

const createSublistQueries = (User, Sublist, SublistType) => {
	const sublist = {
		type: SublistType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return Sublist.findOne({ where: { id: args.id, UserId: user.id } })
						.then(sublist => {
							if (!sublist) {
								throw new Error('No sublist found.')
							}
							return sublist
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const sublists = {
		type: new GraphQLList(SublistType),
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return Sublist.findAll({ where: { UserId: user.id } });
				})
				.catch(err => { throw err });
		}
	};

	return { sublist, sublists };
};

module.exports = createSublistQueries;