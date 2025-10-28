const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('events', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Career Fair', 'Workshop', 'Interview', 'Webinar', 'Networking'),
    allowNull: false,
    defaultValue: 'Webinar'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Event;
