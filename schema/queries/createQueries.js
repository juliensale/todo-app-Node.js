const createTypes = require("../types");
const createListQueries = require("./list");
const createSublistQueries = require("./sublist");
const createTaskQueries = require("./task");

const createQueries = (User, List, Sublist, Task, Subtask) => {
	const { ListType, SublistType, TaskType } = createTypes(List, Sublist, Task, Subtask);

	const { list, lists } = createListQueries(User, List, ListType);
	const { sublist, sublists } = createSublistQueries(User, Sublist, SublistType);
	const { task, tasks } = createTaskQueries(User, Task, TaskType);

	return {
		list, lists,
		sublist, sublists,
		task, tasks
	};
};

module.exports = createQueries;