const { User } = require('../models/user');
const { List } = require('../models/list');
const createListController = require('./createController/createListController');

const listController = createListController(User, List)

module.exports = listController;