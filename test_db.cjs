const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lancar_jaya_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err.stack);
    return;
  }
  console.log('Connected successfully as ID', connection.threadId);
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    connection.end();
  });
});
