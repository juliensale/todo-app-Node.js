'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the List queries", () => {
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
		list1: undefined,
		list2: undefined,
		userControl: undefined,
		listControl: undefined
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

		instances.list1 = await models.List.create({
			title: "Test list 1",
			color: "#ffffff",
			UserId: instances.user.id
		}).catch(err => { throw err });

		instances.list2 = await models.List.create({
			title: "Test list 2",
			color: "#ffffff",
			UserId: instances.user.id
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
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the createList mutation", () => {
		const postData = (title, color) => {
			const query = `mutation createList($title: String!, $color: String){
						createList(title: $title, color: $color) {
							title
							color
						}
					}`
			var variables = {
				title: title
			}

			if (color) {
				variables['color'] = color
			}

			return {
				query: query,
				variables: variables
			}
		};
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData("Test create list", "#121212"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should create a new list for the authenticated user with the default color", (done) => {
			const title = "Test create list"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(title))
				.expect(result => {
					const list = result.body.data.createList;
					expect(list.title).toBe(title);
					models.List.findOne({ where: { title: title } })
						.then(list => {
							expect(list).not.toBe(null);
							expect(list.UserId).toBe(instances.user.id);
							list.destroy();
						});
				})
				.end(done);
		});

		it("should create a new list for the authenticated user with a specified color", (done) => {
			const title = "Test create list";
			const color = "#1e235e";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(title, color))
				.expect(result => {
					const list = result.body.data.createList;
					expect(list.title).toBe(title);
					expect(list.color).toBe(color);
					models.List.findOne({ where: { title: title } })
						.then(list => {
							expect(list).not.toBe(null);
							expect(list.UserId).toBe(instances.user.id);
							expect(list.color).toBe(color);
							list.destroy();
						});
				})
				.end(done);
		});
	});

	describe("Tests the editList mutation", () => {
		const postData = (id, title, color) => {
			const query = `mutation editList($id: Int!,$title: String, $color: String){
						editList(id: $id, title: $title, color: $color) {
							title
							color
						}
					}`
			var variables = {
				id: id
			}
			if (title) {
				variables['title'] = title;
			}
			if (color) {
				variables['color'] = color;
			}

			return {
				query: query,
				variables: variables
			}
		};
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.list1.id, "Test create list", "#121212"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})


		it("should not find any list", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(899879847, "Test edit", "#154ea1"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No list found.");
				})
				.end(done);
		});

		it("should not let the authenticated user edit the list", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.listControl.id, "Test edit", "#15ea14"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No list found.");
				})
				.end(done);
		});

		it("should change the title of the list1", (done) => {
			const title = "Test edit";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list1.id, title))
				.expect(result => {
					const list = result.body.data.editList;
					expect(list.title).toBe(title);
				})
				.end(done);
		});

		it("should change the color of the list1", (done) => {
			const color = "#e2e2e2";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list1.id, null, color))
				.expect(result => {
					const list = result.body.data.editList;
					expect(list.color).toBe(color);
				})
				.end(done);
		});

		it("should change both the color and the title of the list1", (done) => {
			const title = "Test edit"
			const color = "#e2e2e2";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list1.id, title, color))
				.expect(result => {
					const list = result.body.data.editList;
					expect(list.title).toBe(title);
					expect(list.color).toBe(color);
				})
				.end(done);
		});

		it("should do nothing", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list1.id))
				.expect(result => {
					const list = result.body.data.editList;
					expect(list.title).toBe("Test list 1");
				})
				.end(done);
		});
	});


});