const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	}
});

User.sync();

module.exports = User;