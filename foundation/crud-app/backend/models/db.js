import mysql from "mysql2";

const pool = mysql.createPool({
  host: "mysql",       // docker-compose service name
  user: "root",
  password: "Arela@2327",
  database: "cruddb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool.promise();

