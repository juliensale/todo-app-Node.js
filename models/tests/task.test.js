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
		list: undefined,
		sublist: undefined,
		task: undefined,
		subtask1: undefined,
		subtask2: undefined,
		taskControl: undefined,
		subtaskControl: undefined
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

		instances.taskControl = await models.Task.create({
			title: "Control Task",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		}).catch(err => { throw err });

		instances.subtaskControl = await models.Subtask.create({
			title: "Control Subtask",
			UserId: instances.user.id,
			TaskId: instances.taskControl.id
		})
	})

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	})

	it("assures the `setCompleted` method is a function", () => {
		expect(instances.task.setCompleted).toBeInstanceOf(Function);
	})
	it("test the `setCompleted` method", async () => {
		// Checks initial state
		expect(instances.task.completed).toBe(false);

		// Checks running for `true`
		await instances.task.setCompleted(true).catch(err => { throw err });
		expect(instances.task.completed).toBe(true);

		// Checks running for `false`
		await instances.task.setCompleted(false).catch(err => { throw err });
		expect(instances.task.completed).toBe(false);
	})

	it("assures the `getSubtaskModel` method is a function", () => {
		expect(instances.task.getSubtaskModel).toBeInstanceOf(Function);
	});

	it("tests the `getSubtaskModel` method returns the Subtask model", () => {
		const SubtaskModel = instances.task.getSubtaskModel();
		expect(SubtaskModel).not.toBe(undefined);
		expect(SubtaskModel).toBe(models.Subtask);
	});

	it("assures the `complete` method is a function", () => {
		expect(instances.task.complete).toBeInstanceOf(Function);
	});

	it("should complete both the task and its subtasks", async () => {
		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(false);
		expect(instances.subtask2.completed).toBe(false);
		expect(instances.subtaskControl.completed).toBe(false);

		await instances.task.complete();
		await instances.subtask1.reload();
		await instances.subtask2.reload();
		await instances.subtaskControl.reload();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
		expect(instances.subtaskControl.completed).toBe(false);
	});

	it("assures the `uncomplete` method is a function", () => {
		expect(instances.task.uncomplete).toBeInstanceOf(Function);
	});

	it("should uncomplete both the task and its subtasks", async () => {
		instances.task.completed = true;
		await instances.task.save();
		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();
		instances.subtaskControl.completed = true;
		await instances.subtaskControl.save();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
		expect(instances.subtaskControl.completed).toBe(true);

		await instances.task.uncomplete();
		await instances.subtask1.reload();
		await instances.subtask2.reload();
		await instances.subtaskControl.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(false);
		expect(instances.subtask2.completed).toBe(false);
		expect(instances.subtaskControl.completed).toBe(true);
	});

	it("assures the `checkComplete` method is a function", () => {
		expect(instances.task.checkComplete).toBeInstanceOf(Function);
	})

	it("should not complete the task", async () => {
		instances.subtask1.completed = true;
		await instances.subtask1.save();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);

		await instances.task.checkComplete();
		instances.subtask1.reload();
		instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);
	})

	it("should complete the task", async () => {
		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);

		await instances.task.checkComplete();
		instances.subtask1.reload();
		instances.subtask2.reload();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
	})

	it("should not uncomplete the task", async () => {
		instances.task.completed = true;
		await instances.task.save();
		instances.subtask1.completed = true;
		await instances.subtask1.save();
		instances.subtask2.completed = true;
		await instances.subtask2.save();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);

		await instances.task.checkComplete();
		instances.subtask1.reload();
		instances.subtask2.reload();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(true);
	})

	it("should uncomplete the task", async () => {
		instances.task.completed = true;
		await instances.task.save();
		instances.subtask1.completed = true;
		await instances.subtask1.save();

		expect(instances.task.completed).toBe(true);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);

		await instances.task.checkComplete();
		instances.subtask1.reload();
		instances.subtask2.reload();

		expect(instances.task.completed).toBe(false);
		expect(instances.subtask1.completed).toBe(true);
		expect(instances.subtask2.completed).toBe(false);
	})
});