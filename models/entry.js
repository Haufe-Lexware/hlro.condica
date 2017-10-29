"use strict";

module.exports = function(sequelize, DataTypes) {
  var Entry = sequelize.define("Entry", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    checkIn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
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
