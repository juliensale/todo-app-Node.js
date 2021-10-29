const createListMutations = require('./list');
const createSublistMutations = require('./sublist');
const createTaskMutations = require('./task');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { createList, editList, deleteList } = createListMutations(User, List, ListType);
	const { createSublist, editSublist, deleteSublist } = createSublistMutations(User, List, Sublist, SublistType);
	const { createTask, editTask, deleteTask } = createTaskMutations(User, Sublist, Task, TaskType);

	return {
		createList, editList, deleteList,
		createSublist, editSublist, deleteSublist,
		createTask, editTask, deleteTask
	};
}

module.exports = createMutations;