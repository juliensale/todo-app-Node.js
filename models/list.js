const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const User = require('./user');

const List = sequelize.define('List', {
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	color: {
		type: DataTypes.STRING,
		defaultValue: "#000000"
	}
});

List.User = List.belongsTo(User);

List.sync();

module.exports = List;