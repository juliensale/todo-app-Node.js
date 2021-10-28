const graphql = require('graphql');
const { GraphQLList, GraphQLInt } = graphql;
const checkAuthentication = require('../checkAuthentication');

const createSubtaskQueries = (User, Subtask, SubtaskType) => {
	const subtask = {
		type: SubtaskType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}

					return Subtask.findOne({ where: { id: args.id, UserId: user.id } })
						.then(subtask => {
							if (!subtask) {
								throw new Error('No subtask found.')
							}
							return subtask
						})
						.catch(err => { throw err })
				})
				.catch(err => { throw err })
		}
	}

	const subtasks = {
		type: new GraphQLList(SubtaskType),
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return Subtask.findAll({ where: { UserId: user.id } });
				})
				.catch(err => { throw err })
		}
	}

	return { subtask, subtasks }
}

module.exports = createSubtaskQueries;