const { Sequelize } = require('sequelize');

// Setting DB up
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './db.sqlite'
});

module.exports = sequelize