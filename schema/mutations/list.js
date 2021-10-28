const { GraphQLNonNull, GraphQLString, GraphQLInt } = require("graphql");
const checkAuthentication = require("../checkAuthentication");

const createListMutations = (User, List, ListType) => {
	const createList = {
		type: ListType,
		args: {
			title: { type: new GraphQLNonNull(GraphQLString) },
			color: { type: GraphQLString }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};

					var newArgs = {
						title: args.title,
						UserId: user.id
					};
					if (args.color) {
						newArgs['color'] = args.color;
					};


					return List.create(newArgs);
				})
				.catch(err => { throw err });
		}
	}

	const editList = {
		type: ListType,
		args: {
			id: { type: new GraphQLNonNull(GraphQLInt) },
			title: { type: GraphQLString },
			color: { type: GraphQLString }
		},
		resolve(parent, args, headers) {
			return checkAuthentication(User, headers)
				.then(res => {
					const [errorMessage, user] = res;
					if (errorMessage) {
						throw new Error(errorMessage);
					};
					return List.findOne({ where: { id: args.id, UserId: user.id } })
						.then(list => {
							if (!list) {
								throw new Error('No list found.');
							};

							if (args.title) {
								list.title = args.title;
							};
							if (args.color) {
								list.color = args.color;
							};
							return list.save();
						})
						.catch(err => { throw err });
				})
				.catch(err => { throw err });
		}
	};

	return { createList, editList };
};

module.exports = createListMutations;