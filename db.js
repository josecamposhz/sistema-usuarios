const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "softlife",
  port: 5432,
});

async function agregarUsuario({ email, password }) {
  try {
    const SQLQuery = {
      text: `INSERT INTO usuarios (email, password) values ($1, $2) RETURNING *;`,
      values: [email, password]
    };

    const result = await pool.query(SQLQuery);

    return result.rows[0];
  } catch (e) {
    throw e;
  }
}

async function eliminarUsuario(email) {
  try {
    const SQLQuery = {
      text: `DELETE FROM usuarios WHERE email = $1;`,
      values: [email]
    };

    await pool.query(SQLQuery);
  } catch (e) {
    throw e;
  }
}

async function getUsuarioByEmail(email) {
  try {
    const SQLQuery = {
      text: `SELECT * FROM usuarios WHERE email = $1;`,
      values: [email]
    };
    const { rows } = await pool.query(SQLQuery);
    if (rows.length === 0) {
      throw 'Usuario no encontrado';
    }
    return rows[0];
  } catch (e) {
    throw e;
  }
}

async function getUsuarios() {
  try {
    const SQLQuery = {
      text: "SELECT * FROM usuarios",
    };
    const result = await pool.query(SQLQuery);
    return result.rows;
  } catch (e) {
    return e;
  }
}
module.exports = { agregarUsuario, eliminarUsuario, getUsuarioByEmail, getUsuarios };
