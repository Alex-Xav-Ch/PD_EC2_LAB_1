import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    res.json({
      status: "ok",
      database: "connected",
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.get("/usuarios", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, email, activo, created_at FROM usuarios ORDER BY id",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "No se pudo listar usuarios" });
  }
});

app.post("/usuarios", async (req, res) => {
  const { nombre, email } = req.body ?? {};
  if (!nombre || !email) {
    res.status(400).json({ status: "error", message: "nombre y email son obligatorios" });
    return;
  }
  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING id, nombre, email, activo, created_at",
      [nombre, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "No se pudo crear el usuario" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  const { nombre, email } = req.body ?? {};
  if (!nombre || !email) {
    res.status(400).json({ status: "error", message: "nombre y email son obligatorios" });
    return;
  }
  try {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email, activo, created_at",
      [nombre, email, req.params.id],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ status: "error", message: "Usuario no encontrado" });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "No se pudo actualizar el usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).json({ status: "error", message: "Usuario no encontrado" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "No se pudo eliminar el usuario" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en el puerto ${PORT}`);
});
