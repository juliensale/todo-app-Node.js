'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createUserController = require('../createController/createUserController');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();


describe("Tests the user controller", () => {
	let password = "testpass123"

	let sequelize;
	let models = {
		User: undefined,
		List: undefined,
		Sublist: undefined,
		Task: undefined,
		Subtask: undefined,
	};
	let instances = {
		user: undefined
	};
	// let userController;

	const app = express();
	app.use(express.json());

	beforeAll(async () => {
		sequelize = global.sequelize;
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models)
					.then(() => {
						const userController = createUserController(models.User);
						app.post('/register', userController.register);
						app.post('/login', userController.login);
						app.get('/get-info', userController.get_info);
					})
					.catch(err => { throw err });
			})
			.catch(err => { throw err });
	});

	beforeEach(async () => {
		instances.user = await models.User.create({
			username: "TestUser",
			password: password
		}).catch(err => { throw err });
	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the login controller", () => {

		it("should return the authentication token", (done) => {
			const token = jwt.sign({ username: instances.user.username }, process.env.TOKEN_KEY);

			request(app)
				.post('/login')
				.send({
					username: instances.user.username,
					password: password
				})
				.expect({ authentication_token: token })
				.expect(200, done);
		});

		it("should not accept an incorrect password", (done) => {
			request(app)
				.post('/login')
				.send({
					username: instances.user.username,
					password: 'wrongpassword'
				})
				.expect('Wrong password.')
				.expect(400, done);
		});

		it("should not find the user", (done) => {
			request(app)
				.post('/login')
				.send({
					username: "WrongUsername",
					password: 'randompassword'
				})
				.expect('No user found with this username.')
				.expect(400, done);
		});

		it('should not accept a non-string username', (done) => {
			request(app)
				.post('/login')
				.send({
					username: 4,
					password: 'randompassword'
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it('should not accept a non-string password', (done) => {
			request(app)
				.post('/login')
				.send({
					username: instances.user.username,
					password: 5
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it('should require the username', (done) => {
			request(app)
				.post('/login')
				.send({
					password: 'randompassword'
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it('should require the password', (done) => {
			request(app)
				.post('/login')
				.send({
					username: instances.user.username
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it('should fail correctly without a body', (done) => {
			request(app)
				.post('/login')
				.expect('Invalid credentials.')
				.expect(400, done);
		});


		// CHANGE THE LOGIN FUNCTION TO USE `checkPasword` METHOD

	});
});