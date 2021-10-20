const { getTestDatabase, removeTestDatabase } = require("./testingFunctions");

const wait = (time) => new Promise((res,) => {
	setTimeout(() => { res() }, time);
})

beforeAll(async () => {
	// Wait for the previous database to be deleted
	await wait(500).then(() => { })
	global.sequelize = getTestDatabase();
})


afterAll(() => {
	return removeTestDatabase(global.sequelize);
})