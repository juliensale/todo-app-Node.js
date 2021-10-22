'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createAuthentication = require('../createAuthentication');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

require('dotenv').config();

describe("Tests the authentication middleware", () => {
	let sequelize;
	let models = {
		User: undefined,
		List: undefined,
		Sublist: undefined,
		Task: undefined,
		Subtask: undefined
	};
	let instances = {
		user: undefined
	};
	let isAuthenticated;

	const app = express()
	app.get('/is-authenticated', async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			return res.status(200).send(user)
		}
	})

	beforeAll(async () => {
		sequelize = global.sequelize;
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models)
					.then(() => {
						isAuthenticated = createAuthentication(models.User).isAuthenticated;
					})
					.catch(err => { throw err });
			})
			.catch(err => { throw err });
	});

	beforeEach(async () => {
		instances.user = await models.User.create({
			username: "TestUser",
			password: "testpass123"
		}).catch(err => { throw err });
	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	it("should ask for the authentication token", (done) => {
		request(app)
			.get('/is-authenticated')
			.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
			.expect(403, done);
	});

	it("should say the token is invalid", (done) => {
		request(app)
			.get('/is-authenticated')
			.set('AuthenticationToken', 'invalidtoken')
			.expect('Invalid token.')
			.expect(403, done);
	});

	it("should not find the user", (done) => {
		const token = jwt.sign({ username: 'InvalidUser' }, process.env.TOKEN_KEY);
		request(app)
			.get('/is-authenticated')
			.set('AuthenticationToken', token)
			// .expect('User does not exist.')
			.expect(403, done);
	});

	it("should authenticate the user", (done) => {
		const token = jwt.sign({ username: instances.user.username }, process.env.TOKEN_KEY);
		request(app)
			.get('/is-authenticated')
			.set('AuthenticationToken', token)
			.expect('Content-Type', /json/)
			.expect((res) => res.username === instances.user.username)
			.expect(200, done);
	});
});