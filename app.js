const express = require('express');
const sequelize = require('./database');
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/index');

const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const sublistRoutes = require('./routes/sublistRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');


const app = express();


sequelize.authenticate()
	.then(() => {
		console.log('Connected to DB.');
		app.listen('8000');
	})
	.catch(() => console.log('Failed connecting to DB.'));


// GrahpQL	

app.use('/graphql', graphqlHTTP({
	schema,
	graphiql: true
}))

// Register view engine
app.set('view engine', 'ejs');

// middleware
app.use(express.json())


// User routes
app.use('/user', userRoutes);

// List routes
app.use('/list', listRoutes);


// Sublist routes
app.use('/sublist', sublistRoutes);

// Task routes
app.use('/task', taskRoutes);

// Subtask routes
app.use('/subtask', subtaskRoutes)

app.use((req, res) => {
	res.status(404).render('404', { title: "Not Found" });
});

module.exports