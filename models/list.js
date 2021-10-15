const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const { User } = require('./user');

const createListModel = (sequelize, DataTypes, User) => {
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
	return List
}

const List = createListModel(sequelize, DataTypes, User);


List.sync();

module.exports = { createListModel, List };