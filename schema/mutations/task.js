const { GraphQLNonNull, GraphQLString, GraphQLInt } = require("graphql");
const checkAuthentication = require("../checkAuthentication");
const { DeleteType } = require('../types');

const createTaskMutations = (User, Sublist, Task, TaskType) => {
	const createTask = {
		type: TaskType,
		args: {
			SublistId: { type: new GraphQLNonNull(GraphQLInt) },
			title: { type: new GraphQLNonNull(GraphQLString) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Sublist.findOne({ where: { id: args.SublistId, UserId: user.id } })
						.then(sublist => {
							if (!sublist) {
								throw new Error('Invalid SublistId.');
							};
							return Task.create({
								title: args.title,
								UserId: user.id,
								SublistId: args.SublistId
							})
						})
						.catch(err => { throw err })


				})
				.catch(err => { throw err });
		}
	}

	const editTask = {
		type: TaskType,
		args: {
			id: { type: new GraphQLNonNull(GraphQLInt) },
			title: { type: GraphQLString }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};
					return Task.findOne({ where: { id: args.id, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('No task found.');
							};

							if (args.title) {
								task.title = args.title;
							};
							return task.save();
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const deleteTask = {
		type: DeleteType,
		args: {
			id: { type: new GraphQLNonNull(GraphQLInt) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Task.findOne({ where: { id: args.id, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('No task found.');
							};

							return task.destroy()
								.then(() => {
									return { message: "Task deleted." }
								})
								.catch(err => { throw err });
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const completeTask = {
		type: TaskType,
		args: {
			id: { type: new GraphQLNonNull(GraphQLInt) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Task.findOne({ where: { id: args.id, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('No task found.');
							};

							return task.complete()
								.then(() => {
									return task
								})
								.catch(err => { throw err })
						})
						.catch(err => { throw err });
				})
		}
	}

	const uncompleteTask = {
		type: TaskType,
		args: {
			id: { type: new GraphQLNonNull(GraphQLInt) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Task.findOne({ where: { id: args.id, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('No task found.');
							};

							return task.uncomplete()
								.then(() => {
									return task
								})
								.catch(err => { throw err })
						})
						.catch(err => { throw err });
				})
		}
	}

	return { createTask, editTask, deleteTask, completeTask, uncompleteTask };
};

module.exports = createTaskMutations;