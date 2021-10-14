
const { isAuthenticated } = require("../middleware/authentication")
const Sublist = require('../models/sublist');

const sublist_get = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		Sublist.findAll({ where: { UserId: user.id } })
			.then(sublists => {
				res.status(200).send(sublists);
			})
			.catch(err => {
				console.log(err);
				res.status(500).send('Server error.')
			});
	}
};

const sublist_details_get = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		Sublist.findOne({ where: { id: req.params.id, UserId: user.id } })
			.then(sublist => {
				if (!sublist) {
					return res.status(404).send('No sublist found.');
				}
				res.status(200).send(sublist);
			})
			.catch(err => {
				console.log(err);
				res.status(500).send('Server error.')
			})
	}
};

const sublist_create = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		try {
			const { title, ListId } = req.body;

			// Checking types
			if (!(
				typeof (title) === 'string' && title
				&& typeof (ListId) === 'number' && ListId
			)) {
				return res.status(400).send('Invalid credentials.');
			}

			var payload = {
				title: title,
				ListId: ListId,
				UserId: user.id
			}

			// Creating the instance
			Sublist.create(payload)
				.then(sublist => { res.status(201).send(sublist) })
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

const sublist_update = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		try {
			const { title } = req.body;

			// Checking types
			if (!(title && typeof (title) === 'string')) {
				return res.status(400).send('Invalid credentials.')
			}

			// Finding the sublist
			Sublist.findOne({ where: { id: req.params.id, UserId: user.id } })
				.then(async (sublist) => {
					// Missing sublist
					if (!sublist) {
						return res.status(404).send('Sublist not found.');
					}

					// Updating it
					sublist.title = title;
					return await sublist.save()
						.then(() => { return res.status(200).send(sublist) })
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

const sublist_delete = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		// Finding the sublist
		Sublist.findOne({ where: { id: req.params.id, UserId: user.id } })
			.then(async (sublist) => {
				if (!sublist) {
					return res.status(404).send('No list found.');
				}

				// Deleting
				return await sublist.destroy()
					.then(() => {
						return res.status(205).send('Sublist deleted.');
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


module.exports = { sublist_get, sublist_details_get, sublist_create, sublist_update, sublist_delete };