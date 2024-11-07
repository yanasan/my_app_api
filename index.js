// 必要なモジュールの読み込み
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const winston = require('winston');  // ログのためにwinstonを使用

// .envの設定を読み込む
dotenv.config();

// PostgreSQL接続設定
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // SSLエラーを無視（自己署名証明書の場合）
  },
});


// Expressアプリケーションの設定
const app = express();
app.use(express.json());  // JSONのリクエストボディをパース

// ログ設定 (Winston)
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// ユーザー追加API (POST)
// ユーザー追加API (POST)
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    const newUser = result.rows[0];
    logger.info(`New user added: ${newUser.name} (${newUser.email})`);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error detail:", error);  // エラー内容を詳細に表示
    return res.status(500).json({ error: `Failed to add user: ${error.message}` });
  }
});


// ユーザー取得API (GET)
// ユーザー一覧取得API (GET)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    const users = result.rows;
    return res.status(200).json(users);  // ユーザー一覧をJSONで返す
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});


// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port  http://localhost:${PORT}`);
});
