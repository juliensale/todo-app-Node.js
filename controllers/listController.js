const { isAuthenticated } = require("../middleware/authentication")
const List = require('../models/list');

const list_get = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		List.findAll({ where: { user: user.id } })
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
		List.findOne({ where: { id: req.params.id, user: user.id } })
			.then(list => {
				if (!list) {
					return res.status(404).send('No list found.');
				}
				res.status(200).send(list);
			})
			.catch(err => {
				console.log(err);
				res.status(500).send('Server error.')
			})
	}
};

const list_create = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		try {
			const { title } = req.body;
			if (!title) {
				res.status(400).send('Invalid credentials.');
			}
			List.create({ title: title, user: user.id })
				.then(list => { res.status(201).send(list) })
				.catch(err => {
					console.log(err);
					res.status(500).send('Server error.');
				});
		}
		catch {
			res.status(400).send('Invalid credentials.')
		}
	}
};

const list_update = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {

		try {
			const { title } = req.body;
			if (!title) {
				return res.status(400).send('Invalid credentials.')
			}
			List.findOne({ where: { id: req.params.id, user: user.id } })
				.then(async (list) => {
					if (!list) {
						return res.status(404).send('List not found.');
					}
					list.title = title;
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
			res.status(400).send('Invalid credentials.')
		}

	}
};

const list_delete = async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		List.findOne({ where: { id: req.params.id, user: user.id } })
			.then(async (list) => {
				if (!list) {
					return res.status(404).send('No list found.');
				}
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


module.exports = { list_get, list_details_get, list_create, list_update, list_delete };