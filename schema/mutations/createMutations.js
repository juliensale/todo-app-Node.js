const createListMutations = require('./list');
const createSublistMutations = require('./sublist');
const createTaskMutations = require('./task');
const createSubtaskMutations = require('./subtask');
const createUserMutations = require('./user');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { register, login } = createUserMutations(User);
	const { createList, editList, deleteList } = createListMutations(User, List, ListType);
	const { createSublist, editSublist, deleteSublist } = createSublistMutations(User, List, Sublist, SublistType);
	const { createTask, editTask, deleteTask, completeTask, uncompleteTask } = createTaskMutations(User, Sublist, Task, TaskType);
	const { createSubtask, editSubtask, deleteSubtask, completeSubtask, uncompleteSubtask } = createSubtaskMutations(User, Task, Subtask, SubtaskType);

	return {
		register, login,
		createList, editList, deleteList,
		createSublist, editSublist, deleteSublist,
		createTask, editTask, deleteTask, completeTask, uncompleteTask,
		createSubtask, editSubtask, deleteSubtask, completeSubtask, uncompleteSubtask
	};
}

module.exports = createMutations;