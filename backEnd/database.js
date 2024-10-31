const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  user: 'sabiha',
  password: 'sabiha123',
  host: '127.0.0.1',
  port: 5432, 
  database: 'my_database',
});

// psql -U sabiha -d my_database -h 127.0.0.1


module.exports = pool
