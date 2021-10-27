const createTypes = require("../types");
const createListQueries = require("./list");
const createSublistQueries = require("./sublist");

const createQueries = (User, List, Sublist, Task, Subtask) => {
	const { ListType, SublistType } = createTypes(List, Sublist, Task, Subtask);

	const { list, lists } = createListQueries(User, List, ListType);
	const { sublist, sublists } = createSublistQueries(User, Sublist, SublistType);

	return {
		list, lists,
		sublist, sublists
	};
};

module.exports = createQueries;