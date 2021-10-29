const { GraphQLNonNull, GraphQLString, GraphQLInt } = require("graphql");
const checkAuthentication = require("../checkAuthentication");
const { DeleteType } = require('../types');

const createSublistMutations = (User, List, Sublist, SublistType) => {
	const createSublist = {
		type: SublistType,
		args: {
			ListId: { type: new GraphQLNonNull(GraphQLInt) },
			title: { type: new GraphQLNonNull(GraphQLString) }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					return List.findOne({ where: { id: args.ListId, UserId: user.id } })
						.then(list => {
							if (!list) {
								throw new Error('Invalid ListId.');
							};
							return Sublist.create({
								title: args.title,
								UserId: user.id,
								ListId: args.ListId
							})
						})
						.catch(err => { throw err })


				})
				.catch(err => { throw err });
		}
	}

	const editSublist = {
		type: SublistType,
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
					return Sublist.findOne({ where: { id: args.id, UserId: user.id } })
						.then(sublist => {
							if (!sublist) {
								throw new Error('No sublist found.');
							};

							if (args.title) {
								sublist.title = args.title;
							};
							return sublist.save();
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	const deleteSublist = {
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

					return Sublist.findOne({ where: { id: args.id, UserId: user.id } })
						.then(sublist => {
							if (!sublist) {
								throw new Error('No sublist found.');
							};

							return sublist.destroy()
								.then(() => {
									return { message: "Sublist deleted." }
								})
								.catch(err => { throw err });
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	return { createSublist, editSublist, deleteSublist };
};

module.exports = createSublistMutations;