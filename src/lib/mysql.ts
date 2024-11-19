import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Substitua pelo seu usuário
  password: "OB*(2x_M4,wVYU.wwee", // Substitua pela sua senha
  database: "admin_db",
});

export default pool;
