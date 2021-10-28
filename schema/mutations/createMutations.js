const createListMutations = require('./list');

const createMutations = (User, List, Sublist, Task, Subtask, Types) => {
	const { ListType, SublistType, TaskType, SubtaskType } = Types;

	const { createList, editList } = createListMutations(User, List, ListType);

	return {
		createList, editList
	};
}

module.exports = createMutations;