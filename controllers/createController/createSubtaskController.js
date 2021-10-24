const createAuthentication = require("../../middleware/createAuthentication");

const createSubtaskController = (User, Subtask) => {

	const { isAuthenticated } = createAuthentication(User);

	const subtask_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Subtask.findAll({ where: { UserId: user.id } })
				.then(subtasks => {
					res.status(200).send(subtasks);
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				});
		}
	};

	const subtask_details_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			Subtask.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(subtask => {
					if (!subtask) {
						return res.status(404).send('No subtask found.');
					}
					res.status(200).send(subtask);
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				})
		}
	};

	const subtask_create = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title, TaskId } = req.body;

				// Checking types
				if (!(
					typeof (title) === 'string' && title
					&& typeof (TaskId) === 'number' && TaskId
				)) {
					return res.status(400).send('Invalid credentials.');
				}

				var payload = {
					title: title,
					TaskId: TaskId,
					UserId: user.id
				}

				// Creating the instance
				Subtask.create(payload)
					.then(subtask => { res.status(201).send(subtask) })
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

	const subtask_update = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title } = req.body;

				// Checking types
				if (!(title && typeof (title) === 'string')) {
					return res.status(400).send('Invalid credentials.')
				}

				// Finding the subtask
				Subtask.findOne({ where: { id: req.params.id, UserId: user.id } })
					.then(async (subtask) => {
						// Missing subtask
						if (!subtask) {
							return res.status(404).send('No subtask found.');
						}

						// Updating it
						subtask.title = title;
						return await subtask.save()
							.then(() => { return res.status(200).send(subtask) })
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

	const subtask_delete = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			// Finding the subtask
			Subtask.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (subtask) => {
					if (!subtask) {
						return res.status(404).send('No subtask found.');
					}

					// Deleting
					return await subtask.destroy()
						.then(() => {
							return res.status(204).send();
						})
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
	}


	return { subtask_get, subtask_details_get, subtask_create, subtask_update, subtask_delete };
}

module.exports = createSubtaskController;