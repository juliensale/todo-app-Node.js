const { Sequelize } = require('sequelize');

// Setting DB up
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './db.sqlite',
	logging: false
});

module.exports = sequelize