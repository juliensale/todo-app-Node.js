const sequelize = require('../database');
const { DataTypes } = require('sequelize');
const { User } = require('./user');
const { Task } = require('./task');
const createSubtaskModel = require('./createModel/createSubtask');

const Subtask = createSubtaskModel(sequelize, DataTypes, User, Task);


Subtask.sync();

module.exports = { Subtask };