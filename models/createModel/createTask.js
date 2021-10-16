const { Model } = require('sequelize');
const createTaskModel = (sequelize, DataTypes, User, Sublist) => {
	class Task extends Model {
		async setCompleted(completed) {
			this.completed = completed;
			await this.save().catch(err => { throw err });
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

module.exports = createTaskModel;