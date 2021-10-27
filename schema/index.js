const createSchema = require('./createSchema');
const { User } = require('../models/user');
const { List } = require('../models/list');
const { Sublist } = require('../models/sublist');
const { Subtask } = require('../models/task');
const { Task } = require('../models/subtask');

const schema = createSchema(User, List, Sublist, Task, Subtask);

module.exports = schema