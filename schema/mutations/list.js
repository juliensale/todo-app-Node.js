const { GraphQLNonNull, GraphQLString } = require("graphql");
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

	return { createList };
};

module.exports = createListMutations;