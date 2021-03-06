const createAuthentication = require("../../middleware/createAuthentication");


const createTaskController = (User, Task) => {
	const { isAuthenticated } = createAuthentication(User)

	const task_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Task.findAll({ where: { UserId: user.id } })
				.then(tasks => {
					res.status(200).send(tasks);
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				});
		}
	};

	const task_details_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Task.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(task => {
					if (!task) {
						return res.status(404).send('No task found.');
					}
					res.status(200).send(task);
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				})
		}
	};

	const task_create = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title, SublistId } = req.body;

				// Checking types
				if (!(
					typeof (title) === 'string' && title
					&& typeof (SublistId) === 'number' && SublistId
				)) {
					return res.status(400).send('Invalid credentials.');
				}

				var payload = {
					title: title,
					SublistId: SublistId,
					UserId: user.id
				}

				// Creating the instance
				Task.create(payload)
					.then(task => { res.status(201).send(task) })
					.catch(() => {
						res.status(400).send('Invalid credentials.');
					});
			}
			catch {
				// If req.body could not be deconstruced
				res.status(400).send('Invalid credentials.')
			}
		}
	};

	const task_update = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title } = req.body;

				// Checking types
				if (!(title && typeof (title) === 'string')) {
					return res.status(400).send('Invalid credentials.')
				}

				// Finding the task
				Task.findOne({ where: { id: req.params.id, UserId: user.id } })
					.then(async (task) => {
						// Missing task
						if (!task) {
							return res.status(404).send('No task found.');
						}

						// Updating it
						task.title = title;
						return await task.save()
							.then(() => { return res.status(200).send(task) })
							.catch(err => {
								console.log(err);
								return res.status(500).send('Server error.')
							})
					})
					.catch(err => {
						console.log(err);
						return res.status(500).send('Server error.')
					})

			}
			catch {
				// If req.body could not be deconstruced
				res.status(400).send('Invalid credentials.')
			}

		}
	};

	const task_delete = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			// Finding the task
			Task.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (task) => {
					if (!task) {
						return res.status(404).send('No task found.');
					}

					// Deleting
					return await task.destroy()
						.then(() => {
							return res.status(204).send();
						})
						.catch(() => {
							return res.status(500).send('Server error.')
						})
				})
				.catch(err => {
					console.log(err);
					return res.status(500).send('Server error.')
				})
		}
	}

	const task_complete = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Task.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (task) => {
					if (!task) {
						return res.status(404).send('No task found.');
					}

					// Completing
					return await task.complete()
						.then(() => {
							return res.status(200).send()
						})
						.catch(() => {
							return res.status(500).send('Server error.')
						})
				})
				.catch(() => {
					return res.status(500).send('Server error.')
				})
		}
	}
	const task_uncomplete = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Task.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (task) => {
					if (!task) {
						return res.status(404).send('No task found.');
					}

					// Uncompleting
					return await task.uncomplete()
						.then(() => {
							return res.status(200).send()
						})
						.catch(() => {
							return res.status(500).send('Server error.')
						})
				})
				.catch(() => {
					return res.status(500).send('Server error.')
				})
		}
	}


	return { task_get, task_details_get, task_create, task_update, task_delete, task_complete, task_uncomplete };
}

module.exports = createTaskController;