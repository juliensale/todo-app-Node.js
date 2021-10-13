const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const List = sequelize.define('List', {
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	color: {
		type: DataTypes.STRING,
		defaultValue: "#000000"
	}
})

List.sync()

module.exports = List