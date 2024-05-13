const express = require("express");
const { Pool } = require("pg");
const cors = require("cors"); // Импорт CORS
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Включение CORS для всех доменов
app.use(express.json()); // Middleware для парсинга JSON

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + path.extname(file.originalname)) // сохраняем с уникальным идентификатором
  }
});
const upload = multer({ storage: storage });

// Параметры подключения к базе данных
const pool = new Pool({
  user: "admin",
  host: "147.232.24.160",
  database: "face_detector_test",
  password: "root",
  port: 5432,
});

// Маршрут для получения всех студентов
app.get("/students", async (req, res) => {
  try {
    const query = "SELECT id, name, major, starting_year, total_attendance, standing, year, last_attendance_time, photo FROM student;";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового студента
app.post('/students', upload.single('photo'), async (req, res) => {
  const { name, major, starting_year, standing, year } = req.body;
  const total_attendance = req.body.total_attendance || 0;  // Получаем из тела запроса или используем 0
  const last_attendance_time = req.body.last_attendance_time || null; // Получаем из тела запроса или используем null

  try {
    const query = "INSERT INTO student (name, major, starting_year, total_attendance, standing, year, last_attendance_time, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;";
    const values = [name, major, starting_year, total_attendance, standing, year, last_attendance_time, req.file.buffer];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ success: true, student: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// Маршрут для проверки пароля
app.post('/verifyPassword', async (req, res) => {
  const { password } = req.body;
  const userId = 1; // Фиксированный ID для демонстрации

  try {
      const query = "SELECT password_hash FROM user_passwords WHERE id = $1;";
      const result = await pool.query(query, [userId]);
      if (result.rows.length > 0) {
          const storedPassword = result.rows[0].password_hash; // Используйте правильное имя столбца
          if (password === storedPassword) {
              res.json({ success: true });
          } else {
              res.status(401).json({ success: false, message: "Invalid password" });
          }
      } else {
          res.status(404).json({ message: "User not found" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});





app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
