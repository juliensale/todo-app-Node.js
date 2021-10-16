const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const { User } = require('./user');
const createListModel = require('./createModel/createList');

const List = createListModel(sequelize, DataTypes, User);


List.sync();

module.exports = { List };