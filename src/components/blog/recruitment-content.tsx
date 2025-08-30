import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Briefcase, Mail, ExternalLink } from "lucide-react";

export function RecruitmentContent() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          一緒に働く仲間を募集しています
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          革新的なプロダクトを一緒に作り上げる、情熱的なエンジニアを募集しています。
          リモートワーク中心の柔軟な働き方で、技術力を高めながら成長できる環境です。
        </p>
      </div>

      {/* 募集職種 */}
      <div className="grid gap-8 md:gap-6">
        {/* フロントエンドエンジニア */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">フロントエンドエンジニア</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                急募
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">業務内容</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Webアプリケーションのフロントエンド開発</li>
                  <li>• UIコンポーネントの設計・実装</li>
                  <li>• パフォーマンス最適化・ユーザビリティ改善</li>
                  <li>• デザイナーとの協業によるUI/UX実装</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">必須スキル</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• React/Next.js の実務経験 2年以上</li>
                    <li>• TypeScript の実務経験</li>
                    <li>• レスポンシブデザインの実装経験</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">歓迎スキル</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Three.js / WebGL の経験</li>
                    <li>• Tailwind CSS の経験</li>
                    <li>• パフォーマンス最適化の経験</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* バックエンドエンジニア */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">バックエンドエンジニア</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">AWS</Badge>
                </div>
              </div>
              <Badge variant="outline">募集中</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">業務内容</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• API設計・開発</li>
                  <li>• データベース設計・最適化</li>
                  <li>• インフラ構築・運用</li>
                  <li>• パフォーマンスモニタリング</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">必須スキル</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Node.js または Python の実務経験</li>
                    <li>• データベース設計・運用経験</li>
                    <li>• REST API 開発経験</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">歓迎スキル</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• AWS / GCP の実務経験</li>
                    <li>• Docker / Kubernetes の経験</li>
                    <li>• CI/CD パイプラインの構築経験</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 労働条件・待遇 */}
        <Card className="bg-gray-50 dark:bg-white border-gray-200 dark:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              労働条件・待遇
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">勤務地</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      フルリモート（月1回程度の出社あり）<br />
                      本社: 東京都渋谷区
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">勤務時間</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      フレックスタイム制<br />
                      コアタイム: 10:00-15:00
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">雇用形態</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      正社員 / 業務委託<br />
                      試用期間: 3ヶ月
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">福利厚生</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 書籍・学習費用補助（月3万円まで）</li>
                    <li>• 最新設備支給（MacBook Pro等）</li>
                    <li>• 健康診断・各種保険完備</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 応募方法 */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="w-5 h-5" />
              応募方法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                ご興味をお持ちいただいた方は、以下の方法でご応募ください。
                カジュアル面談からでも大歓迎です。
              </p>
              
              <div className="space-y-3">
                <a
                  href="mailto:recruit@example.com"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  recruit@example.com
                </a>
                
                <a
                  href="https://forms.example.com/recruitment"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  応募フォーム
                </a>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-50 p-4 rounded-lg border border-blue-200 dark:border-blue-300">
                <h4 className="font-semibold text-blue-900 dark:text-blue-900 mb-2">
                  応募時にお送りください
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-800 space-y-1">
                  <li>• 履歴書・職務経歴書</li>
                  <li>• ポートフォリオ（GitHub等）</li>
                  <li>• 志望動機（簡潔で構いません）</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}