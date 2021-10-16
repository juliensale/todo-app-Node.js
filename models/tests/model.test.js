'use strict'

const { DataTypes } = require('sequelize');
const { createModels, removeInstances, removeTestDatabase, getTestDatabase } = require('../../testingFunctions');
const createUserModel = require('../createModel/createUser');



describe("Tests the testing database system", () => {
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

	beforeAll(() => {
		// Setting DB up
		sequelize = getTestDatabase();
	});

	afterAll(() => {
		return removeTestDatabase(sequelize);
	});

	it("tests the creation of the tables", () => {

		// Assures the database is loaded before running anything
		return sequelize.authenticate()
			.then(() => {
				// Runs the `createModels` function
				return createModels(sequelize, DataTypes, models)
					.then(() => {
						// Assures the models were assigned
						expect(models.User).not.toBe(undefined);
						expect(models.List).not.toBe(undefined);
						expect(models.Sublist).not.toBe(undefined);
						expect(models.Task).not.toBe(undefined);
						expect(models.Subtask).not.toBe(undefined);
					})
					// Error management
					.catch(err => { throw err })
			})
			.catch((err) => { throw err });
	});


	it("tests the deletion of instances", async () => {
		// Creates the user model if first test fails
		models.User = createUserModel(sequelize, DataTypes);
		await models.User.sync().catch(err => { throw err });
		return (
			// Creates the user instance
			await models.User.create({
				username: "Testuser",
				password: "testpass123"
			})
				.then(async (user) => {
					// Assigns it to the `instances`object
					instances.user = user;
					expect(instances.user).not.toBe(undefined);

					// Runs the `removeInstances` function
					return await removeInstances(instances, models)
						.then(async () => {
							// The value in the `instances` object should now be undefined
							expect(instances.user).toBe(undefined);

							// Assures the object was actually deleted from the database
							return await models.User.findOne({ where: { username: "Testuser" } })
								.then((foundUser) => {
									return expect(foundUser).toBe(null)
								})

								// Error management
								.catch(err => { throw err })
						})
						.catch(err => { throw err });
				})
				.catch((err) => { throw err })
		)
	});
});