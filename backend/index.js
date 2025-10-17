require('dotenv').config();
const express = require('express');
const db = require('./db');
// 追加したライブラリとファイルを読み込む
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

const app = express();
const port = 3001;

// サーバーの設定を追加
// body-parserを使って、JSON形式のリクエストを解析できるようにする
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to SLPLMS Backend!');
});

// それぞれのURLへのリクエストを処理
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// サーバ起動
app.listen(port, async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
  console.log(`Server is running on http://localhost:${port}`);
});