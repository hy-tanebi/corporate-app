"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Mail, Eye, Users, CheckCircle, Heart, Coins } from "lucide-react";
import Image from "next/image";
import { RecruitmentCalendar } from "./recruitment-calendar";
import { ImageModal } from "@/components/ui/image-modal";
import { ApplicationForm } from "./application-form";
import { TableOfContents } from "./table-of-contents";
import { createApplication } from "@/app/actions/application";
import type { GroupInfo } from "@/lib/microcms";
import type { CreateApplicationData } from "@/lib/types/application";
import { toast } from "sonner";

interface RecruitmentContentProps {
  groupInfo: GroupInfo;
}

export function RecruitmentContent({ groupInfo }: RecruitmentContentProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
    title: string;
  } | null>(null);

  const handleImageClick = (url: string, alt: string, title: string) => {
    setSelectedImage({ url, alt, title });
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleApplicationSubmit = async (data: CreateApplicationData) => {
    try {
      const result = await createApplication(data);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("送信中にエラーが発生しました。");
    }
  };
  return (
    <div className="min-h-screen relative">
      {/* 目次コンポーネント */}
      <TableOfContents />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {groupInfo.groupName}
          </h2>
          <h3 className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6">
            一緒に音楽を奏でる仲間を募集しています
          </h3>
        </div>

        <div className="space-y-8">
          {/* 活動内容 */}
          <Card id="activity-content">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Music className="w-5 h-5" />
                活動内容
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: groupInfo.description }}
              />
            </CardContent>
          </Card>

          {/* 練習日程カレンダー */}
          <div id="practice-schedule">
            <RecruitmentCalendar initialData={groupInfo.practiceInfo} />
          </div>

          {/* 使用楽器 */}
          <Card id="instruments">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Music className="w-5 h-5" />
                使用楽器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupInfo.instruments.map((instrument, index) => (
                  <div key={index} className="text-center">
                    {instrument.instrumentImage && (
                      <div className="mb-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            instrument.instrumentImage &&
                            handleImageClick(
                              instrument.instrumentImage.url,
                              instrument.instrumentName,
                              instrument.instrumentName
                            )
                          }
                          className="group relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Image
                            src={instrument.instrumentImage.url}
                            alt={instrument.instrumentName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 128px, 160px"
                          />
                          {/* Overlay for better UX */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                            <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              クリックで拡大
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {instrument.instrumentName}
                    </h3>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 参加の流れ */}
          <Card id="participation-flow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Heart className="w-5 h-5" />
                参加の流れ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* 見学 */}
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <Eye className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      見学
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      練習の様子を自由に見学いただけます。<br />
                      いつでも大歓迎です！
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        完全無料・事前連絡不要
                      </p>
                    </div>
                  </div>

                  {/* 体験参加 */}
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      体験参加
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      実際に楽器を触って一緒に演奏してみましょう。<br />
                      こちらもいつでも大歓迎です！
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        手ぶらでOK・楽器レンタル無料
                      </p>
                    </div>
                  </div>
                </div>

                {/* 料金体系 */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-orange-500" />
                    料金について
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">初回体験</h5>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">無料</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">楽器レンタル込み</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">2回目以降</h5>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">¥1,000</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">1回あたり・楽器レンタル込み</p>
                    </div>
                  </div>
                </div>

                {/* 補足情報 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    ご参加にあたって
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      楽器の経験がなくても大丈夫です
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      楽器は全て無料でレンタルできます
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      見学・体験参加ともに事前連絡不要です
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      ご質問があればお気軽にお声がけください
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* お問い合わせ・応募フォーム */}
          <div id="application-form">
            <ApplicationForm onSubmit={handleApplicationSubmit} />
          </div>

          {/* 従来のメール連絡先 */}
          <Card id="contact-email" className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                または直接メールでお問い合わせ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  フォームでの応募が難しい場合は、メールでもお気軽にご連絡ください。
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <a
                    href={`mailto:${groupInfo.applicationEmail}`}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                  >
                    {groupInfo.applicationEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 最下部の余白（目次の動作を改善するため） */}
        <div className="h-96"></div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={handleCloseModal}
        imageUrl={selectedImage?.url || ""}
        imageAlt={selectedImage?.alt || ""}
        title={selectedImage?.title || ""}
      />
    </div>
  );
}