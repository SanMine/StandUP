const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('jobs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  logo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Internship', 'Full-time', 'Part-time', 'Contract'),
    allowNull: false,
    defaultValue: 'Full-time'
  },
  mode: {
    type: DataTypes.ENUM('Onsite', 'Hybrid', 'Remote'),
    allowNull: false,
    defaultValue: 'Onsite'
  },
  salary: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  culture: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  posted_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'draft'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Job;
