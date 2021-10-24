'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createTaskController = require('../createController/createTaskController');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();


describe("Tests the user controller", () => {
	let sequelize;
	let models = {
		User: undefined,
		List: undefined,
		Sublist: undefined,
		Task: undefined,
		Subtask: undefined,
	};
	let instances = {
		user: undefined,
		list: undefined,
		sublist: undefined,
		task1: undefined,
		task2: undefined,
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined,
		taskControl: undefined
	};

	let username = 'TestUser';
	let authToken = jwt.sign({ username: username }, process.env.TOKEN_KEY);

	const app = express();
	app.use(express.json());

	beforeAll(async () => {
		sequelize = global.sequelize;
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models)
					.then(() => {
						const taskController = createTaskController(models.User, models.Task);
						app.get('/task', taskController.task_get);
						app.get('/task/:id', taskController.task_details_get);
						app.post('/task', taskController.task_create);
						app.patch('/task/:id', taskController.task_update);
						app.delete('/task/:id', taskController.task_delete);
					})
					.catch(err => { throw err });
			})
			.catch(err => { throw err });
	});

	beforeEach(async () => {
		instances.user = await models.User.create({
			username: username,
			password: 'testpass123'
		}).catch(err => { throw err });

		instances.list = await models.List.create({
			title: "Test list",
			UserId: instances.user.id
		}).catch(err => { throw err });

		instances.sublist = await models.Sublist.create({
			title: "Test sublist",
			UserId: instances.user.id,
			ListId: instances.list.id
		}).catch(err => { throw err });

		instances.task1 = await models.Task.create({
			title: "Test task 1",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		}).catch(err => { throw err });

		instances.task2 = await models.Task.create({
			title: "Test task 2",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		}).catch(err => { throw err });

		instances.userControl = await models.User.create({
			username: 'UserControl',
			password: 'testpass123'
		}).catch(err => { throw err });

		instances.listControl = await models.List.create({
			title: "List control",
			color: "#45efa8",
			UserId: instances.userControl.id
		}).catch(err => { throw err });

		instances.sublistControl = await models.Sublist.create({
			title: "Sublist control",
			UserId: instances.userControl.id,
			ListId: instances.listControl.id
		}).catch(err => { throw err });

		instances.taskControl = await models.Task.create({
			title: "task control",
			UserId: instances.userControl.id,
			SublistId: instances.sublistControl.id
		}).catch(err => { throw err });

	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'task_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get('/task')
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should return the two tasks but not the control task", (done) => {
			request(app)
				.get('/task')
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.length).toBe(2)
					expect(result.body[0].title).toBe(instances.task1.title)
					expect(result.body[1].title).toBe(instances.task2.title)
				})
				.expect(200, done)
		})
	})

	describe("Tests the `task_details_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get(`/task/${instances.task1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should fail correctly when the id is incorrect", (done) => {
			request(app)
				.get('/task/invalidid')
				.set('AuthenticationToken', authToken)
				.expect('No task found.')
				.expect(404, done);
		});

		it("should not be able to find an existing task", (done) => {
			request(app)
				.get('/task/942349')
				.set('AuthenticationToken', authToken)
				.expect('No task found.')
				.expect(404, done);
		});

		it("should retrieve the task", (done) => {
			request(app)
				.get(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.title).toBe(instances.task1.title);
				})
				.expect(200, done);
		});

	})

	describe("Tests the 'task_create' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.post("/task")
				.send({
					title: "ShouldNotExist",
					SublistId: instances.sublist.id
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Task.findOne({ where: { title: "ShouldNotExist" } })
						.then(task => {
							expect(task).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should create a task linked to the sublist", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test task",
					SublistId: instances.sublist.id
				})
				.expect(result => {
					const task = result.body;
					expect(task.title).toBe("Test task");
					expect(task.UserId).toBe(instances.user.id);
					expect(task.SublistId).toBe(instances.sublist.id);
				})
				.expect(201, done);
		})

		it("should not accept a non-string title", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.send({
					title: 4,
					SublistId: instances.sublist.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should not accept an invalid sublist id", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test task",
					SublistId: 545648551
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the title", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.send({
					SublistId: instances.sublist.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the SublistId", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test task"
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.post('/task')
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});

	})

	describe("Tests the 'task_update' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.patch(`/task/${instances.task1.id}`)
				.send({
					title: "ShouldNotExist"
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Task.findOne({ where: { title: "ShouldNotExist" } })
						.then(task => {
							expect(task).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should not find a task", (done) => {
			request(app)
				.patch('/task/wrongid')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test"
				})
				.expect('No task found.')
				.expect(404, done);
		});

		it("should change the task title", (done) => {
			request(app)
				.patch(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update"
				})
				.expect(result => {
					const task = result.body;
					expect(task.title).toBe("Test update");
				})
				.expect(200, done);
		});

		it("should not change the SublistId", (done) => {
			request(app)
				.patch(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update",
					SublistId: instances.sublistControl.id
				})
				.expect(result => {
					const task = result.body;
					expect(task.title).toBe("Test update")
					expect(task.SublistId).toBe(instances.sublist.id);
				})
				.expect(200, done);
		});

		it("should not accept a non-string title", (done) => {
			request(app)
				.patch(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: 5
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.patch(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});
	});

	describe("Tests the 'task_delete' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.delete(`/task/${instances.task1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should not find the task", (done) => {
			request(app)
				.delete('/task/wrongid')
				.set('AuthenticationToken', authToken)
				.expect('No task found.')
				.expect(404, done);
		});

		it("should delete the task", (done) => {
			request(app)
				.delete(`/task/${instances.task1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(204)
				.end(done);
		})
	})

});