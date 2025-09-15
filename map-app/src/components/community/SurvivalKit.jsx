import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Globe, BookOpen, Camera } from "lucide-react";
import VisionOCR from "../../pages/VisionOCR";
import QuickTranslator from "./QuickTranslator";
import {
  NeonCard,
  NeonButton,
  GradientText,
  ResponsiveGrid,
  DataDisplay,
} from "../ui/NeonTheme";
export default function SurvivalKit() {
  const [activeSection, setActiveSection] = useState("menu");

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
              label: "Vision OCR",
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

      {/* Vision OCR  */}
      {activeSection === "menu" && (
        <NeonCard>
          <VisionOCR />
        </NeonCard>
      )}

      {/* 빠른 통역 */}
      {activeSection === "translate" && <QuickTranslator />}

      {/* 문화 가이드  */}
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
