const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobSkill = sequelize.define('job_skills', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
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

module.exports = JobSkill;
