const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Register
router.post('/register', userController.register);

//Login
router.post('/login', userController.login);

// Infos
router.get('/info', userController.get_info);

module.exports = router;
