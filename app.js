const express = require('express');
const sequelize = require('./database');
require('dotenv').config();
const { isAuthenticated } = require('./middleware/authentication');

const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const sublistRoutes = require('./routes/sublistRoutes');
const taskRoutes = require('./routes/taskRoutes');


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

// Test authentication
// app.get('/test-auth', async (req, res) => {
// 	const [err, user] = await isAuthenticated(req, res);
// 	if (!err) {
// 		res.send('Authenticated')
// 	}
// });

// User routes
app.use('/user', userRoutes);

// List routes
app.use('/list', listRoutes);


// Sublist routes
app.use('/sublist', sublistRoutes);

// Task routes
app.use('/task', taskRoutes);

app.use((req, res) => {
	res.status(404).render('404', { title: "Not Found" });
});

module.exports