const createListMutations = require('./list');
const createSublistMutations = require('./sublist');
const createTaskMutations = require('./task');
const createSubtaskMutations = require('./subtask');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { createList, editList, deleteList } = createListMutations(User, List, ListType);
	const { createSublist, editSublist, deleteSublist } = createSublistMutations(User, List, Sublist, SublistType);
	const { createTask, editTask, deleteTask, completeTask, uncompleteTask } = createTaskMutations(User, Sublist, Task, TaskType);
	const { createSubtask, editSubtask, deleteSubtask, completeSubtask } = createSubtaskMutations(User, Task, Subtask, SubtaskType);

	return {
		createList, editList, deleteList,
		createSublist, editSublist, deleteSublist,
		createTask, editTask, deleteTask, completeTask, uncompleteTask,
		createSubtask, editSubtask, deleteSubtask, completeSubtask
	};
}

module.exports = createMutations;