const { Model } = require('sequelize');

const createSubtaskModel = (sequelize, DataTypes, User, Task) => {
	class Subtask extends Model {
		setCompleted(completed) {
			this.completed = completed;
			this.save()
		}
	}
	Subtask.init({
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		completed: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, { sequelize, modelName: 'Subtask' });
	Subtask.User = Subtask.belongsTo(User);
	Subtask.Task = Subtask.belongsTo(Task);

	return Subtask
}

module.exports = createSubtaskModel;