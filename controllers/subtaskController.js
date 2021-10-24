const { User } = require('../models/user');
const { Subtask } = require('../models/subtask');
const createSubtaskController = require('./createController/createSubtaskController');

const subtaskController = createSubtaskController(User, Subtask);

module.exports = subtaskController;