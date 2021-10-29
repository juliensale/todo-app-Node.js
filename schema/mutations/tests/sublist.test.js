'use strict'

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const createSchema = require('../../createSchema');
const request = require('supertest');
const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../../testingFunctions');

const jwt = require('jsonwebtoken');
require('dotenv').config();



describe("Testing the Sublist mutations", () => {
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
			color: "#e123a4",
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
		}).catch(err => { throw err });
	});

	afterEach(async () => {
		// Deleting the instances from the database after each test
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	describe("Tests the createSublist mutation", () => {
		const postData = (ListId, title) => ({
			query: `mutation createSublist($ListId: Int!, $title: String!){
						createSublist(ListId: $ListId, title: $title) {
							title
						}
					}`,
			variables: {
				ListId: ListId,
				title: title
			}
		});
		it("should ask for the authentication token", (done) => {
			request(app)
				.post('/graphql')
				.send(postData(instances.list.id, "Test create sublist"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should create a new sublist for the authenticated user", (done) => {
			const title = "Test create sublist"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.list.id, title))
				.expect(result => {
					const sublist = result.body.data.createSublist;
					expect(sublist.title).toBe(title);
					models.Sublist.findOne({ where: { title: title } })
						.then(sublist => {
							expect(sublist).not.toBe(null);
							expect(sublist.UserId).toBe(instances.user.id);
							expect(sublist.ListId).toBe(instances.list.id);
							sublist.destroy();
						});
				})
				.end(done);
		});

		it("should not create a new sublist if the ListId is invalid", (done) => {
			const title = "Test create sublist"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(549884, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid ListId.')
					models.Sublist.findOne({ where: { title: title } })
						.then(sublist => {
							expect(sublist).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)
		})

		it("should not create a new sublist if the list does not belong to the authenticated user", (done) => {
			const title = "Test create sublist"
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.listControl.id, title))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe('Invalid ListId.')
					models.Sublist.findOne({ where: { title: title } })
						.then(sublist => {
							expect(sublist).toBe(null);
						})
						.catch(err => { throw err });
				})
				.end(done)

		})
	});

	describe("Tests the editSublist mutation", () => {
		const postData = (id, title) => {
			const query = `mutation editSublist($id: Int!,$title: String){
						editSublist(id: $id, title: $title) {
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
				.send(postData(instances.sublist1.id, "Test create sublist"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})


		it("should not find any sublist", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(89987, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.");
				})
				.end(done);
		});

		it("should not let the authenticated user edit the sublist", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublistControl.id, "Test edit"))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.");
				})
				.end(done);
		});

		it("should change the title of the sublist1", (done) => {
			const title = "Test edit";
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublist1.id, title))
				.expect(result => {
					const sublist = result.body.data.editSublist;
					expect(sublist.title).toBe(title);
				})
				.end(done);
		});

		it("should do nothing", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublist1.id))
				.expect(result => {
					const sublist = result.body.data.editSublist;
					expect(sublist.title).toBe("Test sublist 1");
				})
				.end(done);
		});
	});

	describe("Tests the deleteSublist mutation", () => {
		const postData = (id) => ({
			query: `mutation deleteSublist($id: Int!){
						deleteSublist(id: $id) {
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
				.send(postData(instances.sublist1.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("You must provide an 'AuthenticationToken' header.")
				})
				.end(done)
		})

		it("should not find any list", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(4898794))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.")
				})
				.end(done);
		});

		it("should not allow the user to delete the sublist", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublistControl.id))
				.expect(result => {
					expect(JSON.parse(result.text).errors[0].message).toBe("No sublist found.")
					return models.Sublist.findOne({ where: { id: instances.sublistControl.id } })
						.then(sublist => {
							expect(sublist).not.toBe(null);
						})
						.catch(err => { throw err })
				})
				.end(done);
		});

		it("should delete the sublist1", (done) => {
			request(app)
				.post('/graphql')
				.set('AuthenticationToken', authToken)
				.send(postData(instances.sublist1.id))
				.expect(() => {
					return models.Sublist.findOne({ where: { id: instances.sublist1.id } })
						.then(sublist => {
							expect(sublist).toBe(null);
						})
						.catch(err => { throw err })
				})
				.expect(result => {
					expect(result.body.data.deleteSublist.message).toBe('Sublist deleted.')
				})
				.end(done);
		})
	})

});