'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances } = require('../../testingFunctions');
const sha256 = require('sha256');


describe("Tests the User model", () => {
	const password = "testpass123"
	let sequelize;
	let models = {
		User: undefined,
		List: undefined,
		Sublist: undefined,
		Task: undefined,
		Subtask: undefined
	}
	let instances = {
		user: undefined
	}

	beforeAll(async () => {
		sequelize = global.sequelize;
		return await sequelize.authenticate()
			.then(async () => {
				return await createModels(sequelize, DataTypes, models).catch(err => { throw err });
			})
			.catch(err => { throw err });
	});

	beforeEach(async () => {
		instances.user = await models.User.create({
			username: "TestUser",
			password: password
		});
	});

	afterEach(async () => {
		return await removeInstances(instances, models).catch(err => { throw err });
	});

	it("verifies the password has been hashed", () => {
		expect(instances.user.password).toBe(sha256(password));
	});

	it("assures the `checkPassword` method is a function", () => {
		expect(instances.user.checkPassword).toBeInstanceOf(Function);
	});

	it("should not accept the wrong password", () => {
		expect(instances.user.checkPassword('wrongpassword')).toBe(false);
	});

	it("should accept the correct password", () => {
		expect(instances.user.checkPassword(password)).toBe(true);
	});
})