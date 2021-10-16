const sequelize = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./user');
const { Sublist } = require('./sublist');
const createTaskModel = require('./createModel/createTask');

const Task = createTaskModel(sequelize, DataTypes, User, Sublist);


Task.sync();

module.exports = { Task };