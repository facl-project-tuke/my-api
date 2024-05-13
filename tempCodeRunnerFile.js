const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Параметры подключения к базе данных
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "my_local_db",
  password: "mypassword",
  port: 5432,
});

// Маршрут для получения всех студентов
app.get("/students", async (req, res) => {
  try {
    const query = "SELECT id, name, major, starting_year, total_attendance, standing, year, last_attendance_time FROM student;";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового студента
app.post('/students', async (req, res) => {
  const { name, major, starting_year, total_attendance, standing, year, last_attendance_time } = req.body;
  try {
    const query = "INSERT INTO student (name, major, starting_year, total_attendance, standing, year, last_attendance_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;";
    const { rows } = await pool.query(query, [name, major, starting_year, total_attendance, standing, year, last_attendance_time]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для удаления студента по ID
app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM student WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    if (rows.length) {
      res.json({ message: "Студент удален", student: rows[0] });
    } else {
      res.status(404).json({ message: "Студент не найден" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для обновления данных студента
app.patch('/students/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const allowedUpdates = ['name', 'major', 'starting_year', 'total_attendance', 'standing', 'year', 'last_attendance_time'];
  const setClause = Object.keys(updates).filter(key => allowedUpdates.includes(key)).map(key => `${key} = $${Object.keys(updates).indexOf(key) + 1}`).join(", ");
  const values = Object.values(updates);

  if (!setClause.length) {
    return res.status(400).json({ error: "Нет данных для обновления" });
  }

  try {
    const query = `UPDATE student SET ${setClause} WHERE id = $${Object.keys(updates).length + 1} RETURNING *;`;
    const { rows } = await pool.query(query, [...values, id]);
    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Студент не найден" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
