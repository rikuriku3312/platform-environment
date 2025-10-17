const mysql = require('mysql2/promise');

// .envファイルから環境変数を読み込む
require('dotenv').config();

// プールの作成
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// poolを外部ファイルでも利用できるようにする
module.exports = pool;