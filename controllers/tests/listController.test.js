'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const createListController = require('../createController/createListController');
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
		list1: undefined,
		list2: undefined,
		userControl: undefined,
		listControl: undefined
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
						const listController = createListController(models.User, models.List);
						app.get('/list', listController.list_get);
						app.get('/list/:id', listController.list_details_get);
						app.post('/list', listController.list_create);
						app.patch('/list/:id', listController.list_update);
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

		instances.list1 = await models.List.create({
			title: "Test list 1",
			color: "#45efa8",
			UserId: instances.user.id
		}).catch(err => { throw err });

		instances.list2 = await models.List.create({
			title: "Test list 2",
			color: "#65bfa3",
			UserId: instances.user.id
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

	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the 'list_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get('/list')
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should return the two lists but not the controll list", (done) => {
			request(app)
				.get('/list')
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.length).toBe(2)
					expect(result.body[0].title).toBe(instances.list1.title)
					expect(result.body[1].title).toBe(instances.list2.title)
				})
				.expect(200, done)
		})
	})

	describe("Tests the 'list_details_get' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.get(`/list/${instances.list1.id}`)
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(403, done);
		});

		it("should fail correctly when the id is incorrect", (done) => {
			request(app)
				.get('/list/invalidid')
				.set('AuthenticationToken', authToken)
				.expect('No list found.')
				.expect(404, done);
		});

		it("should not be able to find an existing list", (done) => {
			request(app)
				.get('/list/942349')
				.set('AuthenticationToken', authToken)
				.expect('No list found.')
				.expect(404, done);
		});

		it("should retrieve the list", (done) => {
			request(app)
				.get(`/list/${instances.list1.id}`)
				.set('AuthenticationToken', authToken)
				.expect(result => {
					expect(result.body.title).toBe(instances.list1.title);
				})
				.expect(200, done);
		});

	})

	describe("Tests the 'list_create' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.post("/list")
				.send({
					title: "ShouldNotExist"
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.List.findOne({ where: { title: "ShouldNotExist" } })
						.then(list => {
							expect(list).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});

		it("should create a list with the default color", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test list"
				})
				.expect(result => {
					const list = result.body;
					expect(list.title).toBe("Test list");
					expect(list.UserId).toBe(instances.user.id);
				})
				.expect(201, done);
		})

		it("should create a list with the default color", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test list",
					color: "#fefefe"
				})
				.expect(result => {
					const list = result.body;
					expect(list.title).toBe("Test list");
					expect(list.color).toBe("#fefefe");
					expect(list.UserId).toBe(instances.user.id);
				})
				.expect(201, done);
		});

		it("should not accept a non-string title", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.send({
					title: 4
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should not accept a non-string color", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.send({
					title: "Test list",
					color: 4
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should require the title", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.send({
					color: 4
				})
				.expect('Invalid credentials.')
				.expect(400, done);
		});

		it("should fail correctly without a body", (done) => {
			request(app)
				.post('/list')
				.set('AuthenticationToken', authToken)
				.expect('Invalid credentials.')
				.expect(400, done);
		});

	})

	describe("Tests the 'list_update' controller", () => {
		// We can limit to testing the absence of AuthenticationToken since every fail based on authentication is managed the same way
		it("should fail because of the authentication", (done) => {
			request(app)
				.patch(`/list/${instances.list1.id}`)
				.send({
					title: "ShouldNotExist"
				})
				.expect('Authentication required. Set `AuthenticationToken` header with the authentication token.')
				.expect(async () => {
					await models.List.findOne({ where: { title: "ShouldNotExist" } })
						.then(list => {
							expect(list).toBe(null)
						})
						.catch(err => { throw err })
				})
				.expect(403, done);
		});
	});

	it("should not find a list", (done) => {
		request(app)
			.patch('/list/wrongid')
			.set('AuthenticationToken', authToken)
			.send({
				title: "Test"
			})
			.expect('No list found.')
			.expect(404, done);
	});

	it("should change the list title", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.send({
				title: "Test update"
			})
			.expect(result => {
				const list = result.body;
				expect(list.title).toBe("Test update");
			})
			.expect(200, done);
	});

	it("should change the list color", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.send({
				color: "#aaaaaa"
			})
			.expect(result => {
				const list = result.body;
				expect(list.color).toBe("#aaaaaa");
			})
			.expect(200, done);
	});

	it("should change the list title & color", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.send({
				title: "Test update",
				color: "#aaaaaa"
			})
			.expect(result => {
				const list = result.body;
				expect(list.title).toBe("Test update");
				expect(list.color).toBe("#aaaaaa");
			})
			.expect(200, done);
	});

	it("should not accept a non-string title", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.send({
				title: 5
			})
			.expect('Invalid credentials.')
			.expect(400, done);
	});

	it("should not accept a non-string color", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.send({
				color: 5
			})
			.expect('Invalid credentials.')
			.expect(400, done);
	});

	it("should fail correctly without a body", (done) => {
		request(app)
			.patch(`/list/${instances.list1.id}`)
			.set('AuthenticationToken', authToken)
			.expect('Invalid credentials.')
			.expect(400, done);
	});

});