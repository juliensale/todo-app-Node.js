const createListModel = (sequelize, DataTypes, User) => {
	const List = sequelize.define('List', {
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		color: {
			type: DataTypes.STRING,
			defaultValue: "#000000"
		}
	});
	List.User = List.belongsTo(User, { onDelete: 'cascade' });
	return List
}

module.exports = createListModel;