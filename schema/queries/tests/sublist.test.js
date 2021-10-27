'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the Sublist queries", () => {
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
		sublist1: undefined,
		sublist2: undefined,
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined
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

		instances.sublist1 = await models.Sublist.create({
			title: "Test sublist 1",
			UserId: instances.user.id,
			ListId: instances.list.id
		}).catch(err => { throw err });

		instances.sublist2 = await models.Sublist.create({
			title: "Test sublist 2",
			UserId: instances.user.id,
			ListId: instances.list.id
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
		})
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'sublists' query", () => {

		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send({
					query: `
				{
					sublists {
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

		it("should return sublist1 and sublist2, but not the control sublist", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send({
					query: `
				{
					sublists {
						title
					}
				}	
				`
				})
				.expect(result => {
					const sublists = result.body.data.sublists
					expect(sublists.length).toBe(2)
					expect(sublists[0].title).toBe(instances.sublist1.title)
					expect(sublists[1].title).toBe(instances.sublist2.title)
				})
				.end(done);

		})
	})

	describe("Tests the 'sublist' query", () => {
		const postData = (id) => ({
			query: `query sublist($id: Int!){
				sublist(id: $id) {
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
				.send(postData(instances.sublist1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.");
				})
				.end(done);
		});

		// incorrect id
		it("should not find any sublist", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(56487987))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.");
				})
				.end(done);
		});

		// id corresponds to someone else's list
		it("should not allow access to a sublist that does not belong to the authenticated user", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublistControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.");
				})
				.end(done);
		});

		// correct id
		it("should find sublist1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublist1.id))
				.expect(result => {
					const sublist = result.body.data.sublist;
					expect(sublist.title).toBe(instances.sublist1.title);
				})
				.end(done);
		});


	})
});