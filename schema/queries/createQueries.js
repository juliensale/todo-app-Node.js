const createListQueries = require("./list");
const createSublistQueries = require("./sublist");
const createSubtaskQueries = require("./subtask");
const createTaskQueries = require("./task");

const createQueries = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { list, lists } = createListQueries(User, List, ListType);
	const { sublist, sublists } = createSublistQueries(User, Sublist, SublistType);
	const { task, tasks } = createTaskQueries(User, Task, TaskType);
	const { subtask, subtasks } = createSubtaskQueries(User, Subtask, SubtaskType)

	return {
		list, lists,
		sublist, sublists,
		task, tasks,
		subtask, subtasks
	};
};

module.exports = createQueries;