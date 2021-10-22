const { Model } = require('sequelize');
const sha256 = require('sha256')

const createUserModel = (sequelize, DataTypes) => {
	class User extends Model {
		checkPassword(password) {
			return sha256(password) === this.password;
		};
	}
	User.init({
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, { sequelize, modelName: "User" })

	User.beforeCreate((user) => {
		const hashedPassword = sha256(user.password);
		user.password = hashedPassword;
	})
	return User
}

module.exports = createUserModel;