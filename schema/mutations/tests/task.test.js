'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the Task mutations", () => {
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
		task1: undefined,
		subtask11: undefined,
		subtask12: undefined,
		task2: undefined,
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined,
		taskControl: undefined
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

		instances.task1 = await models.Task.create({
			title: "Test task 1",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		}).catch(err => { throw err });

		instances.subtask11 = await models.Subtask.create({
			title: "Test subtask 1.1",
			UserId: instances.user.id,
			TaskId: instances.task1.id
		}).catch(err => { throw err });

		instances.subtask12 = await models.Subtask.create({
			title: "Test subtask 1.2",
			UserId: instances.user.id,
			TaskId: instances.task1.id
		}).catch(err => { throw err });

		instances.task2 = await models.Task.create({
			title: "Test task 2",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
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
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the createTask mutation", () => {
		const postData = (SublistId, title) => ({
			query: `mutation createTask($SublistId: Int!, $title: String!){
						createTask(SublistId: $SublistId, title: $title) {
							title
						}
					}`,
			variables: {
				SublistId: SublistId,
				title: title
			}
		});
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.sublist.id, "Test create task"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should create a new task for the authenticated user", (done) => {
			const title = "Test create task"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublist.id, title))
				.expect(result => {
					const task = result.body.data.createTask;
					expect(task.title).toBe(title);
					models.Task.findOne({ where: { title: title } })
						.then(task => {
							expect(task).not.toBe(null);
							expect(task.UserId).toBe(instances.user.id);
							expect(task.SublistId).toBe(instances.sublist.id);
							task.destroy();
						});
				})
				.end(done);
		});

		it("should not create a new task if the ListId is invalid", (done) => {
			const title = "Test create task"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(549884, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid SublistId.')
					models.Task.findOne({ where: { title: title } })
						.then(task => {
							expect(task).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)
		})

		it("should not create a new task if the list does not belong to the authenticated user", (done) => {
			const title = "Test create task"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublistControl.id, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid SublistId.')
					models.Task.findOne({ where: { title: title } })
						.then(task => {
							expect(task).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)

		})
	});

	describe("Tests the editTask mutation", () => {
		const postData = (id, title) => {
			const query = `mutation editTask($id: Int!,$title: String){
						editTask(id: $id, title: $title) {
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
				.send(postData(instances.task1.id, "Task edit test"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})


		it("should not find any task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(89987, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.");
				})
				.end(done);
		});

		it("should not let the authenticated user edit the task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.");
				})
				.end(done);
		});

		it("should change the title of the task1", (done) => {
			const title = "Test edit";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id, title))
				.expect(result => {
					const task = result.body.data.editTask;
					expect(task.title).toBe(title);
				})
				.end(done);
		});

		it("should do nothing", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id))
				.expect(result => {
					const task = result.body.data.editTask;
					expect(task.title).toBe("Test task 1");
				})
				.end(done);
		});
	});

	describe("Tests the deleteTask mutation", () => {
		const postData = (id) => ({
			query: `mutation deleteTask($id: Int!){
						deleteTask(id: $id) {
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
				.send(postData(instances.task1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should not find any task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(4898794))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
				})
				.end(done);
		});

		it("should not allow the user to delete the task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
					return models.Task.findOne({ where: { id: instances.taskControl.id } })
						.then(task => {
							expect(task).not.toBe(null);
						})
						.catch(err => { throw err })
				})
				.end(done);
		});

		it("should delete the task1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id))
				.expect(() => {
					return models.Task.findOne({ where: { id: instances.task1.id } })
						.then(task => {
							expect(task).toBe(null);
						})
						.catch(err => { throw err })
				})
				.expect(result => {
					expect(result.body.data.deleteTask.message).toBe('Task deleted.')
				})
				.end(done);
		})
	});

	describe("Tests the completeTask mutation", () => {
		const postData = (id) => ({
			query: `mutation completeTask($id: Int!){
						completeTask(id: $id) {
							title
							completed
						}
					}`,
			variables: {
				id: id
			}

		});
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.task1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done);
		});

		it("should not find any task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(46578984))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
				})
				.end(done);
		});

		it("should not allow the user to complete the task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
				})
				.end(done);
		})

		it("should complete the task and both of its subtasks", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id))
				.expect(result => {
					const task = result.body.data.completeTask;
					expect(task.title).toBe(instances.task1.title);
					expect(task.completed).toBe(true);

					instances.subtask11.reload()
						.then(() => {
							expect(instances.subtask11.completed).toBe(true)
						})
						.catch(err => { throw err });
					instances.subtask12.reload()
						.then(() => {
							expect(instances.subtask12.completed).toBe(true)
						})
						.catch(err => { throw err });
				})
				.end(done);
		})

	})

	describe("Tests the uncompleteTask mutation", () => {
		const postData = (id) => ({
			query: `mutation uncompleteTask($id: Int!){
						uncompleteTask(id: $id) {
							title
							completed
						}
					}`,
			variables: {
				id: id
			}

		});

		beforeEach(async () => {
			instances.task1.completed = true;
			await instances.task1.save()
				.catch(err => { throw err })
			instances.subtask11.completed = true;
			await instances.subtask11.save()
				.catch(err => { throw err })
			instances.subtask12.completed = true;
			await instances.subtask12.save()
				.catch(err => { throw err })
		})

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.task1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done);
		});

		it("should not find any task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(46578984))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
				})
				.end(done);
		});

		it("should not allow the user to complete the task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.")
				})
				.end(done);
		})

		it("should complete the task and both of its subtasks", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id))
				.expect(result => {
					const task = result.body.data.uncompleteTask;
					expect(task.title).toBe(instances.task1.title);
					expect(task.completed).toBe(false);

					instances.subtask11.reload()
						.then(() => {
							expect(instances.subtask11.completed).toBe(false)
						})
						.catch(err => { throw err });
					instances.subtask12.reload()
						.then(() => {
							expect(instances.subtask12.completed).toBe(false)
						})
						.catch(err => { throw err });
				})
				.end(done);
		});

	});

});