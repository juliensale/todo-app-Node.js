const { User } = require('../models/user');
const createUserController = require('./createController/createUserController');

const controller = createUserController(User);

module.exports = controller;