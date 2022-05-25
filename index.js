const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const db = require('./db');
const requiresAuth = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/private", requiresAuth, (req, res) => {
  res.send(`
    <h1>Bienvenido ${req.user.email}</h1>
    <h2>Fecha de generación del token: ${new Date(req.user.iat * 1000)}</h2>
    <h2>Fecha de caducidad del token: ${new Date(req.user.exp * 1000)}</h2>
    `);
});

app.get("/private2", requiresAuth, (req, res) => {
  res.send(`
    <h1>Bienvenido ${req.user.email}</h1>
    <h2>Fecha de generación del token: ${new Date(req.user.iat * 1000)}</h2>
    <h2>Fecha de caducidad del token: ${new Date(req.user.exp * 1000)}</h2>
    `);
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.agregarUsuario({ email, password: hashedPassword });
    res.status(201).json(result);
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.getUsuarioByEmail(email);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 60 * 60 * 24 });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await db.getUsuarios();
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).send(error)
  }
});

app.delete("/usuarios/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await db.eliminarUsuario(email);
    res.status(201).json('Usuario eliminado con éxito');
  } catch (error) {
    res.status(500).send(error);
  }
});