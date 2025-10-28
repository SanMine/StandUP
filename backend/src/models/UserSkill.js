const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSkill = sequelize.define('user_skills', {
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
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = UserSkill;
