'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');


describe("Testing the Task model", () => {
	// Defining global objects
	let sequelize;
	let models = {
		User: undefined,
		List: undefined,
		Sublist: undefined,
		Task: undefined,
		Subtask: undefined
	}
	let instances = {
		user: undefined,
		list: undefined
	}
	beforeAll(async () => {
		// Setting DB up
		sequelize = global.sequelize;

		// Creating the models
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models).catch(err => { throw err });
			})
			.catch((err) => { throw err });
	})

	beforeEach(async () => {
		// Creating default instances for each unit test
		instances.user = await models.User.create({
			username: "TestUser",
			password: "testpass123"
		}).catch(err => { throw err })

		instances.list = await models.List.create({
			title: "Test list",
			color: "#ffffff",
			UserId: instances.user.id
		}).catch(err => { throw err });

	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	it("should delete the list in cascade", async () => {
		await instances.user.destroy()
			.catch(err => { throw err });
		await models.List.findOne({ where: { id: instances.list.id } })
			.then(list => {
				expect(list).toBe(null);
			})
			.catch(err => { throw err })
	})

});