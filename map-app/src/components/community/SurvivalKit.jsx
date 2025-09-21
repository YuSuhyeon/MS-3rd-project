import React, { useState } from "react";
import { Globe, BookOpen, Camera } from "lucide-react";
import QuickTranslator from "./QuickTranslator";
import OCR from "../../pages/VisionOCR";
import {
  NeonCard,
  NeonButton,
  GradientText,
  ResponsiveGrid,
} from "../ui/NeonTheme";
import { useTranslation } from "react-i18next";

export default function SurvivalKit() {
  const [activeSection, setActiveSection] = useState("menu");
  // const [translateText, setTranslateText] = useState("");
  // const [translatedText, setTranslatedText] = useState("");
  // const [isTranslating, setIsTranslating] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const { t } = useTranslation("SurvivalKit");
  // const handleTranslate = async () => {};

  // const quickPhrases = [];

  const cultureGuide = [
    {
      title: t("greeting"),
      content: t("greeting_content"),
      extra: t("greeting_extra"),
      icon: "🙇‍♀️",
      modaldata: {
        title: t("greeting_modal_title"),
        paragraphs: [
          t("greeting_modal_paragraphs"),
          t("greeting_modal_paragraphs_2"),
        ],
        list: [
          t("greeting_modal_list_1"),
          t("greeting_modal_list_2"),
          t("greeting_modal_list_3"),
          t("greeting_modal_list_4"),
          t("greeting_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("greeting_modal_link_1"),
            url: "https://www.youtube.com/watch?v=oAFRq1Zz-9A",
          },
        ],
      },
    },
    {
      title: t("meal"),
      content: t("meal_content"),
      extra: t("meal_extra"),
      icon: "🍽️",
      modaldata: {
        title: t("meal_modal_title"),
        paragraphs: [t("meal_modal_paragraphs"), t("meal_modal_paragraphs_2")],
        list: [
          t("meal_modal_list_1"),
          t("meal_modal_list_2"),
          t("meal_modal_list_3"),
          t("meal_modal_list_4"),
          t("meal_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("meal_modal_link_1"),
            url: "https://www.youtube.com/watch?v=B5GwksUY8dw",
          },
        ],
      },
    },
    {
      title: t("transportation"),
      content: t("transportation_content"),
      extra: t("transportation_extra"),
      icon: "🚇",
      modaldata: {
        title: t("transportation_modal_title"),
        paragraphs: [
          t("transportation_modal_paragraphs"),
          t("transportation_modal_paragraphs_2"),
        ],
        list: [
          t("transportation_modal_list_1"),
          t("transportation_modal_list_2"),
          t("transportation_modal_list_3"),
          t("transportation_modal_list_4"),
          t("transportation_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("transportation_modal_link_1"),
            url: "https://www.youtube.com/watch?v=OQibRFJtPXo",
          },
          {
            text: "🚇 " + t("transportation_modal_link_2"),
            url: "https://korean.visitseoul.net/subway",
          },
        ],
      },
    },
    {
      title: t("tip"),
      content: t("tip_content"),
      extra: t("tip_extra"),
      icon: "💰",
      modaldata: {
        title: t("tip_modal_title"),
        paragraphs: [t("tip_modal_paragraphs")],
        list: [
          t("tip_modal_list_1"),
          t("tip_modal_list_2"),
          t("tip_modal_list_3"),
        ],
      },
    },
    {
      title: t("footwear"),
      content: t("footwear_content"),
      extra: t("footwear_extra"),
      icon: "👟",
      modaldata: {
        title: t("footwear_modal_title"),
        paragraphs: [
          t("footwear_modal_paragraphs"),
          t("footwear_modal_paragraphs_2"),
          t("footwear_modal_paragraphs_3"),
        ],
        list: [t("footwear_modal_list_1"), t("footwear_modal_list_2")],
      },
    },
    {
      title: t("gift"),
      content: t("gift_content"),
      extra: t("gift_extra"),
      icon: "🎁",
      modaldata: {
        title: t("gift_modal_title"),
        paragraphs: [t("gift_modal_paragraphs"), t("gift_modal_paragraphs_2")],
        list: [t("gift_modal_list_1"), t("gift_modal_list_2")],
      },
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* 네온 섹션 네비게이션 */}
      <NeonCard className="p-1">
        <div className="flex gap-1" style={{ overflow: "auto" }}>
          {[
            {
              id: "menu",
              label: t("vision_ocr"),
              icon: <Camera />,
              variant: "primary",
            },
            {
              id: "translate",
              label: t("quick_translator"),
              icon: <Globe />,
              variant: "success",
            },
            {
              id: "culture",
              label: t("culture_guide"),
              icon: <BookOpen />,
              variant: "warning",
            },
          ].map(({ id, label, icon, variant }) => (
            <NeonButton
              key={id}
              variant={activeSection === id ? variant : "secondary"}
              size="sm"
              onClick={() => setActiveSection(id)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2 min-w-0"
            >
              {icon}
              <span className="font-medium text-xs text-center leading-tight">{label}</span>
            </NeonButton>
          ))}
        </div>
      </NeonCard>
      {/* Vision OCR */}
      {activeSection === "menu" && (
        <OCR />
        // <NeonCard>
        //   <VisionOCR />
        // </NeonCard>
      )}
      {/* 빠른 통역 */}
      {activeSection === "translate" && <QuickTranslator />}
      {/* 문화 가이드  */}
      {activeSection === "culture" && (
        <ResponsiveGrid>
          {cultureGuide.map((guide, index) => (
            <NeonCard
              key={index}
              variant="default"
              className="p-6 text-center hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setSelectedGuide(guide)}
            >
              <div className="text-4xl mb-4">{guide.icon}</div>
              <GradientText variant="primary" size="lg" className="block mb-3">
                {guide.title}
              </GradientText>
              <p className="text-gray-300 leading-relaxed">{guide.content}</p>
            </NeonCard>
          ))}
        </ResponsiveGrid>
      )}{" "}
      {/* 팝업 (Modal) - 프래그먼트 제거해서 단일 노드로 */}
      {selectedGuide && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-auto max-w-lg sm:max-w-xl lg:max-w-3xl mx-4 p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                console.log("❌ 팝업 닫힘");
                setSelectedGuide(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            {/* 모달 제목 */}
            <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-6">
              {selectedGuide.modaldata?.title || selectedGuide.title}
            </h2>

            {/* 본문 */}
            {selectedGuide.modaldata?.paragraphs?.map((para, i) => (
              <p key={i} className="text-gray-700 mb-3">
                {para}
              </p>
            ))}

            {/* 리스트 */}
            {selectedGuide.modaldata?.list && (
              <ul className="list-disc list-inside text-gray-700 mb-3">
                {selectedGuide.modaldata.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {/* 링크 */}
            {selectedGuide.modaldata?.links && (
              <div className="mt-4 space-y-2">
                {selectedGuide.modaldata.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
