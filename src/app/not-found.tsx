import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">ページが見つかりません</h2>
        <p className="text-lg mb-8">お探しのページは存在しないか、移動された可能性があります。</p>
        <Link 
          href="/"
          className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}