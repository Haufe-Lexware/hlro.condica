"use strict";

module.exports = function(sequelize, DataTypes) {
  var Entry = sequelize.define("Entry", {
    checkIn: DataTypes.DATE,
    checkOut: DataTypes.DATE,
    location: DataTypes.ENUM("OFFICE", "DEL" ,"HO"),
    workedHours: DataTypes.INTEGER,
    overtime: DataTypes.INTEGER
  });
  
  Entry.associate = function(models) {
    Entry.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  }
  
  return Entry;
};
