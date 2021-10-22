const { User } = require('../models/user');
const createAuthentication = require('./createAuthentication');

const { isAuthenticated } = createAuthentication(User);

module.exports = { isAuthenticated };