const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const { User } = require('./user');
const { List } = require('./list');
const createSublistModel = require('./createModel/createSublist');

const Sublist = createSublistModel(sequelize, DataTypes, User, List);

Sublist.sync();

module.exports = { Sublist };