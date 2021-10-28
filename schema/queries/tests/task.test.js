'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the Task queries", () => {
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
			color: "#fe57a2",
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
		})

		instances.task2 = await models.Task.create({
			title: "Test task 2",
			UserId: instances.user.id,
			SublistId: instances.sublist.id
		})

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
		})

		instances.taskControl = await models.Task.create({
			title: "Test task control",
			UserId: instances.userControl.id,
			SublistId: instances.sublistControl.id
		})
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'tasks' query", () => {

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send({
					query: `
				{
					tasks {
						title
					}
				}
				`
				})
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		});

		it("should return task1 and task2, but not the control task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send({
					query: `
				{
					tasks {
						title
					}
				}	
				`
				})
				.expect(result => {
					const tasks = result.body.data.tasks
					expect(tasks.length).toBe(2)
					expect(tasks[0].title).toBe(instances.task1.title)
					expect(tasks[1].title).toBe(instances.task2.title)
				})
				.end(done);

		})
	})

	describe("Tests the 'task' query", () => {
		const postData = (id) => ({
			query: `query task($id: Int!){
				task(id: $id) {
					title
				}
			} `,
			variables: {
				id: id
			}
		});

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.task1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.");
				})
				.end(done);
		});

		// incorrect id
		it("should not find any task", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(56487987))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.");
				})
				.end(done);
		});

		// id corresponds to someone else's list
		it("should not allow access to a sublist that does not belong to the authenticated user", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.taskControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No task found.");
				})
				.end(done);
		});

		// correct id
		it("should find task1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.task1.id))
				.expect(result => {
					const task = result.body.data.task;
					expect(task.title).toBe(instances.task1.title);
				})
				.end(done);
		});


	})
});