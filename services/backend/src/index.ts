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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en el puerto ${PORT}`);
});
