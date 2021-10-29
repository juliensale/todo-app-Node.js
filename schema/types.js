const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } = graphql;


const createTypes = (List, Sublist, Task, Subtask) => {

	const ListType = new GraphQLObjectType({
		name: "List",
		fields: () => ({
			id: { type: GraphQLInt },
			title: { type: GraphQLString },
			color: { type: GraphQLString },
			sublists: {
				type: new GraphQLList(SublistType),
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
			},
			tasks: {
				type: new GraphQLList(TaskType),
				resolve(parent, args) {
					return Task.findAll({ where: { SublistId: parent.id } })
				}
			}
		})
	});

	const TaskType = new GraphQLObjectType({
		name: "Task",
		fields: () => ({
			id: { type: GraphQLInt },
			title: { type: GraphQLString },
			SublistId: { type: GraphQLInt },
			sublist: {
				type: SublistType,
				resolve(parent, args) {
					return Sublist.findOne({ where: { id: parent.SublistId } });
				}
			},
			subtasks: {
				type: new GraphQLList(SubtaskType),
				resolve(parent, args) {
					return Subtask.findAll({ where: { TaskId: parent.id } })
				}
			}
		})
	})

	const SubtaskType = new GraphQLObjectType({
		name: "Subtask",
		fields: () => ({
			id: { type: GraphQLInt },
			title: { type: GraphQLString },
			TaskId: { type: GraphQLInt },
			task: {
				type: TaskType,
				resolve(parent, args) {
					return Task.findOne({ where: { id: parent.TaskId } })
				}
			}
		})
	})


	return { ListType, SublistType, TaskType, SubtaskType };
}

const DeleteType = new GraphQLObjectType({
	name: "Delete",
	fields: {
		message: { type: GraphQLString }
	}
})

module.exports = { createTypes, DeleteType };