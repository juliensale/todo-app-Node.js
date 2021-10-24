const { User } = require('../models/user');
const { Task } = require('../models/task');
const createTaskController = require('./createController/createTaskController');

const taskController = createTaskController(User, Task);

module.exports = taskController;
