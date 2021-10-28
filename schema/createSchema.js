const graphql = require('graphql');
const createQueries = require('./queries/createQueries');
const createMutations = require('./mutations/createMutations');
const { GraphQLObjectType, GraphQLSchema } = graphql;
const createTypes = require('./types');

const createSchema = (User, List, Sublist, Task, Subtask) => {

	const Types = createTypes(List, Sublist, Task, Subtask)

	const queryFields = createQueries(User, List, Sublist, Task, Subtask, Types);

	const mutationFields = createMutations(User, List, Sublist, Task, Subtask, Types);


	const RootQuery = new GraphQLObjectType({
		name: "RootQueryType",
		fields: queryFields
	})

	const Mutation = new GraphQLObjectType({
		name: 'Mutation',
		fields: mutationFields
	})


	return new GraphQLSchema({
		query: RootQuery,
		mutation: Mutation
	})

}


module.exports = createSchema