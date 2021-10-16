const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const createUserModel = require('./createModel/createUser');

const User = createUserModel(sequelize, DataTypes)

User.sync();

module.exports = { User };