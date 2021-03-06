const { Sequelize } = require('sequelize');
const createUserModel = require('./models/createModel/createUser');
const createListModel = require('./models/createModel/createList');
const createSublistModel = require('./models/createModel/createSublist');
const createTaskModel = require('./models/createModel/createTask');
const createSubtaskModel = require('./models/createModel/createSubtask');
const { unlinkSync } = require('fs');

const wait = (time) => new Promise((res,) => {
	setTimeout(() => { res() }, time);
})
const getTestDatabase = () => new Sequelize({ dialect: 'sqlite', storage: './db-test.sqlite', logging: false });

const deleteTestDatabase = () => new Promise(async (res, rej) => {
	let error;
	for (let i = 0; i < 50; i++) {

		// Wait for the connection to close before deleting the file
		await wait(50)
			.then(() => {
				try {
					unlinkSync('./db-test.sqlite')
					res()
				} catch (err) {
					if (err.code == 'ENOENT') {
						res()
					}
					error = err
				}
			})
	}
	rej(error)
})

const removeTestDatabase = async (sequelize) => {
	let queryInterface = sequelize.getQueryInterface();
	queryInterface.sequelize.connectionManager.connections.default.close() // manually close the sqlite connection which sequelize.close() omits
	await deleteTestDatabase()
		.then(() => { global.isDBClean = true })
		.catch(err => { throw err })
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
		if (value !== undefined) {

			await value.reload()
				.then(async () => {
					return await value.destroy()
						.then(() => {
							instances[key] = undefined;
						})
						.catch(err => { throw err })
				})
				.catch(() => {
					instances[key] = undefined;
				})
		}
	}


	for (const [key, value] of Object.entries(models)) {
		if (value !== undefined) {
			models[key] = await value.sync().catch(err => { throw err });
		}
	}
}

module.exports = { getTestDatabase, removeTestDatabase, createModels, removeInstances, wait };