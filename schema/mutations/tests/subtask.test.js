'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the Subtask mutations", () => {
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
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined,
		taskControl: undefined,
		subtaskControl: undefined
	}

	const username = "TestUser"
	const authToken = jwt.sign({ username: username }, process.env.TOKEN_KEY);

	const app = express();
	app.use(express.json());


	beforeAll(async () => {
		// Setting DB up
		sequelize = global.sequelize;

		// Creating the models
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models)
					.then(() => {
						const schema = createSchema(
							models.User,
							models.List,
							models.Sublist,
							models.Task,
							models.Subtask
						)
						app.use('/graphql', graphqlHTTP({
							schema
						}))
					})
					.catch(err => { throw err });
			})
			.catch((err) => { throw err });
	})

	beforeEach(async () => {
		// Creating default instances for each unit test
		instances.user = await models.User.create({
			username: username,
			password: "testpass123"
		}).catch(err => { throw err });

		instances.list = await models.List.create({
			title: "Test list",
			color: "#e123a4",
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
			SublisId: instances.sublist.id
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
			username: "UserControl",
			password: "testpass123"
		}).catch(err => { throw err });

		instances.listControl = await models.List.create({
			title: "List control",
			color: "#f153e5",
			UserId: instances.userControl.id
		}).catch(err => { throw err });

		instances.sublistControl = await models.Sublist.create({
			title: "Sublist control",
			UserId: instances.userControl.id,
			ListId: instances.listControl.id
		}).catch(err => { throw err });

		instances.taskControl = await models.Task.create({
			title: "Task control",
			UserId: instances.userControl.id,
			SublistId: instances.sublistControl.id
		})

		instances.subtaskControl = await models.Subtask.create({
			title: "Subtask control",
			UserId: instances.userControl.id,
			TaskId: instances.taskControl.id
		}).catch(err => { throw err });
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the createSubtask mutation", () => {
		const postData = (TaskId, title) => ({
			query: `mutation createSubtask($TaskId: Int!, $title: String!){
						createSubtask(TaskId: $TaskId, title: $title) {
							title
						}
					}`,
			variables: {
				TaskId: TaskId,
				title: title
			}
		});
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.task.id, "Test create subtask"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should create a new subtask for the authenticated user", (done) => {
			const title = "Test create subtask"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task.id, title))
				.expect(result => {
					const subtask = result.body.data.createSubtask;
					expect(subtask.title).toBe(title);
					models.Subtask.findOne({ where: { title: title } })
						.then(subtask => {
							expect(subtask).not.toBe(null);
							expect(subtask.UserId).toBe(instances.user.id);
							expect(subtask.TaskId).toBe(instances.task.id);
							subtask.destroy();
						});
				})
				.end(done);
		});

		it("should not create a new subtask if the ListId is invalid", (done) => {
			const title = "Test create subtask"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(549884, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid TaskId.')
					models.Subtask.findOne({ where: { title: title } })
						.then(subtask => {
							expect(subtask).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)
		})

		it("should not create a new subtask if the list does not belong to the authenticated user", (done) => {
			const title = "Test create subtask"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid TaskId.')
					models.Subtask.findOne({ where: { title: title } })
						.then(subtask => {
							expect(subtask).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)

		})
	});

	describe("Tests the editSubtask mutation", () => {
		const postData = (id, title) => {
			const query = `mutation editSubtask($id: Int!,$title: String){
						editSubtask(id: $id, title: $title) {
							title
						}
					}`
			var variables = {
				id: id
			}
			if (title) {
				variables['title'] = title;
			}

			return {
				query: query,
				variables: variables
			}
		};
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.subtask1.id, "Subtask edit test"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})


		it("should not find any subtask", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(89987, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No subtask found.");
				})
				.end(done);
		});

		it("should not let the authenticated user edit the subtask", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.subtaskControl.id, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No subtask found.");
				})
				.end(done);
		});

		it("should change the title of the subtask1", (done) => {
			const title = "Test edit";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.subtask1.id, title))
				.expect(result => {
					const subtask = result.body.data.editSubtask;
					expect(subtask.title).toBe(title);
				})
				.end(done);
		});

		it("should do nothing", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.subtask1.id))
				.expect(result => {
					const subtask = result.body.data.editSubtask;
					expect(subtask.title).toBe("Test subtask 1");
				})
				.end(done);
		});
	});

	describe("Tests the deleteSubtask mutation", () => {
		const postData = (id) => ({
			query: `mutation deleteSubtask($id: Int!){
						deleteSubtask(id: $id) {
							message
						}
					}`,
			variables: {
				id: id
			}

		});
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.subtask1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should not find any subtask", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(4898794))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No subtask found.")
				})
				.end(done);
		});

		it("should not allow the user to delete the subtask", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.subtaskControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No subtask found.")
					return models.Subtask.findOne({ where: { id: instances.subtaskControl.id } })
						.then(subtask => {
							expect(subtask).not.toBe(null);
						})
						.catch(err => { throw err })
				})
				.end(done);
		});

		it("should delete the subtask1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.subtask1.id))
				.expect(() => {
					return models.Subtask.findOne({ where: { id: instances.subtask1.id } })
						.then(subtask => {
							expect(subtask).toBe(null);
						})
						.catch(err => { throw err })
				})
				.expect(result => {
					expect(result.body.data.deleteSubtask.message).toBe('Subtask deleted.')
				})
				.end(done);
		})
	})

});