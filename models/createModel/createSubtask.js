const { Model } = require('sequelize');

const createSubtaskModel = (sequelize, DataTypes, User, Task) => {
	class Subtask extends Model {
		async setCompleted(completed) {
			this.completed = completed;
			await this.save().catch(err => { throw err });
		}

		async complete() {
			await this.setCompleted(true)
				.then(async () => {
					return await Task.findOne({ where: { id: this.TaskId } })
						.then(async task => await task.checkComplete())
						.catch(err => { throw err })
				})
				.catch(err => { throw err })
		}

		async uncomplete() {
			await this.setCompleted(false);
			await Task.findOne({ where: { id: this.TaskId } })
				.then(async task => await task.setCompleted(false))
				.catch(err => { throw err });
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
	Subtask.Task = Subtask.belongsTo(Task, { onDelete: 'cascade' });

	Task.prototype.getSubtaskModel = () => Subtask

	Subtask.addHook('afterCreate', async (subtask) => {
		await Task.findOne({ where: { id: subtask.TaskId } })
			.then(async task => await task.setCompleted(false))
			.catch(err => { throw err });
	})

	Subtask.addHook('afterDestroy', async (subtask) => {
		await Task.findOne({ where: { id: subtask.TaskId } })
			.then(async task => {
				if (task) {
					return await task.checkComplete()
				}
			})
			.catch(err => { throw err })
	})

	return Subtask
}

module.exports = createSubtaskModel;