const { createUserModel } = require('./models/user');
const { createListModel } = require('./models/list');
const { createSublistModel } = require('./models/sublist');
const { createTaskModel } = require('./models/task');
const { createSubtaskModel } = require('./models/subtask');

const createModels = async (sequelize, DataTypes, models) => {
	models.User = createUserModel(sequelize, DataTypes);
	models.List = createListModel(sequelize, DataTypes, models.User);
	models.Sublist = createSublistModel(sequelize, DataTypes, models.User, models.List);
	models.Task = createTaskModel(sequelize, DataTypes, models.User, models.Sublist);
	models.Subtask = createTaskModel(sequelize, DataTypes, models.User, models.Task);
	await models.User.sync();
	await models.List.sync();
	await models.Sublist.sync();
	await models.Task.sync();
	await models.Subtask.sync();
};

const removeInstances = async (instances, models) => {
	for (const [key, value] of Object.entries(instances)) {
		await value.destroy()
			.then(() => {
				instances[key] = undefined
			})
			.catch(err => { throw err })
	}


	await models.User.sync();
	await models.List.sync();
	await models.Sublist.sync();
	await models.Task.sync();
	await models.Subtask.sync();
}

module.exports = { createModels, removeInstances };