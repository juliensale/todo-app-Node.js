const { createUserModel } = require('../user');
const { createListModel } = require('../list');
const { createSublistModel } = require('../sublist');
const { createTaskModel } = require('../task');
const { Sequelize, DataTypes } = require('sequelize');

// Setting DB up
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './db-test.sqlite',
	logging: false
});

describe("Testing the Task model", () => {
	let User;
	let user;
	let List;
	let list;
	let Sublist;
	let sublist;
	let Task;
	let task;
	beforeAll(() => {
		User = createUserModel(sequelize, DataTypes);
		List = createListModel(sequelize, DataTypes, User);
		Sublist = createSublistModel(sequelize, DataTypes, User, List);
		Task = createTaskModel(sequelize, DataTypes, User, Sublist);
		User.sync();
		List.sync();
		Sublist.sync();
		Task.sync();
	})

	beforeEach(async () => {
		user = await User.create({
			username: "TestUser",
			password: "testpass123"
		});
		list = await List.create({
			title: "Test list",
			color: "#ffffff",
			UserId: user.id
		})
		sublist = await Sublist.create({
			title: "Test sublist",
			UserId: user.id,
			ListId: list.id
		})
		task = await Task.create({
			title: "Test task",
			UserId: user.id,
			SublistId: sublist.id
		})
	})

	afterEach(async () => {
		await user.destroy();
		await list.destroy();
		await sublist.destroy();
		await task.destroy();
		User.sync();
		List.sync();
		Sublist.sync();
		Task.sync();
	})

	it("assures the `setCompleted` method is a function", () => {
		expect(task.setCompleted).toBeInstanceOf(Function);
	})
	it("test the `setCompleted` method", async () => {
		expect(task.completed).toBe(false);
		await task.setCompleted(true);
		expect(task.completed).toBe(true);
		await task.setCompleted(false);
		expect(task.completed).toBe(false);
	})
});