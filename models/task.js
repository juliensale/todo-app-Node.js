const sequelize = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./user');
const { Sublist } = require('./sublist');

const createTaskModel = (sequelize, DataTypes, User, Sublist) => {
	class Task extends Model {
		setCompleted(completed) {
			this.completed = completed;
			this.save()
		}
	}
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

	return Task
}

const Task = createTaskModel(sequelize, DataTypes, User, Sublist);


Task.sync();

module.exports = { createTaskModel, Task };