const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Параметры подключения к базе данных
const pool = new Pool({
  user: 'admin',
  host: '147.232.24.160',
  database: 'face_detector_test',
  password: 'root',
  port: 5432,
});

// Маршрут для получения всех таблиц
app.get('/', async (req, res) => {
    try {
      const query = "SELECT id, name FROM students;";
      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error(error);  // Добавлено логирование ошибки в консоль
      res.status(500).json({ error: error.message });
    }
  });
  

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

