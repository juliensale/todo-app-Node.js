'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createSublistController = require('../createController/createSublistController');
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
		sublist1: undefined,
		sublist2: undefined,
		userControl: undefined,
		listControl: undefined,
		sublistControl: undefined
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
						const sublistController = createSublistController(models.User, models.Sublist);
						app.get('/sublist', sublistController.sublist_get);
						app.get('/sublist/:id', sublistController.sublist_details_get);
						app.post('/sublist', sublistController.sublist_create);
						app.patch('/sublist/:id', sublistController.sublist_update);
						app.delete('/sublist/:id', sublistController.sublist_delete);
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
			username: 'UserControl',
			password: 'testpass123'
		}).catch(err => { throw err });

		instances.listControl = await models.List.create({
			title: "List control",
			color: "#45efa8",
			UserId: instances.userControl.id
		}).catch(err => { throw err });

		instances.sublistControl = await models.Sublist.create({
			title: "Sublist controll",
			UserId: instances.userControl.id,
			ListId: instances.listControl.id
		}).catch(err => { throw err });

	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'sublist_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get('/sublist')
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should return the two sublists but not the controll sublist", (done) => {
			request(app)
				.get('/sublist')
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.length).toBe(2)
					expect(result.body[0].title).toBe(instances.sublist1.title)
					expect(result.body[1].title).toBe(instances.sublist2.title)
				})
				.expect(200, done)
		})
	})

	describe("Tests the 'sublist_details_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get(`/sublist/${instances.sublist1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should fail correctly when the id is incorrect", (done) => {
			request(app)
				.get('/sublist/invalidid')
				.set('AuthenticationToken', authToken)
				.expect('No sublist found.')
				.expect(404, done);
		});

		it("should not be able to find an existing sublist", (done) => {
			request(app)
				.get('/sublist/942349')
				.set('AuthenticationToken', authToken)
				.expect('No sublist found.')
				.expect(404, done);
		});

		it("should retrieve the sublist", (done) => {
			request(app)
				.get(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.title).toBe(instances.sublist1.title);
				})
				.expect(200, done);
		});

	})

	describe("Tests the 'sublist_create' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.post("/sublist")
				.send({
					title: "ShouldNotExist",
					ListId: instances.list.id
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Sublist.findOne({ where: { title: "ShouldNotExist" } })
						.then(sublist => {
							expect(sublist).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should create a sublist linked to the list", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test sublist",
					ListId: instances.list.id
				})
				.expect(result => {
					const sublist = result.body;
					expect(sublist.title).toBe("Test sublist");
					expect(sublist.UserId).toBe(instances.user.id);
					expect(sublist.ListId).toBe(instances.list.id);
				})
				.expect(201, done);
		})

		it("should not accept a non-string title", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.send({
					title: 4,
					ListId: instances.list.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should not accept an invalid list id", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test sublist",
					ListId: 545648551
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the title", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.send({
					ListId: instances.list.id
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the ListId", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test sublist"
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.post('/sublist')
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});

	})

	describe("Tests the 'sublist_update' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.patch(`/sublist/${instances.sublist1.id}`)
				.send({
					title: "ShouldNotExist"
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.Sublist.findOne({ where: { title: "ShouldNotExist" } })
						.then(sublist => {
							expect(sublist).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should not find a sublist", (done) => {
			request(app)
				.patch('/sublist/wrongid')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test"
				})
				.expect('No sublist found.')
				.expect(404, done);
		});

		it("should change the sublist title", (done) => {
			request(app)
				.patch(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update"
				})
				.expect(result => {
					const sublist = result.body;
					expect(sublist.title).toBe("Test update");
				})
				.expect(200, done);
		});

		it("should not change the ListId", (done) => {
			request(app)
				.patch(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test update",
					ListId: instances.listControl.id
				})
				.expect(result => {
					const sublist = result.body;
					expect(sublist.title).toBe("Test update")
					expect(sublist.ListId).toBe(instances.list.id);
				})
				.expect(200, done);
		});

		it("should not accept a non-string title", (done) => {
			request(app)
				.patch(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.send({
					title: 5
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.patch(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});
	});

	describe("Tests the 'sublist_delete' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.delete(`/sublist/${instances.sublist1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should not find the sublist", (done) => {
			request(app)
				.delete('/sublist/wrongid')
				.set('AuthenticationToken', authToken)
				.expect('No sublist found.')
				.expect(404, done);
		});

		it("should delete the sublist", (done) => {
			request(app)
				.delete(`/sublist/${instances.sublist1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(204)
				.end(done);
		})
	})

});