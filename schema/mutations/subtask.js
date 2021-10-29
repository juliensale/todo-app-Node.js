const { GraphQLNonNull, GraphQLString, GraphQLInt } = require("graphql");
const checkAuthentication = require("../checkAuthentication");
const { DeleteType } = require('../types');

const createSubtaskMutations = (User, Task, Subtask, SubtaskType) => {
	const createSubtask = {
		type: SubtaskType,
		args: {
			TaskId: { type: new GraphQLNonNull(GraphQLInt) },
			title: { type: new GraphQLNonNull(GraphQLString) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Task.findOne({ where: { id: args.TaskId, UserId: user.id } })
						.then(task => {
							if (!task) {
								throw new Error('Invalid TaskId.');
							};
							return Subtask.create({
								title: args.title,
								UserId: user.id,
								TaskId: args.TaskId
							})
						})
						.catch(err => { throw err })


				})
				.catch(err => { throw err });
		}
	}

	const editSubtask = {
		type: SubtaskType,
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
					return Subtask.findOne({ where: { id: args.id, UserId: user.id } })
						.then(subtask => {
							if (!subtask) {
								throw new Error('No subtask found.');
							};

							if (args.title) {
								subtask.title = args.title;
							};
							return subtask.save();
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const deleteSubtask = {
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

					return Subtask.findOne({ where: { id: args.id, UserId: user.id } })
						.then(subtask => {
							if (!subtask) {
								throw new Error('No subtask found.');
							};

							return subtask.destroy()
								.then(() => {
									return { message: "Subtask deleted." }
								})
								.catch(err => { throw err });
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const completeSubtask = {
		type: SubtaskType,
		args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return Subtask.findOne({ where: { id: args.id, UserId: user.id } })
						.then(subtask => {
							if (!subtask) {
								throw new Error('No subtask found.');
							};
							return subtask.complete()
								.then(() => subtask)
								.catch(err => { throw err });
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	return { createSubtask, editSubtask, deleteSubtask, completeSubtask };
};

module.exports = createSubtaskMutations;