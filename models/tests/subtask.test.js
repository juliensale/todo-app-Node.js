'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');


describe("Testing the Subktask model", () => {
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
		list: undefined,
		sublist: undefined,
		task: undefined,
		subtask1: undefined,
		subtask2: undefined
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

		instances.sublist = await models.Sublist.create({
			title: "Test sublist",
			UserId: instances.user.id,
			ListId: instances.list.id
		}).catch(err => { throw err });

		instances.task = await models.Task.create({
			title: "Test task",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		}).catch(err => { throw err });

		instances.subtask1 = await models.Subtask.create({
			title: "Test subtask 1",
			UserId: instances.user.id,
			TaskId: instances.task.id
		}).catch(err => { throw err });

		instances.subtask2 = await models.Subtask.create({
			title: "Test subtask 2",
			UserId: instances.user.id,
			TaskId: instances.task.id
		}).catch(err => { throw err });
	})

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	})


	it("assures the `setCompleted` method is a function", () => {
		expect(instances.subtask1.setCompleted).toBeInstanceOf(Function);
	})
	it("test the `setCompleted` method", async () => {
		// Checks initial state
		expect(instances.subtask1.completed).toBe(false);

		// Checks running for `true`
		await instances.subtask1.setCompleted(true).catch(err => { throw err });
		expect(instances.subtask1.completed).toBe(true);

		// Checks running for `false`
		await instances.subtask1.setCompleted(false).catch(err => { throw err });
		expect(instances.subtask1.completed).toBe(false);
	})

	it("assures the `complete` method is a function", () => {
		expect(instances.subtask1.complete).toBeInstanceOf(Function);
	});

	it("should complete the subtask but not complete the mother task", async () => {
		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(false);
		expect(instances.subtask2.completed).toBe(false);

		await instances.subtask1.complete();
		await instances.task.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);
	});
	it("should complete the mother task", async () => {
		instances.subtask2.completed = true;
		await instances.subtask2.save();
		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(false);
		expect(instances.subtask2.completed).toBe(true);

		await instances.subtask1.complete();
		await instances.task.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
	})

	it("assures the `uncomplete` method is a function", () => {
		expect(instances.subtask1.uncomplete).toBeInstanceOf(Function);
	});

	it("should uncomplete both the subtask and its mother task", async () => {
		instances.task.completed = true;
		await instances.task.save();
		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);

		await instances.subtask1.uncomplete();
		await instances.task.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(false);
		expect(instances.subtask2.completed).toBe(true);
	})

	it("should uncomplete the mother task on subtask creation", async () => {
		instances.task.completed = true;
		await instances.task.save();
		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);

		const newSubtask = await models.Subtask.create({
			title: "New subtask",
			UserId: instances.user.id,
			TaskId: instances.task.id
		})

		await instances.task.reload();
		await instances.subtask1.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);

		await newSubtask.destroy();
	})

	it("should call the `checkComplete` method of the mother task on subtask deletion", async () => {
		const newSubtask = await models.Subtask.create({
			title: "New subtask",
			UserId: instances.user.id,
			TaskId: instances.task.id
		})

		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
		expect(newSubtask.completed).toBe(false);

		await newSubtask.destroy();

		await instances.task.reload();
		await instances.subtask1.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
	});

	it("should not complete the mother task on every deletion", async () => {
		const newSubtask = await models.Subtask.create({
			title: "New subtask",
			UserId: instances.user.id,
			TaskId: instances.task.id
		})

		instances.subtask1.completed = true;
		await instances.subtask1.save();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);
		expect(newSubtask.completed).toBe(false);

		await newSubtask.destroy();

		await instances.task.reload();
		await instances.subtask1.reload();
		await instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);
	})

	it("should delete the subtask in cascade", async () => {
		await instances.task.destroy().catch(err => { throw err });
		await models.Subtask.findOne({ where: { id: instances.subtask1.id } })
			.then(subtask => {
				expect(subtask).toBe(null);
			})
			.catch(err => { throw err })

	});
});