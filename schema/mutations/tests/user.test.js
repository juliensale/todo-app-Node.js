'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the List mutations", () => {
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
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the register mutation", () => {
		const postData = (username, password) => ({
			query: `mutation register($username: String!, $password: String!){
				register(username: $username, password: $password) {
					authentication_token
				}
			}`,
			variables: {
				username,
				password
			}
		});

		it("shoud not create a user if the username is already taken", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.user.username, 'testpass123'))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('A user with this username already exists.')
				})
				.end(done)
		})

		it("should create the user and return the authentication token", (done) => {
			const testUsername = 'TotallyNewUsername';
			const testToken = jwt.sign({ username: testUsername }, process.env.TOKEN_KEY);
			request(app)
				.post('/graphql')
				.send(postData(testUsername, 'testpass123'))
				.expect(result => {
					expect(result.body.data.register.authentication_token).toBe(testToken);
					models.User.findOne({ where: { username: testUsername } })
						.then(user => {
							expect(user).not.toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)
		})
	});

});