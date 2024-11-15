const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  database: process.env.DB_NAME,
});

// psql -U sabiha -d my_database -h 127.0.0.1


module.exports = pool


