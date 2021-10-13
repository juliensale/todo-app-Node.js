const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();

// Setting DB up
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './db.sqlite'
});


sequelize.authenticate()
	.then(() => {
		console.log('Connected to DB.');
		app.listen('8000');
	})
	.catch(() => console.log('Failed connecting to DB.'));


app.set('view engine', 'ejs');

app.use((req, res) => {
	res.status(404).render('404', { title: "Not Found" });
});