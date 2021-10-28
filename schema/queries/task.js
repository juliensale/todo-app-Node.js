const graphql = require('graphql');
const { GraphQLInt, GraphQLList } = graphql;
const checkAuthentication = require('../checkAuthentication');


const createTaskQueries = (User, Task, TaskType) => {
	const task = {
		type: TaskType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return Task.findOne({ where: { id: args.id, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('No task found.')
							}
							return task
						})
						.catch(err => { throw err });
				})
		}
	}

	const tasks = {
		type: new GraphQLList(TaskType),
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					}
					return Task.findAll({ where: { UserId: user.id } })
				})
		}
	}

	return { task, tasks }
}

module.exports = createTaskQueries;