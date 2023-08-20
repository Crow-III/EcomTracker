require('dotenv').config();


const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // Specify the appropriate dialect for your database
  // Other configuration options...
});

module.exports = sequelize;