const graphql = require('graphql');
const createQueries = require('./queries/createQueries');
const { GraphQLObjectType, GraphQLSchema } = graphql;

const createSchema = (User, List, Sublist, Task, Subtask) => {

	const {
		list, lists,
		sublist, sublists,
		task, tasks,
		subtask, subtasks
	} = createQueries(User, List, Sublist, Task, Subtask);


	const RootQuery = new GraphQLObjectType({
		name: "RootQueryType",
		fields: {
			list, lists,
			sublist, sublists,
			task, tasks,
			subtask, subtasks
		}
	})

	const Mutation = new GraphQLObjectType({
		name: 'Mutation',
		fields: {
		}
	})


	return new GraphQLSchema({
		query: RootQuery
		// mutation: Mutation
	})

}


module.exports = createSchema