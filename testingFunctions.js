const { Sequelize } = require('sequelize');
const createUserModel = require('./models/createModel/createUser');
const createListModel = require('./models/createModel/createList');
const createSublistModel = require('./models/createModel/createSublist');
const createTaskModel = require('./models/createModel/createTask');
const createSubtaskModel = require('./models/createModel/createSubtask');
const { unlinkSync } = require('fs');

const getTestDatabase = () => new Sequelize({ dialect: 'sqlite', storage: './db-test.sqlite', logging: false });

const removeTestDatabase = (sequelize) => {
	let queryInterface = sequelize.getQueryInterface();
	queryInterface.sequelize.connectionManager.connections.default.close() // manually close the sqlite connection which sequelize.close() omits
	try {
		// Wait for the connection to close before deleting the file
		setTimeout(() => unlinkSync('./db-test.sqlite'), 300);
	} catch (error) { }
};

const createModels = async (sequelize, DataTypes, models) => {
	models.User = createUserModel(sequelize, DataTypes);
	models.List = createListModel(sequelize, DataTypes, models.User);
	models.Sublist = createSublistModel(sequelize, DataTypes, models.User, models.List);
	models.Task = createTaskModel(sequelize, DataTypes, models.User, models.Sublist);
	models.Subtask = createSubtaskModel(sequelize, DataTypes, models.User, models.Task);
	await models.User.sync().catch(err => { throw err });
	await models.List.sync().catch(err => { throw err });
	await models.Sublist.sync().catch(err => { throw err });
	await models.Task.sync().catch(err => { throw err });
	await models.Subtask.sync().catch(err => { throw err });

};

const removeInstances = async (instances, models) => {
	for (const [key, value] of Object.entries(instances)) {
		await value.destroy()
			.then(() => {
				instances[key] = undefined
			})
			.catch(err => { throw err })
	}


	for (const [key, value] of Object.entries(models)) {
		if (value !== undefined) {
			models[key] = await value.sync().catch(err => { throw err });
		}
	}
}

module.exports = { getTestDatabase, removeTestDatabase, createModels, removeInstances };