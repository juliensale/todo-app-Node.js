const graphql = require('graphql');
const { GraphQLInt, GraphQLList } = graphql;

const createSublistQueries = (User, Sublist, SublistType) => {
	const sublist = {
		type: SublistType,
		args: { id: { type: GraphQLInt } },
		resolve(parent, args) {
			return Sublist.findOne({ where: { id: args.id } });
		}
	};

	const sublists = {
		type: new GraphQLList(SublistType),
		resolve(parent, args) {
			return Sublist.findAll({});
		}
	};

	return { sublist, sublists };
};

module.exports = createSublistQueries;