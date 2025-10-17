// 非同期でコースデータを取得する専門の関数
async function getCourses() {
  // バックエンドのコース一覧APIにリクエストを送信
  // Docker使用のため変更：const res = await fetch('http://localhost:3001/api/courses', { cache: 'no-store' });
  const res = await fetch('http://backend:3001/api/courses', { cache: 'no-store' });

  // レスポンスが正常でない場合
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }

  // レスポンスのJSONデータを返却
  return res.json();
}

// ホームページ本体のコンポーネント
// `async` をつけることで、このコンポーネント内で非同期処理（await）が使用可能
export default async function Home() {
  // コースデータを取得
  const courses = await getCourses();

  // 取得したデータを使って画面を描画
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">コース一覧</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* 取得したコースの配列を `map` で繰り返し処理 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                // `key` はReactがリストの各要素を識別するために必要
                <div key={course.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-gray-700 mb-4">{course.description}</p>
                    <div className="text-sm text-gray-500">
                      <span>作成者: {course.username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}