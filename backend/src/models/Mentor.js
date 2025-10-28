const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mentor = sequelize.define('mentors', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expertise: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['English']
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  sessions_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  topics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  availability: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Mentor;
