const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, } = graphql;


const createTypes = (List, Sublist, Task, Subtask) => {

	const ListType = new GraphQLObjectType({
		name: "List",
		fields: () => ({
			id: { type: GraphQLInt },
			title: { type: GraphQLString },
			color: { type: GraphQLString },
			sublists: {
				type: new graphql.GraphQLList(SublistType),
				resolve(parent, args) {
					return Sublist.findAll({ where: { ListId: parent.id } });
				}
			}
		})
	});

	const SublistType = new GraphQLObjectType({
		name: "Sublist",
		fields: () => ({
			id: { type: GraphQLInt },
			title: { type: GraphQLString },
			ListId: { type: GraphQLInt },
			list: {
				type: ListType,
				resolve(parent, args) {
					return List.findOne({ where: { id: parent.ListId } });
				}
			}
		})
	});

	return { ListType, SublistType };
}

module.exports = createTypes;