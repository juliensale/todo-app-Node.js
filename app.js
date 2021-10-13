const express = require('express');

const app = express();

app.listen('8000');

app.set('view engine', 'ejs');

app.use((req, res) => {
	res.status(404).render('404', { title: "Not Found" });
});