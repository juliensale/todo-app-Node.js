const { Model } = require('sequelize');

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

module.exports = createSublistModel;