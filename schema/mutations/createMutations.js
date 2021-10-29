const createListMutations = require('./list');
const createSublistMutations = require('./sublist');
const createTaskMutations = require('./task');
const createSubtaskMutations = require('./subtask');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { createList, editList, deleteList } = createListMutations(User, List, ListType);
	const { createSublist, editSublist, deleteSublist } = createSublistMutations(User, List, Sublist, SublistType);
	const { createTask, editTask, deleteTask } = createTaskMutations(User, Sublist, Task, TaskType);
	const { createSubtask, editSubtask, deleteSubtask } = createSubtaskMutations(User, Task, Subtask, SubtaskType);

	return {
		createList, editList, deleteList,
		createSublist, editSublist, deleteSublist,
		createTask, editTask, deleteTask,
		createSubtask, editSubtask, deleteSubtask
	};
}

module.exports = createMutations;