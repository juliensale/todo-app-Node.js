const { getTestDatabase, removeTestDatabase, wait } = require("./testingFunctions");


// beforeAll(async () => {
// 	// Wait for the previous database to be deleted
// 	await wait(500).then(() => { })
// 	global.sequelize = getTestDatabase();
// })

const waitForDBDeleted = () => new Promise(async (res, rej) => {
	// Retries every 100ms for 5 seconds
	for (let i = 0; i < 500; i++) {
		// if global.isDBClean switches to `true`, resolves
		await wait(100).then(() => {
			if (global.isDBClean) {
				res()
			}
		})
	}
	// if global.isDBClean does not switch during these 5 seconds, rejects
	rej()
})

beforeAll(async () => {
	// Sets a default value for the isDBClean variable
	if (global.isDBClean === undefined) {
		global.isDBClean = true
	}

	// Wait for the previous database to be deleted
	await waitForDBDeleted()
		.then(() => {
			// Initialises the DB
			global.sequelize = getTestDatabase();
			global.sequelize.query('PRAGMA journal_mode = "OFF"')

			// Resets the isDBClean variable
			global.isDBClean = false
		})
})


afterAll(async () => {
	await removeTestDatabase(global.sequelize);
})