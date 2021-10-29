const createListMutations = require('./list');
const createSublistMutations = require('./sublist');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { createList, editList, deleteList } = createListMutations(User, List, ListType);
	const { createSublist, editSublist, deleteSublist } = createSublistMutations(User, List, Sublist, SublistType);

	return {
		createList, editList, deleteList,
		createSublist, editSublist, deleteSublist
	};
}

module.exports = createMutations;