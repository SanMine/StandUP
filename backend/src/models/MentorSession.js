const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MentorSession = sequelize.define('mentor_sessions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  mentor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'mentors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  preferred_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  preferred_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = MentorSession;
