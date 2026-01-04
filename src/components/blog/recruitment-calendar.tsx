"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import type { PracticeInfo } from "@/lib/microcms";
import "react-calendar/dist/Calendar.css";

interface RecruitmentCalendarProps {
	initialData: PracticeInfo[];
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function RecruitmentCalendar({ initialData }: RecruitmentCalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Value>(new Date());

	// 練習日の日付文字列をDateオブジェクトに変換
	const practiceEvents = initialData.map((practice) => ({
		...practice,
		dateObj: new Date(practice.date),
	}));

	// 特定の日付に練習があるかチェック
	const getPracticeForDate = (date: Date) => {
		return practiceEvents.filter((practice) => {
			return (
				practice.dateObj.getFullYear() === date.getFullYear() &&
				practice.dateObj.getMonth() === date.getMonth() &&
				practice.dateObj.getDate() === date.getDate()
			);
		});
	};

	// カレンダーのタイルにマークを表示
	const tileContent = ({ date }: { date: Date }) => {
		const practices = getPracticeForDate(date);
		if (practices.length > 0) {
			return (
				<div className="flex justify-center">
					<div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
				</div>
			);
		}
		return null;
	};

	// 選択された日付の練習情報を取得
	const getSelectedDatePractices = () => {
		if (!selectedDate || Array.isArray(selectedDate)) return [];
		return getPracticeForDate(selectedDate);
	};

	const selectedPractices = getSelectedDatePractices();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl flex items-center gap-2">
						<CalendarIcon className="w-5 h-5" />
						練習日程カレンダー
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 sm:p-6">
					<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
						{/* カレンダー */}
						<div className="flex justify-center overflow-x-auto">
							<div className="min-w-0 w-full max-w-sm">
								<Calendar
									onChange={setSelectedDate}
									value={selectedDate}
									tileContent={tileContent}
									className="react-calendar-custom w-full"
									locale="ja-JP"
								/>
							</div>
						</div>

						{/* 選択された日の詳細 */}
						<div>
							<h3 className="text-lg font-semibold mb-4">
								{selectedDate && !Array.isArray(selectedDate)
									? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の練習`
									: "日付を選択してください"}
							</h3>

							{selectedPractices.length > 0 ? (
								<div className="space-y-3">
									{selectedPractices.map((practice, index) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: Safe for simple display list
											key={index}
											className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
										>
											<div className="flex items-start gap-2">
												<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
												<div>
													<span className="font-medium text-blue-900 dark:text-blue-100">
														{practice.location}
													</span>
													<div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
														{new Date(practice.date).toLocaleDateString(
															"ja-JP",
															{
																year: "numeric",
																month: "long",
																day: "numeric",
																weekday: "long",
															},
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 dark:text-gray-400">
									この日は練習の予定がありません
								</p>
							)}
						</div>
					</div>

					{/* 練習予定の一覧 */}
					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-4">今後の練習予定</h3>
						<div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{initialData
								.filter((practice) => new Date(practice.date) >= new Date())
								.sort(
									(a, b) =>
										new Date(a.date).getTime() - new Date(b.date).getTime(),
								)
								.slice(0, 6)
								.map((practice, index) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: Safe for simple display list
										key={index}
										className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
									>
										<div className="flex items-start gap-2">
											<Badge variant="outline" className="text-xs">
												{new Date(practice.date).toLocaleDateString("ja-JP", {
													month: "short",
													day: "numeric",
												})}
											</Badge>
										</div>
										<div className="mt-2 flex items-start gap-2">
											<MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
											<span className="text-sm text-gray-700 dark:text-gray-300">
												{practice.location}
											</span>
										</div>
									</div>
								))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
