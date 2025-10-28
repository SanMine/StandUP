const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('courses', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  instructor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    allowNull: false,
    defaultValue: 'Beginner'
  },
  price: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  students_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  topics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Course;
