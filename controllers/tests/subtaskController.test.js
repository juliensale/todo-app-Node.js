'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createSubtaskController = require('../createController/createSubtaskController');
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
		task: undefined,
		subtask1: undefined,
		subtask2: undefined,
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined,
		taskControl: undefined,
		subtaskControl: undefined
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
						const subtaskController = createSubtaskController(models.User, models.Subtask);
						app.get('/subtask', subtaskController.subtask_get);
						app.get('/subtask/:id', subtaskController.subtask_details_get);
						app.post('/subtask', subtaskController.subtask_create);
						app.patch('/subtask/:id', subtaskController.subtask_update);
						app.delete('/subtask/:id', subtaskController.subtask_delete);
						app.post('/subtask/:id/complete', subtaskController.subtask_complete);
						app.post('/subtask/:id/uncomplete', subtaskController.subtask_uncomplete);
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

		instances.subtaskControl = await models.Subtask.create({
			title: "subtask control",
			UserId: instances.userControl.id,
			TaskId: instances.taskControl.id
		}).catch(err => { throw err });

	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'subtask_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get('/subtask')
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should return the two subtasks but not the control subtask", (done) => {
			request(app)
				.get('/subtask')
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.length).toBe(2)
					expect(result.body[0].title).toBe(instances.subtask1.title)
					expect(result.body[1].title).toBe(instances.subtask2.title)
				})
				.expect(200, done)
		})
	})

	describe("Tests the `subtask_details_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get(`/subtask/${instances.subtask1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should fail correctly when the id is incorrect", (done) => {
			request(app)
				.get('/subtask/invalidid')
				.set('AuthenticationToken', authToken)
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should not be able to find an existing subtask", (done) => {
			request(app)
				.get('/subtask/942349')
				.set('AuthenticationToken', authToken)
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should retrieve the subtask", (done) => {
			request(app)
				.get(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.title).toBe(instances.subtask1.title);
				})
				.expect(200, done);
		});

	})

	describe("Tests the 'subtask_create' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.post("/subtask")
				.send({
					title: "ShouldNotExist",
					TaskId: instances.task.id
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Subtask.findOne({ where: { title: "ShouldNotExist" } })
						.then(subtask => {
							expect(subtask).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should create a subtask linked to the sublist", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test subtask",
					TaskId: instances.task.id
				})
				.expect(result => {
					const subtask = result.body;
					expect(subtask.title).toBe("Test subtask");
					expect(subtask.UserId).toBe(instances.user.id);
					expect(subtask.TaskId).toBe(instances.task.id);
				})
				.expect(201, done);
		})

		it("should not accept a non-string title", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.send({
					title: 4,
					TaskId: instances.task.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should not accept an invalid TaskId", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test task",
					TaskId: 545648551
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the title", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.send({
					TaskId: instances.task.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the TaskId", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test subtask"
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.post('/subtask')
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});

	})

	describe("Tests the 'subtask_update' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.patch(`/subtask/${instances.subtask1.id}`)
				.send({
					title: "ShouldNotExist"
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Subtask.findOne({ where: { title: "ShouldNotExist" } })
						.then(subtask => {
							expect(subtask).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should not find a subtask", (done) => {
			request(app)
				.patch('/subtask/wrongid')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test"
				})
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should change the subtask title", (done) => {
			request(app)
				.patch(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update"
				})
				.expect(result => {
					const subtask = result.body;
					expect(subtask.title).toBe("Test update");
				})
				.expect(200, done);
		});

		it("should not change the TaskId", (done) => {
			request(app)
				.patch(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update",
					TaskId: instances.taskControl.id
				})
				.expect(result => {
					const subtask = result.body;
					expect(subtask.title).toBe("Test update")
					expect(subtask.TaskId).toBe(instances.task.id);
				})
				.expect(200, done);
		});

		it("should not accept a non-string title", (done) => {
			request(app)
				.patch(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: 5
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.patch(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});
	});

	describe("Tests the 'subtask_delete' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.delete(`/subtask/${instances.subtask1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should not find the subtask", (done) => {
			request(app)
				.delete('/subtask/wrongid')
				.set('AuthenticationToken', authToken)
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should delete the task", (done) => {
			request(app)
				.delete(`/subtask/${instances.subtask1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(204)
				.end(done);
		})
	})

	describe("Tests the 'subtask_complete' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			expect(instances.subtask1.completed).toBe(false);

			request(app)
				.post(`/subtask/${instances.subtask1.id}/complete`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await instances.subtask1.reload()
						.then(() => {
							expect(instances.subtask1.completed).toBe(false);
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should not find the subtask", (done) => {
			request(app)
				.post('/subtask/65498494/complete')
				.set('AuthenticationToken', authToken)
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should complete the subtask but not the mother task", (done) => {
			expect(instances.task.completed).toBe(false);
			expect(instances.subtask1.completed).toBe(false)
			expect(instances.subtask2.completed).toBe(false)

			request(app)
				.post(`/subtask/${instances.subtask1.id}/complete`)
				.set('AuthenticationToken', authToken)
				.expect(async () => {
					await instances.task.reload()
						.then(() => {
							expect(instances.task.completed).toBe(false);
						})
						.catch(err => { throw err });
					await instances.subtask1.reload()
						.then(() => {
							expect(instances.subtask1.completed).toBe(true);
						})
						.catch(err => { throw err });
					await instances.subtask2.reload()
						.then(() => {
							expect(instances.subtask2.completed).toBe(false);
						})
						.catch(err => { throw err });
				})
				.expect(200, done);
		});

		it("should complete the subtask and the mother task", (done) => {
			instances.subtask2.completed = true;
			instances.subtask2.save()
				.then(() => {

					expect(instances.task.completed).toBe(false);
					expect(instances.subtask1.completed).toBe(false);
					expect(instances.subtask2.completed).toBe(true);

					request(app)
						.post(`/subtask/${instances.subtask1.id}/complete`)
						.set('AuthenticationToken', authToken)
						.expect(async () => {
							await instances.task.reload()
								.then(() => {
									expect(instances.task.completed).toBe(true);
								})
								.catch(err => { throw err });
							await instances.subtask1.reload()
								.then(() => {
									expect(instances.subtask1.completed).toBe(true);
								})
								.catch(err => { throw err });
							await instances.subtask2.reload()
								.then(() => {
									expect(instances.subtask2.completed).toBe(true);
								})
								.catch(err => { throw err });
						})
						.expect(200, done);
				})
				.catch(err => { throw err });
		});
	});

	describe("Tests the 'subtask_uncomplete' controller", () => {
		beforeEach(async () => {
			instances.task.completed = true;
			await instances.task.save();
			instances.subtask1.completed = true;
			await instances.subtask1.save();
			instances.subtask2.completed = true;
			await instances.subtask2.save();
		})

		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			expect(instances.subtask1.completed).toBe(true);

			request(app)
				.post(`/subtask/${instances.subtask1.id}/uncomplete`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await instances.subtask1.reload()
						.then(() => {
							expect(instances.subtask1.completed).toBe(true);
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should not find the subtask", (done) => {
			request(app)
				.post('/subtask/65498494/uncomplete')
				.set('AuthenticationToken', authToken)
				.expect('No subtask found.')
				.expect(404, done);
		});

		it("should complete the subtask but not the mother task", (done) => {
			expect(instances.task.completed).toBe(true);
			expect(instances.subtask1.completed).toBe(true);
			expect(instances.subtask2.completed).toBe(true);

			request(app)
				.post(`/subtask/${instances.subtask1.id}/uncomplete`)
				.set('AuthenticationToken', authToken)
				.expect(async () => {
					await instances.task.reload()
						.then(() => {
							expect(instances.task.completed).toBe(false);
						})
						.catch(err => { throw err });
					await instances.subtask1.reload()
						.then(() => {
							expect(instances.subtask1.completed).toBe(false);
						})
						.catch(err => { throw err });
					await instances.subtask2.reload()
						.then(() => {
							expect(instances.subtask2.completed).toBe(true);
						})
						.catch(err => { throw err });
				})
				.expect(200, done);
		});
	});
});