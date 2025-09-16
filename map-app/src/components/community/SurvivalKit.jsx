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
import { useTranslation } from "react-i18next";

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
      extra:
        "보통 가벼운 목례만으로도 충분하며, 두 손으로 악수하면 더 공손하게 보입니다.",
      icon: "🙇‍♀️",
      modaldata: {
        title: "한국의 존댓말과 기본 인사 표현",
        paragraphs: [
          "한국에는 존댓말과 반말이 있어서 인사 표현도 상황에 따라 달라집니다.",
          "친구끼리는 '안녕'이라고 하지만, 어른이나 처음 만난 사람에게는 반드시 '안녕하세요'라고 해야 예의입니다.",
        ],
        list: [
          "안녕하세요 (일상 존댓말)",
          "안녕하십니까 (격식)",
          "안녕 (친한 사이, 반말)",
          "감사합니다 / 고맙습니다 / 고마워",
          "죄송합니다 / 미안합니다 / 미안해",
        ],
        links: [
          {
            text: "🎥 한국 사람들에게 인사하는 방법",
            url: "https://www.youtube.com/watch?v=oAFRq1Zz-9A",
          },
        ],
      },
    },
    {
      title: "식사 예절",
      content:
        "어른이 먼저 수저를 들고, 밥그릇을 들고 먹지 않습니다. 술은 양손으로 받습니다.",
      extra:
        "밥을 다 먹은 후에는 젓가락을 그릇 위에 가지런히 올려두는 것이 예의입니다.",
      icon: "🍽️",
      modaldata: {
        title: "한국의 식사 예절",
        paragraphs: [
          "한국에서 식사는 단순히 음식을 먹는 것이 아니라 상대방을 존중하는 중요한 자리입니다.",
          "식사 전에는 '잘 먹겠습니다', 식사 후에는 '잘 먹었습니다'라고 인사하며, 이는 준비한 사람과 함께한 사람 모두에 대한 존중을 의미합니다.",
        ],
        list: [
          "자리에 앉을 때는 연장자나 손님이 먼저 앉습니다.",
          "젓가락을 밥그릇에 꽂지 않습니다.",
          "술을 마실 때는 고개를 살짝 돌려서 마십니다.",
          "큰 소리로 씹거나 젓가락으로 사람을 가리키는 것은 실례입니다.",
          "그릇은 식탁 위에 놓고 먹습니다.",
        ],
        links: [
          {
            text: "🎥 한국인의 식사 예절",
            url: "https://www.youtube.com/watch?v=B5GwksUY8dw",
          },
        ],
      },
    },
    {
      title: "대중교통",
      content: "지하철에서는 노약자석을 양보하고, 큰 소리로 통화하지 않습니다.",
      extra: "혼잡한 시간대에는 가방을 앞으로 메는 것이 배려하는 태도입니다.",
      icon: "🚇",
      modaldata: {
        title: "한국의 대중교통",
        paragraphs: [
          "한국의 지하철과 버스는 매우 편리하지만, 좌석과 행동 예절을 지키는 것이 중요합니다.",
          "특히 노약자석과 임산부 배려석은 외국인들이 헷갈리기 쉬운데, 비어 있어도 앉지 않는 것이 일반적인 문화입니다.",
        ],
        list: [
          "노약자석은 노인, 장애인, 임산부 전용 좌석으로, 젊은 사람은 사용하지 않습니다.",
          "임산부 배려석(핑크좌석)은 임산부가 언제든 사용할 수 있도록 비워둡니다.",
          "대중교통 내에서는 큰 소리로 통화하지 않습니다.",
          "가방은 앞으로 메거나 내려놓아 다른 승객을 배려합니다.",
          "탑승 시에는 하차 승객이 먼저 내린 후 차례대로 승차합니다.",
        ],
        links: [
          {
            text: "🎥 한국 대중교통 이용",
            url: "https://www.youtube.com/watch?v=OQibRFJtPXo",
          },
          {
            text: "🚇 서울에서 지하철 이용하기",
            url: "https://korean.visitseoul.net/subway",
          },
        ],
      },
    },
    {
      title: "팁 문화",
      content: "한국은 팁 문화가 없습니다. 서비스 요금이 이미 포함되어 있어요.",
      extra:
        "관광지 일부 호텔은 예외적으로 소액의 팁을 주기도 하지만 필수는 아닙니다.",
      icon: "💰",
      modaldata: {
        title: "한국의 팁 문화",
        paragraphs: ["한국의 팁 문화는 서양과 달리 거의 존재하지 않습니다."],
        list: [
          "식당·카페: 팁 불필요",
          "택시: 정해진 요금만 지불",
          "미용실·마사지 등 서비스업: 팁 문화 없음",
        ],
      },
    },
    {
      title: "신발 벗기",
      content: "한국 가정이나 일부 식당에서는 신발을 벗고 들어갑니다.",
      extra:
        "신발장은 보통 입구에 있으며, 실내화가 준비되어 있는 경우가 많습니다.",
      icon: "👟",
      modaldata: {
        title: "한국의 신발 벗기 문화",
        paragraphs: [
          "한국에서는 집에 들어갈 때 신발을 벗는 것이 당연한 문화로 자리 잡고 있습니다.",
          "이는 실내를 청결하게 유지하고 가족의 건강을 지키기 위한 전통적인 습관입니다.",
          "실내에서는 신발 대신 슬리퍼를 신거나 양말만 신고 생활하는 경우가 많습니다.",
        ],
        list: [
          "가정집: 현관에서 신발을 벗고 들어감",
          "전통 한식당·한옥: 좌식 구조 때문에 신발 벗는 경우 많음.",
        ],
      },
    },
    {
      title: "선물 예절",
      content:
        "선물을 받을 때는 양손으로 받고, 바로 뜯지 않는 것이 예의입니다.",
      extra:
        "특히 어른이나 상사에게는 술, 건강식품, 차 등이 무난한 선물입니다.",
      icon: "🎁",
      modaldata: {
        title: "한국의 선물 예절",
        paragraphs: [
          "한국에서 선물은 단순한 물건이 아니라 관계와 존중의 의미를 담습니다.",
          "선물을 줄 때와 받을 때는 반드시 양손을 사용하는 것이 예의입니다.",
        ],
        list: [
          "양손으로 주고받기",
          "명절·집들이·감사 인사 등 다양한 상황에서 선물 주고받음",
        ],
      },
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* 네온 섹션 네비게이션 */}
      <NeonCard className="p-1">
        <div className="flex gap-1">
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
      {/* Vision OCR */}
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
