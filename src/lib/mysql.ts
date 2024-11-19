import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Substitua pelo seu usuário
  password: "!wVB3=Yx#y?4.p_?XUTN", // Substitua pela sua senha
  database: "admin_db",
});

export default pool;
