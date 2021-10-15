const { DataTypes } = require('sequelize');
const { createModels, removeInstances, removeTestDatabase, getTestDatabase } = require('../../testingFunctions');



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

	beforeAll(async () => {
		// Setting DB up
		sequelize = getTestDatabase();
	});

	afterAll(() => {
		removeTestDatabase(sequelize);
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


	it("tests the deletion of instances", () => {
		return (
			// Creates the user instance
			models.User.create({
				username: "Testuser",
				password: "testpass123"
			})
				.then(user => {
					// Assigns it to the `instances`object
					instances.user = user;
					expect(instances.user).not.toBe(undefined);

					// Runs the `removeInstances` function
					return removeInstances(instances, models)
						.then(() => {
							// The value in the `instances` object should now be undefined
							expect(instances.user).toBe(undefined);

							// Assures the object was actually deleted from the database
							models.User.findOne({ where: { username: "Testuser" } })
								.then((foundUser) => {
									expect(foundUser).toBe(null)
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