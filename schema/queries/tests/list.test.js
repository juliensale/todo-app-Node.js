'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes, Utils } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



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

	describe("Tests the 'lists' query", () => {

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send({
					query: `
				{
					lists {
						title
						color
					}
				}
				`
				})
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		});

		it("should return list1 and list2, but not the control list", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send({
					query: `
				{
					lists {
						title
						color
					}
				}	
				`
				})
				.expect(result => {
					const lists = result.body.data.lists
					expect(lists.length).toBe(2)
					expect(lists[0].title).toBe(instances.list1.title)
					expect(lists[1].title).toBe(instances.list2.title)
				})
				.end(done);

		})
	})

	describe("Tests the 'list' query", () => {
		const postData = (id) => ({
			query: `query list($id: Int!){
				list(id: $id) {
					title
					color
				}
			} `,
			variables: {
				id: id
			}
		});

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.list1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.");
				})
				.end(done);
		});

		// incorrect id
		it("should not find any list", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(56487987))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No list found.");
				})
				.end(done);
		});

		// id corresponds to someone else's list
		it("should not allow access to a list that does not belong to the authenticated user", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.listControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No list found.");
				})
				.end(done);
		});

		// correct id
		it("should find list1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list1.id))
				.expect(result => {
					const list = result.body.data.list;
					expect(list.title).toBe(instances.list1.title);
				})
				.end(done);
		});


	})
});