const { User } = require('../models/user');
const { Sublist } = require('../models/sublist');
const createSublistController = require('./createController/createSublistController');

const sublistController = createSublistController(User, Sublist);

module.exports = sublistController;
