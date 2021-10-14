const sequelize = require('../database');
const { DataTypes, Model } = require('sequelize');
const User = require('./user');
const Sublist = require('./sublist');

class Task extends Model { }
Task.init({
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	completed: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
}, { sequelize, modelName: 'Task' });


Task.User = Task.belongsTo(User);
Task.Sublist = Task.belongsTo(Sublist);

Task.sync();

module.exports = Task;