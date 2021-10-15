const sequelize = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./user');
const { List } = require('./list');

const createSublistModel = (sequelize, DataTypes, User, List) => {

	class Sublist extends Model { }
	Sublist.init({
		title: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, { sequelize, modelName: 'Sublist' });

	Sublist.User = Sublist.belongsTo(User);
	Sublist.List = Sublist.belongsTo(List);
	return Sublist
};

const Sublist = createSublistModel(sequelize, DataTypes, User, List);

Sublist.sync();

module.exports = { createSublistModel, Sublist };