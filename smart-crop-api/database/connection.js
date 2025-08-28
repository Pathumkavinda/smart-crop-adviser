// database/connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,   // MySQL default port
    dialect: 'mysql',                    // changed from 'postgres' to 'mysql'
    logging: false,                      // set true for SQL logs
  }
);

module.exports = sequelize;
