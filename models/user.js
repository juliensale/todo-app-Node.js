const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const createUserModel = (sequelize, DataTypes) => {
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
	return User
}

const User = createUserModel(sequelize, DataTypes)

User.sync();

module.exports = { createUserModel, User };