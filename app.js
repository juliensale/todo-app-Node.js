const express = require('express');
const sequelize = require('./database');
require('dotenv').config();
const { isAuthenticated } = require('./middleware/authentication');

const userRoutes = require('./routes/userRoutes');
const List = require('./models/list')

const app = express();


sequelize.authenticate()
	.then(() => {
		console.log('Connected to DB.');
		app.listen('8000');
	})
	.catch(() => console.log('Failed connecting to DB.'));

// Register view engine
app.set('view engine', 'ejs');

// middleware
app.use(express.json())

app.get('/lists', (req, res) => {
	List.findAll()
		.then(lists => res.json(lists))
		.catch(err => console.log(err))
});

app.post('/create-dummy-list', (req, res) => {
	List.create({ title: "Dummy list" })
		.then(list => res.json(list))
		.catch(err => console.log(err))
});

app.get('/test-auth', async (req, res) => {
	const [err, user] = await isAuthenticated(req, res);
	if (!err) {
		res.send('Authenticated')
	}
});

app.use('/user', userRoutes);

app.use((req, res) => {
	res.status(404).render('404', { title: "Not Found" });
});

module.exports