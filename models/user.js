"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    token: DataTypes.STRING
  });

  User.associate = function(models) {
    User.hasMany(models.Entry);
  }
  
  return User;
};
