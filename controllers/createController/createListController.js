
const createAuthentication = require('../../middleware/createAuthentication');

const createListController = (User, List) => {

	const { isAuthenticated } = createAuthentication(User)

	const list_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			List.findAll({ where: { UserId: user.id } })
				.then(lists => {
					res.status(200).send(lists);
				})
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.')
				});
		}
	};

	const list_details_get = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			List.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(list => {
					if (!list) {
						return res.status(404).send('No list found.');
					}
					res.status(200).send(list);
				})
				.catch(() => {
					res.status(500).send('Server error.')
				})
		}
	};

	const list_create = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title, color } = req.body;

				// Checking types
				if (!(
					typeof (title) === 'string' && title
					&& (color ? typeof (color) === 'string' : true)
				)) {
					return res.status(400).send('Invalid credentials.');
				}

				var payload = {
					title: title,
					UserId: user.id
				}

				if (color) {
					payload.color = color
				}

				// Creating the instance
				List.create(payload)
					.then(list => { res.status(201).send(list) })
					.catch(err => {
						console.log(err);
						res.status(400).send('Invalid credentials.');
					});
			}
			catch {
				// If req.body could not be deconstruced
				res.status(400).send('Invalid credentials.')
			}
		}
	};

	const list_update = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			try {
				const { title, color } = req.body;

				// Checking types
				if (!(
					(title ? typeof (title) === 'string' : true)
					&& (color ? (typeof (color) === 'string') : true)
				) || (!title && !color)) {
					return res.status(400).send('Invalid credentials.')
				}

				// Finding the list
				List.findOne({ where: { id: req.params.id, UserId: user.id } })
					.then(async (list) => {
						// Missing list
						if (!list) {
							return res.status(404).send('No list found.');
						}

						// Updating it
						if (title) {
							list.title = title;
						}
						if (color) {
							list.color = color;
						}
						return await list.save()
							.then(() => { return res.status(200).send(list) })
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

	const list_delete = async (req, res) => {
		const [err, user] = await isAuthenticated(req, res);
		if (!err) {
			// Finding the list
			List.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (list) => {
					if (!list) {
						return res.status(404).send('No list found.');
					}

					// Deleting
					return await list.destroy()
						.then(() => {
							return res.status(205).send('List deleted.');
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

	return { list_get, list_details_get, list_create, list_update, list_delete };

}

module.exports = createListController;