const { Model } = require('sequelize');
const createTaskModel = (sequelize, DataTypes, User, Sublist) => {
	class Task extends Model {
		getSubtaskModel() {
			return undefined
		}

		async complete() {
			await this.setCompleted(true)
			const Subtask = this.getSubtaskModel()
			if (Subtask) {
				await Subtask.findAll({ where: { TaskId: this.id } })
					.then(async subtasks => {
						return await subtasks.forEach(async subtask => await subtask.setCompleted(true))
					})
					.catch(err => { throw err })

			}
		}

		async uncomplete() {
			await this.setCompleted(false)
			const Subtask = this.getSubtaskModel()
			if (Subtask) {
				await Subtask.findAll({ where: { TaskId: this.id } })
					.then(async subtasks => {
						return await subtasks.forEach(async subtask => await subtask.setCompleted(false))
					})
					.catch(err => { throw err })

			}
		}

		async checkComplete() {
			const Subtask = this.getSubtaskModel()
			if (Subtask) {
				var shouldBeCompleted = true;
				await Subtask.findAll({ where: { TaskId: this.id } })
					.then(subtasks => {
						// returns true only if all the subtasks are completed
						const shouldBeCompleted = subtasks.map(subtask => subtask.completed).reduce((previousValue, currentValue) => (previousValue && currentValue), true);
						this.setCompleted(shouldBeCompleted);
					})
					.catch(err => { throw err })

			}

		}

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