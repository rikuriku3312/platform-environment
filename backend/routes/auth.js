// 必要なライブラリを読み込む
const express = require('express'); // Webサーバーのフレームワーク
const router = express.Router();    // URLごとに処理を分けるための部品
const bcrypt = require('bcrypt');   // パスワードをハッシュ化するライブラリ
const db = require('../db');        // データベースに接続するための設定ファイル
const jwt = require('jsonwebtoken');// JWT認証を行う

// ユーザー登録API (POST /api/auth/register)
router.post('/register', async (req, res) => {
  // ブラウザから送られてきたJSONデータからusername, email, passwordを取り出す
  const { username, email, password } = req.body;

  // 必要な情報が全て揃っているかを確認
  if (!username || !email || !password) {
    return res.status(400).json({ message: '全てのフィールドを入力してください。' });
  }

  // データベースへの保存処理
  try {
    // パスワードをハッシュ化、10はハッシュ化の複雑さのレベル
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL文を実行して、ユーザー情報を`users`テーブルに挿入
    // `?` はプレースホルダーで、後から安全に値を埋め込むためのもの
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword] // `?`に埋め込む値
    );

    // 成功したら201番のステータスコードと成功メッセージを返す
    res.status(201).json({ message: 'ユーザーが正常に登録されました。', userId: result.insertId });

  } catch (error) {
    // ユーザー名やメールアドレスが既に使われているかを確認
    if (error.code === 'ER_DUP_ENTRY') {
      // 409番のエラー（競合）を返す
      return res.status(409).json({ message: 'ユーザー名またはメールアドレスは既に使用されています。' });
    }
    // それ以外の予期せぬエラーが起きた場合
    console.error('登録エラー:', error);
    // 500番のエラー（サーバー内部エラー）を返す
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// ユーザーログインAPI (POST /api/auth/login)
router.post('/login', async (req, res) => {
  // リクエストから情報を取り出す
  const { email, password } = req.body;

  // 入力チェック
  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
  }

  try {
    // ユーザーをデータベースから探す
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    // ユーザーが見つからなかった場合
    if (rows.length === 0) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    // 見つかったユーザー情報を取得
    const user = rows[0];

    // 送られてきた生のパスワードと、DBに保存されているハッシュ化されたパスワードを比較
    const match = await bcrypt.compare(password, user.password);

    // パスワード一致時、JWTを生成する
    if (match) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // トークンの有効期限
      );
      
      // パスワードが一致した場合、200番のステータスコードと成功メッセージを返す
      res.status(200).json({ message: 'ログインに成功しました。', token: token });
    } else {
      // パスワードが一致しなかった場合、認証失敗のメッセージを返す
      res.status(401).json({ message: '認証に失敗しました。' });
    }
  } catch (error) {
    // エラーハンドリング
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// このファイルで作ったルーティング設定を他のファイルでも使えるようにする
module.exports = router;