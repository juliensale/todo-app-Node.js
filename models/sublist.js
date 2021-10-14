const sequelize = require('../database');
const { DataTypes, Model } = require('sequelize');
const User = require('./user');
const List = require('./list');

class Sublist extends Model { }
Sublist.init({
	title: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, { sequelize, modelName: 'Sublist' });

Sublist.User = Sublist.belongsTo(User);
Sublist.List = Sublist.belongsTo(List);


Sublist.sync();

module.exports = Sublist;