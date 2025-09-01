"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Mail } from "lucide-react";
import Image from "next/image";
import { RecruitmentCalendar } from "./recruitment-calendar";
import { ImageModal } from "@/components/ui/image-modal";
import { ApplicationForm } from "./application-form";
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
    <div className="min-h-screen">
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
          <Card>
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
          <RecruitmentCalendar initialData={groupInfo.practiceInfo} />

          {/* 使用楽器 */}
          <Card>
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

          {/* お問い合わせ・応募フォーム */}
          <ApplicationForm onSubmit={handleApplicationSubmit} />

          {/* 従来のメール連絡先 */}
          <Card className="border border-gray-200 dark:border-gray-700">
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