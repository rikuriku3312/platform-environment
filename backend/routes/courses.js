const express = require('express');
const router = express.Router();
const db = require('../db');

// コース作成API (POST /api/courses)
router.post('/', async (req, res) => {
  // リクエストボディからコース情報と、誰が作成したかを示す `user_id` を受け取る
  const { title, description, user_id } = req.body;

  // タイトルとuser_idは必須項目とする
  if (!title || !user_id) {
    return res.status(400).json({ message: 'タイトルとユーザーIDは必須です。' });
  }

  try {
    // 受け取った情報をもとに`courses` テーブルに新しい行を挿入する
    const [result] = await db.execute(
      'INSERT INTO courses (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id]
    );

    // 作成に成功したら、201番のステータスと成功メッセージを返す
    res.status(201).json({ message: 'コースが正常に作成されました。', courseId: result.insertId });
  } catch (error) {
    console.error('コース作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// コース一覧取得API (GET /api/courses)
router.get('/', async (req, res) => {
  try {
    // --- ① データベースからコース情報を取得 ---
    // `courses`テーブルと`users`テーブルを結合(JOIN)し、コース情報に加えて作成者のユーザー名も一緒に取得
    const [rows] = await db.execute(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.created_at, 
        u.username 
      FROM courses c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    // --- ② 取得したデータをクライアントに返す ---
    // 取得したコース一覧のデータを、JSON形式で返す
    res.status(200).json(rows);

  } catch (error) {
    // --- ③ エラーハンドリング ---
    console.error('コース一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;