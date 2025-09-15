import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Globe, BookOpen, Camera } from "lucide-react";
import VisionOCR from "../../pages/VisionOCR";
import {
  NeonCard,
  NeonButton,
  GradientText,
  ResponsiveGrid,
  DataDisplay,
} from "../ui/NeonTheme";
export default function SurvivalKit() {
  const [activeSection, setActiveSection] = useState("menu");
  const [translateText, setTranslateText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!translateText.trim()) return;

    setIsTranslating(true);
    // Simulate translation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const translations = {
      안녕하세요: "Hello / こんにちは / 你好",
      감사합니다: "Thank you / ありがとうございます / 谢谢",
      "화장실이 어디에 있나요?":
        "Where is the bathroom? / トイレはどこですか？ / 洗手间在哪里？",
      "얼마예요?": "How much is it? / いくらですか？ / 多少钱？",
      도와주세요: "Help me / 助けてください / 请帮助我",
    };

    setTranslatedText(
      translations[translateText] || "Translation not available"
    );
    setIsTranslating(false);
  };

  const quickPhrases = [
    { korean: "안녕하세요", english: "Hello", category: "인사" },
    { korean: "감사합니다", english: "Thank you", category: "인사" },
    { korean: "죄송합니다", english: "Sorry", category: "인사" },
    {
      korean: "화장실이 어디에 있나요?",
      english: "Where is the bathroom?",
      category: "필수",
    },
    { korean: "얼마예요?", english: "How much is it?", category: "쇼핑" },
    { korean: "메뉴 주세요", english: "Menu please", category: "음식" },
    { korean: "도와주세요", english: "Help me", category: "응급" },
    { korean: "길을 잃었어요", english: "I'm lost", category: "응급" },
  ];

  const cultureGuide = [
    {
      title: "인사 예절",
      content:
        "한국에서는 나이가 많은 사람에게 먼저 인사하고, 고개를 숙여 인사합니다.",
      icon: "🙇‍♀️",
    },
    {
      title: "식사 예절",
      content:
        "어른이 먼저 수저를 들고, 밥그릇을 들고 먹지 않습니다. 술은 양손으로 받습니다.",
      icon: "🍽️",
    },
    {
      title: "대중교통",
      content: "지하철에서는 노약자석을 양보하고, 큰 소리로 통화하지 않습니다.",
      icon: "🚇",
    },
    {
      title: "팁 문화",
      content: "한국은 팁 문화가 없습니다. 서비스 요금이 이미 포함되어 있어요.",
      icon: "💰",
    },
    {
      title: "신발 벗기",
      content: "한국 가정이나 일부 식당에서는 신발을 벗고 들어갑니다.",
      icon: "👟",
    },
    {
      title: "선물 예절",
      content:
        "선물을 받을 때는 양손으로 받고, 바로 뜯지 않는 것이 예의입니다.",
      icon: "🎁",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 네온 섹션 네비게이션 [1] */}
      <NeonCard className="p-1">
        <div className="flex gap-1">
          {[
            {
              id: "menu",
              label: "메뉴 인식기",
              icon: <Camera />,
              variant: "primary",
            },
            {
              id: "translate",
              label: "빠른 통역",
              icon: <Globe />,
              variant: "success",
            },
            {
              id: "culture",
              label: "한국 문화 가이드",
              icon: <BookOpen />,
              variant: "warning",
            },
          ].map(({ id, label, icon, variant }) => (
            <NeonButton
              key={id}
              variant={activeSection === id ? variant : "secondary"}
              size="md"
              onClick={() => setActiveSection(id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4"
            >
              {icon}
              <span className="font-medium">{label}</span>
            </NeonButton>
          ))}
        </div>
      </NeonCard>

      {/* 메뉴 인식기 섹션 - 네온 카드로 래핑 */}
      {activeSection === "menu" && (
        <NeonCard
          title="🔍 스마트 메뉴 인식기"
          variant="primary"
          className="p-6"
        >
          <GradientText variant="secondary" size="sm" className="mb-4">
            메뉴 사진을 업로드하면 AI가 텍스트를 인식해드려요
          </GradientText>
          <VisionOCR />
        </NeonCard>
      )}

      {/* 번역 섹션 - 네온 카드들 */}
      {activeSection === "translate" && (
        <ResponsiveGrid className="grid-cols-1 lg:grid-cols-2">
          <NeonCard title="🌐 실시간 번역기" variant="success" className="p-6">
            <div className="space-y-4">
              <div>
                <GradientText
                  variant="secondary"
                  size="sm"
                  className="block mb-2"
                >
                  한국어 입력
                </GradientText>
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="번역할 텍스트를 입력하세요..."
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <NeonButton
                variant="success"
                size="lg"
                onClick={handleTranslate}
                disabled={!translateText.trim() || isTranslating}
                className="w-full"
              >
                {isTranslating ? "번역중..." : "✨ 번역하기"}
              </NeonButton>

              {translatedText && (
                <NeonCard variant="primary" className="mt-4">
                  <GradientText
                    variant="primary"
                    size="sm"
                    className="block mb-2"
                  >
                    번역 결과
                  </GradientText>
                  <p className="text-gray-100">{translatedText}</p>
                </NeonCard>
              )}
            </div>
          </NeonCard>

          {/* 자주 쓰는 표현 네온 카드 */}
          <NeonCard title="⚡ 자주 쓰는 표현" variant="warning" className="p-6">
            <div className="space-y-3">
              {quickPhrases.map((phrase, index) => (
                <NeonCard
                  key={index}
                  variant="default"
                  className="p-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setTranslateText(phrase.korean)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white">
                      {phrase.korean}
                    </span>
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full">
                      {phrase.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {phrase.english}
                  </span>
                </NeonCard>
              ))}
            </div>
          </NeonCard>
        </ResponsiveGrid>
      )}

      {/* 문화 가이드 섹션 - 네온 그리드 */}
      {activeSection === "culture" && (
        <ResponsiveGrid>
          {cultureGuide.map((guide, index) => (
            <NeonCard
              key={index}
              variant={guide.variant}
              className="p-6 text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">{guide.icon}</div>
              <GradientText variant="primary" size="lg" className="block mb-3">
                {guide.title}
              </GradientText>
              <p className="text-gray-300 leading-relaxed">{guide.content}</p>
            </NeonCard>
          ))}
        </ResponsiveGrid>
      )}
    </div>
  );
}
