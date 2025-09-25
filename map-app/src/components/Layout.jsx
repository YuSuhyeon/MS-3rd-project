import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import BrandLogo from "components/BrandLogo";
import LoginModal from "components/community/LoginModal";
import LanguageButtons from "components/ui/LanguageButtons";
import { useAuth } from "context/AuthContext";
import { useTranslation } from "react-i18next";

import {
  LogOut,
  LogIn,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Sun,
  Cloud,
  CloudRain,
  TrendingUp,
  Snowflake,
  TrendingDown,
  RefreshCw,
  Droplets,
  Wind,
  X,
  MessageCircle,
  Camera,
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  ArrowUp,
  Minimize2,
  Maximize2,
  ArrowLeft,
} from "lucide-react";

const getNavigationItems = (t) => [
  { title: t("persona_analysis"), url: "/persona" },
  { title: t("result_dashboard"), url: "/result" },
  { title: t("itinerary_planner"), url: "/itinerary" },
  { title: t("ai_docent"), url: "/docent" },
  { title: t("community"), url: "/social" }, //community main 에서 social로 이동 0921진희
  { title: t("tour"), url: "/tour" },
  { title: t("survival"), url: "/community" }, //서바이벌 키트 0921진희
  { title: t("mypage"), url: "/mypage" },
];

// 상수들 (기존 코드에서 가져옴)
const YOLO_API = process.env.REACT_APP_YOLO_API || "/api";
const AZURE_FUNC_BASE = process.env.REACT_APP_AZURE_FUNC_BASE || "/api";

//여기추가욤
// Layout.jsx 상단에 추가
const translateText = async (text, targetLang) => {
  if (!text || !targetLang) return text;

  // 한국어 → 다른 언어, 또는 다른 언어 → 한국어만 번역
  const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);

  if (targetLang === "ko" && isKorean) return text;
  if (targetLang !== "ko" && !isKorean) return text;

  try {
    const TRANSLATOR_ENDPOINT = process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT;
    const TRANSLATOR_KEY = process.env.REACT_APP_AZURE_TRANSLATOR_KEY;
    const TRANSLATOR_REGION = process.env.REACT_APP_AZURE_TRANSLATOR_REGION;

    if (!TRANSLATOR_ENDPOINT || !TRANSLATOR_KEY) {
      console.warn(
        "Azure Translator credentials not found, returning original text"
      );
      return text;
    }

    const response = await fetch(
      `${TRANSLATOR_ENDPOINT}translate?api-version=3.0&to=${targetLang}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": TRANSLATOR_REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text: text }]),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.translations[0]?.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // 번역 실패시 원본 텍스트 반환
  }
};

const TAG_ALIASES = {
  "63스퀘어": "63스퀘어",
  "63빌딩": "63스퀘어",
  63: "63스퀘어",
  남산타워: "남산서울타워",
  남산서울타워: "남산서울타워",
  N서울타워: "남산서울타워",
  롯데타워: "롯데월드타워",
  롯데월드타워: "롯데월드타워",
  LWT: "롯데월드타워",
  경복궁: "경복궁",
};
const ALLOWED_POIS = new Set([
  "63스퀘어",
  "경복궁",
  "남산서울타워",
  "롯데월드타워",
]);

const UI = {
  ko: {
    title: "AI 도슨트",
    subtitle: "실시간 위치 기반 가이드",
    aiDocent: "AI 도슨트",
    stopVoice: "음성 중지",
    current: "현재 위치",
    directions: "길찾기",
    chatbot: "Klover AI",
    askQuestion: "궁금한 것을 물어보세요",
    send: "전송",
    examples: {
      title: "예시 질문:",
      items: [
        "케이팝 데몬 헌터스 촬영지",
        "명동 맛집 추천",
        "북촌한옥마을 정보",
      ],
    },
    chatbotPlaceholder: "궁금한 것을 물어보세요...",
    chatbotInitialMessage:
      "안녕하세요! 저는 서울 관광 안내 챗봇 Klover AI 예요. 서울 여행에 대해 궁금한 점이 있나요? 🤗",
    imageQueryText: "이 장소에 대해 알려주세요",
    voiceRecStart: "음성 녹음을 시작합니다...",
    voiceRecResult: "음성 인식 결과:",
    voiceRecStop: "음성 녹음을 중지합니다.",
    errorReply:
      "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    filePick: "파일",
    categories: {
      all: "전체",
      museum: "미술관&박물관",
      palace: "고궁",
      landmark: "랜드마크",
      historic: "역사적 장소",
    },
    allTourismSpots: "전체 관광지",
    detailedInfo: "상세 정보",
    tourismList: "관광지 목록",
    locationTracking: "위치 추적",
    location: "위치",
    voiceGuide: "음성 안내",
  },
  en: {
    title: "AI Docent",
    subtitle: "Real-time location guide",
    aiDocent: "AI Docent",
    stopVoice: "Stop voice",
    current: "Current location",
    directions: "Directions",
    chatbot: "Klover AI",
    askQuestion: "Ask me anything",
    send: "Send",
    examples: {
      title: "Example questions:",
      items: [
        "K-pop Demon Hunters filming locations",
        "Myeongdong restaurant recommendations",
        "Bukchon Hanok Village info",
        "Squid Game filming locations",
      ],
    },
    chatbotPlaceholder: "Ask me anything...",
    chatbotInitialMessage:
      "Hello! I'm Klover AI, your Seoul tourism guide chatbot. Do you have any questions about traveling in Seoul?😊",
    imageQueryText: "Tell me about this place",
    voiceRecStart: "Starting voice recording...",
    voiceRecResult: "Voice recognition result:",
    voiceRecStop: "Stopping voice recording.",
    errorReply:
      "Sorry, an error occurred while generating a response. Please try again later.",
    filePick: "File",
    categories: {
      all: "All",
      museum: "Museum",
      palace: "Palace",
      landmark: "Landmark",
      historic: "Historic",
    },
    allTourismSpots: "All Tourism Spots",
    detailedInfo: "Detailed Information",
    tourismList: "Tourism List",
    locationTracking: "Location Tracking",
    location: "Location",
    voiceGuide: "Voice Guide",
  },
  ja: {
    title: "AI ドーセント",
    subtitle: "リアルタイム位置ガイド",
    aiDocent: "AI ドーセント",
    stopVoice: "音声停止",
    current: "現在地",
    directions: "経路検索",
    chatbot: "観光チャットボット",
    askQuestion: "何でもお聞きください",
    send: "送信",
    examples: {
      title: "質問例:",
      items: [
        "ケイポップデーモンハンターズ撮影地",
        "明洞グルメ推薦",
        "北村韓屋村情報",
        "イカゲーム撮影地",
      ],
    },
    chatbotPlaceholder: "ご質問をどうぞ...",
    chatbotInitialMessage:
      "こんにちは！私はソウル観光案内チャットボットの Klover AI です。ソウル旅行について何かご質問はありますか？グルメ、ショッピング、祭り、名所まで個別におすすめできますよ☺️",
    imageQueryText: "この場所について教えてください",
    voiceRecStart: "音声録音を開始します...",
    voiceRecResult: "音声認識結果:",
    voiceRecStop: "音声録音を停止します。",
    errorReply:
      "申し訳ありませんが、応答の生成中にエラーが発生しました。後でもう一度お試しください。",
    filePick: "ファイル",
    categories: {
      all: "すべて",
      museum: "美術館＆博物館",
      palace: "古宮",
      landmark: "ランドマーク",
      historic: "歴史的な場所",
    },
    allTourismSpots: "全観光スポット",
    detailedInfo: "詳細情報",
    tourismList: "観光地リスト",
    locationTracking: "位置追跡",
    location: "位置",
    voiceGuide: "音声ガイド",
  },
  zh: {
    title: "AI 讲解",
    subtitle: "实时位置导览",
    aiDocent: "AI 讲解",
    stopVoice: "停止语音",
    current: "当前位置",
    directions: "路线",
    chatbot: "旅游聊天机器人",
    askQuestion: "请问您想了解什么",
    send: "发送",
    examples: {
      title: "示例问题:",
      items: [
        "K-pop恶魔猎人拍摄地",
        "明洞美食推荐",
        "北村韩屋村信息",
        "鱿鱼游戏拍摄地",
      ],
    },
    chatbotPlaceholder: "请输入您的问题...",
    chatbotInitialMessage:
      "您好！我是首尔旅游指南聊天机器人 Klover AI。您对首尔旅行有什么疑问吗？我可以为您提供餐厅、购物、节庆、景点的定制推荐😄",
    imageQueryText: "请介绍一下这个地方",
    voiceRecStart: "开始录音...",
    voiceRecResult: "语音识别结果：",
    voiceRecStop: "停止录音。",
    errorReply: "抱歉，生成回复时出错。请稍后再试。",
    filePick: "文件",
    categories: {
      all: "全部",
      museum: "美术馆&博物馆",
      palace: "故宫",
      landmark: "地标",
      historic: "历史遗址",
    },
    allTourismSpots: "全部景点",
    detailedInfo: "详细信息",
    tourismList: "景点列表",
    locationTracking: "位置追踪",
    location: "位置",
    voiceGuide: "语音导览",
  },
};

//사이드 메뉴 베너 위젯
const BannerWidget = () => {
  const banners = [
    {
      id: 1,
      image: "../../img/banner1.jpg",
    },
    {
      id: 2,
      image: "../../img/banner2.png",
    },
    {
      id: 3,
      image: "../../img/banner3.png",
    },
    {
      id: 4,
      image: "../../img/seoul_kdh_policies.jpg",
    },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        setIsVisible(true);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="px-4 pb-4">
      <div
        className={`relative overflow-hidden rounded-xl h-32 transition-opacity duration-300 border border-purple-500/20 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4 text-white">
          <h3 className="font-bold text-sm leading-tight mb-1 drop-shadow-lg">
            {currentBanner.title}
          </h3>
          <p className="text-xs opacity-90 leading-tight drop-shadow-md">
            {currentBanner.subtitle}
          </p>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentBannerIndex
                  ? "bg-purple-400"
                  : "bg-purple-400/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const callExchangeRateAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/ExchangeRateAPI?";
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ExchangeRateAPI call error:", error);
    return null;
  }
};

const callWeatherAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/WeatherAPI?";
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("WeatherAPI call error:", error);
    return null;
  }
};

// 숫자 효과
const FlickerNumber = ({ value, formatter = (val) => val }) => {
  const [displayValue, setDisplayValue] = useState(formatter(value));
  const animationRef = useRef();

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue("N/A");
      return;
    }

    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    let animationCounter = 0;
    const totalSteps = 10;
    const duration = 100;

    animationRef.current = setInterval(() => {
      if (animationCounter >= totalSteps) {
        clearInterval(animationRef.current);
        setDisplayValue(formatter(value));
      } else {
        const randomValue = value + (Math.random() - 0.5) * (value / 10);
        setDisplayValue(formatter(randomValue));
        animationCounter++;
      }
    }, duration);

    return () => clearInterval(animationRef.current);
  }, [value, formatter]);

  return <span className="font-mono text-purple-200">{displayValue}</span>;
};

const prettyPct = (conf) => `${Math.round(conf * 100)}%`;

// LiveInfoWidget 실시간 위젯
const LiveInfoWidget = ({ isCollapsed, onToggle, t }) => {
  const [exchangeData, setExchangeData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [displayValues, setDisplayValues] = useState({});

  const UPDATE_INTERVAL = 60 * 60 * 1000; // 1시간
  const ANIMATION_INTERVAL = 3000; // 3초마다 애니메이션

  // 실제 API 호출
  const fetchRealData = async () => {
    setLoading(true);

    try {
      const [exchange, weather] = await Promise.all([
        callExchangeRateAPI(),
        callWeatherAPI(),
      ]);

      if (exchange) {
        setExchangeData(exchange);
      }

      if (weather) {
        setWeatherData(weather);
      }

      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error("❌ API 호출 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 가짜 변동 효과 (실제 데이터는 유지하면서 효과로만 변경)
  const createFlickerEffect = useCallback(() => {
    if (!exchangeData || !weatherData) return;

    setDisplayValues((prev) => {
      const newValues = {};

      // 환율 변동 효과 (±0.1% 범위)
      if (exchangeData?.exchangeRates) {
        const rates = exchangeData.exchangeRates;
        newValues.USD = rates.USD
          ? {
              ...rates.USD,
              dealRate:
                rates.USD.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;

        newValues.JPY = rates.JPY
          ? {
              ...rates.JPY,
              dealRate:
                rates.JPY.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;

        newValues.CNY = rates.CNH
          ? {
              ...rates.CNH,
              dealRate:
                rates.CNH.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;
      }

      // 날씨 변동 효과 (±1도, ±2% 습도, ±0.3m/s 풍속)
      if (weatherData?.summary) {
        newValues.weather = {
          ...weatherData.summary,
          temperature:
            parseFloat(weatherData.summary.temperature) +
            (Math.random() - 0.5) * 2,
          humidity:
            parseFloat(weatherData.summary.humidity) +
            (Math.random() - 0.5) * 4,
          windSpeed:
            parseFloat(weatherData.summary.windSpeed) +
            (Math.random() - 0.5) * 0.6,
        };
      }

      return newValues;
    });
  }, [exchangeData, weatherData]);

  // 초기 로드 및 1시간마다 실제 데이터 가져오기
  useEffect(() => {
    fetchRealData();
    const realDataInterval = setInterval(fetchRealData, UPDATE_INTERVAL);
    return () => clearInterval(realDataInterval);
  }, []);

  // 3초마다 가짜 변동 효과
  useEffect(() => {
    if (!isCollapsed && (exchangeData || weatherData)) {
      createFlickerEffect(); // 초기 설정
      const flickerInterval = setInterval(
        createFlickerEffect,
        ANIMATION_INTERVAL
      );
      return () => clearInterval(flickerInterval);
    }
  }, [isCollapsed, exchangeData, weatherData, createFlickerEffect]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Sun className="w-4 h-4 text-yellow-400" />;
    const lowerCaseCondition = condition.toLowerCase();
    if (
      lowerCaseCondition.includes("sunny") ||
      lowerCaseCondition.includes("clear")
    )
      return <Sun className="w-4 h-4 text-yellow-400" />;
    if (
      lowerCaseCondition.includes("cloud") ||
      lowerCaseCondition.includes("overcast")
    )
      return <Cloud className="w-4 h-4 text-gray-400" />;
    if (lowerCaseCondition.includes("rain"))
      return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (lowerCaseCondition.includes("snow"))
      return <Snowflake className="w-4 h-4 text-blue-300" />;
    return <Sun className="w-4 h-4 text-yellow-400" />;
  };

  // 표시할 환율 데이터 (가짜 변동 효과 적용)
  const displayExchangeRates = displayValues.USD
    ? {
        USD: displayValues.USD,
        JPY: displayValues.JPY,
        CNY: displayValues.CNY,
      }
    : exchangeData?.exchangeRates
    ? {
        USD: exchangeData.exchangeRates.USD,
        JPY: exchangeData.exchangeRates.JPY,
        CNY: exchangeData.exchangeRates.CNH,
      }
    : null;

  return (
    <div className="border-t border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            {t("live_info")}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchRealData}
            disabled={loading}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
            title={isCollapsed ? t("expand") : t("collapse")}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <div className="text-xs font-medium text-purple-300 mb-2">
              {t("exchange_rate_krw")}
            </div>
            {displayExchangeRates ? (
              <div className="space-y-2">
                {Object.entries(displayExchangeRates).map(
                  ([currency, data]) =>
                    data && (
                      <div
                        key={currency}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-purple-200">
                          {currency}
                        </span>
                        <FlickerNumber
                          value={data.dealRate}
                          formatter={(val) => val.toFixed(1)}
                        />
                      </div>
                    )
                )}
              </div>
            ) : (
              <div className="text-xs text-purple-400">
                {loading ? "Loading..." : "Failed to load rates"}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium text-purple-300 mb-2">
              {t("seoul_weather")}
            </div>
            {displayValues.weather || weatherData?.summary ? (
              <div className="space-y-2">
                {(() => {
                  const weather = displayValues.weather || weatherData.summary;
                  return (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {getWeatherIcon(weather.weather)}
                          <span className="text-purple-200">{t("temp")}</span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.temperature)}
                          formatter={(val) => `${val.toFixed(0)}°C`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          <span className="text-purple-200">
                            {t("humidity")}
                          </span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.humidity)}
                          formatter={(val) => `${val.toFixed(0)}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-gray-400" />
                          <span className="text-purple-200">{t("wind")}</span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.windSpeed)}
                          formatter={(val) => `${val.toFixed(1)}m/s`}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-xs text-purple-400">
                {loading ? "Loading..." : "Failed to load weather"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
// 플로팅 챗봇 - docent 페이지가 아닐 때만 렌더링
const FloatingChatbot = ({ selectedLang = "ko" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "initial",
      type: "ai",
      content: UI[selectedLang].chatbotInitialMessage,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();
  const ui = UI[selectedLang];

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 언어 변경 시, 대화가 시작되지 않았다면 초기 메시지를 선택된 언어로 동기화
  useEffect(() => {
    setMessages((prev) => {
      if (
        Array.isArray(prev) &&
        prev.length === 1 &&
        prev[0]?.id === "initial" &&
        prev[0]?.type === "ai"
      ) {
        return [
          {
            ...prev[0],
            content: UI[selectedLang].chatbotInitialMessage,
            timestamp: new Date(),
          },
        ];
      }
      return prev;
    });
  }, [selectedLang]);

  // 모든 기존 함수들을 그대로 가져옴
  const callTourismAPI = async (userQuery) => {
    const functionUrl =
      "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/tourismqnaapi?code=BcqZANgpmolF-eQNAkdB4BgrhINolY8tLktSFVRHhaGhAzFu3b1_Tw==";
    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, location: "Seoul,KR" }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.answer || JSON.stringify(result);
    } catch (error) {
      console.error("API 호출 오류:", error);
      throw error;
    }
  };

  const normalizeLabel = (raw) => {
    if (!raw) return null;
    const canon = TAG_ALIASES[raw] || String(raw);
    return ALLOWED_POIS.has(canon) ? canon : null;
  };

  const callYOLO = async (file) => {
    const fd = new FormData();
    fd.append("file", file, file.name);
    fd.append("conf", "0.2");
    fd.append("imgsz", "640");
    const resp = await fetch(`${YOLO_API}/detect`, {
      method: "POST",
      body: fd,
    });
    if (!resp.ok) throw new Error(`YOLO HTTP ${resp.status}`);
    const js = await resp.json();
    const dets = (js?.detections || [])
      .map((d) => ({ label: String(d.name ?? d.cls ?? ""), conf: d.conf ?? 0 }))
      .sort((a, b) => (b.conf || 0) - (a.conf || 0));
    return dets;
  };

  const checkIfShouldRedirectToTour = (response) => {
    const tourKeywords = [
      "투어 서비스 페이지",
      "투어 서비스",
      "투어 예약",
      "가이드 투어",
      "투어 신청",
      "예약하세요",
      "예약 및 바로 이동",
      "바로 이동해보세요",
      "시설 정보, 예약, 입장권",
      "tour service",
      "book a tour",
      "guided tour",
      "tour booking",
      "tour service page",
      "reservation",
      "ticket booking",
      "customized tour",
      "professional guide",
      "tour guide",
      "custom tour",
      "tour programs",
      "tour program",
      "snap photo tour",
      "themed tour",
      "special tour",
      "tour experience",
      "tour activity",
      "tour activities",
      "programs are available",
      "tour service guide",
      "special customized tour",
      "join a themed activity",
      "professional guided tour",
      "custom course",
      "tour recommendations",
      "specialized tour",
      "visit with guide",
      "guided experience",
      "tour packages",
      "exclusive tour",
      "private tour",
      "group tour",
      "walking tour",
      "photo tour",
      "cultural tour",
      "sightseeing tour",
    ];
    return tourKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleTourRedirect = () => {
    try {
      console.log("투어 페이지로 이동 중...");
      navigate("/tour");
    } catch (error) {
      console.error("Navigation error:", error);
      // fallback으로 window.location 사용
      window.location.href = "/tour";
    }
  };

  // 이미지 처리
  const processImage = async (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: "user",
        content: ui.imageQueryText,
        attachments: [{ type: "image", url: imageUrl, caption: file.name }],
        timestamp: new Date(),
      },
    ]);
    setIsProcessing(true);

    try {
      const dets = await callYOLO(file);

      if (!dets.length) {
        const fallbackQuery =
          "이 이미지의 장소에 대해 알려주세요. 관광 정보를 제공해 주세요.";
        const ragResponse = await callTourismAPI(fallbackQuery);
        const fallbackMessage =
          selectedLang === "ko"
            ? "대상이 인식되지 않았어요. 다른 사진으로 시도해 보실래요?"
            : await translateText(
                "대상이 인식되지 않았어요. 다른 사진으로 시도해 보실래요?",
                selectedLang
              );

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            type: "ai",
            content: fallbackMessage,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const allowed = dets
        .map((d) => ({ ...d, canon: normalizeLabel(d.label) }))
        .filter((d) => !!d.canon);

      if (!allowed.length) {
        const tops = dets
          .slice(0, 3)
          .map((d) => `${d.label}(${prettyPct(d.conf)})`)
          .join(", ");
        const unsupportedMessage =
          selectedLang === "ko"
            ? `지원 라벨만 제공 중입니다.\n감지: ${tops}`
            : await translateText(
                `지원 라벨만 제공 중입니다.\n감지: ${tops}`,
                selectedLang
              );

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 2),
            type: "ai",
            content: unsupportedMessage,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const uniqueNames = Array.from(
        new Set(allowed.map((d) => d.canon))
      ).slice(0, 3);
      const ragQuery = `${uniqueNames.join(", ")}`;
      const ragResponse = await callTourismAPI(ragQuery);
      const translatedResponse =
        selectedLang === "ko"
          ? ragResponse
          : await translateText(ragResponse, selectedLang);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 3),
          type: "ai",
          content: translatedResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      const errorMessage =
        selectedLang === "ko"
          ? `오류가 발생했어요: ${String(err?.message || err)}`
          : await translateText(
              `오류가 발생했어요: ${String(err?.message || err)}`,
              selectedLang
            );

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 999),
          type: "ai",
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => URL.revokeObjectURL(imageUrl), 10000);
    }
  };

  const handleSendMessage = async (content, attachments) => {
    if (!content.trim() && !attachments) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const toKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, "ko");
      const fromKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, selectedLang);

      const koQuery = await toKo(content || "");
      const koResult = await callTourismAPI(koQuery);

      // 🔥 투어 키워드 체크 - 한국어 응답에서 먼저 확인
      if (checkIfShouldRedirectToTour(koResult)) {
        // 번역된 응답
        const result = await fromKo(koResult);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai-tour", // 투어 타입으로 설정
          content: result,
          showTourButton: true, // 버튼 표시 플래그
          originalResponse: koResult,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      // 일반 응답 처리
      const result = await fromKo(koResult);

      // 번역된 응답에서도 투어 키워드 체크 (이중 확인)
      const shouldShowTour = checkIfShouldRedirectToTour(result);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: shouldShowTour ? "ai-tour" : "ai",
        content: result,
        showTourButton: shouldShowTour,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: ui.errorReply,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTourButton = (message) => {
    // 사용자 메시지에는 버튼을 표시하지 않음
    if (message.type === "user") return null;

    const shouldShowButton =
      message.type === "ai-tour" ||
      message.showTourButton ||
      checkIfShouldRedirectToTour(message.content || "");

    if (shouldShowButton) {
      const buttonTexts = {
        ko: "🎯 투어 서비스 페이지로 이동",
        en: "🎯 Go to Tour Service Page",
        ja: "🎯 ツアーサービスページへ移動",
        zh: "🎯 前往旅游服务页面",
      };

      return (
        <div className="mt-3 space-y-2">
          <button
            onClick={() => {
              console.log("투어 버튼 클릭 - 이동 시작");
              // 여러 방법을 시도
              try {
                if (navigate) {
                  navigate("/tour");
                } else {
                  window.location.href = "/tour";
                }
              } catch (error) {
                console.error("Navigate failed, using window.location:", error);
                window.location.href = "/tour";
              }
            }}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white shadow-md hover:shadow-lg touch-manipulation cursor-pointer"
            style={{ minHeight: "44px" }}
          >
            {buttonTexts[selectedLang] || buttonTexts.ko}
          </button>
        </div>
      );
    }
    return null;
  };

  const handleImageFromGallery = (event) => {
    const f = event.target.files?.[0];
    if (f) processImage(f);
    event.target.value = "";
  };

  const handleImageFromCamera = (event) => {
    const f = event.target.files?.[0];
    if (f) processImage(f);
    event.target.value = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  // 스크롤 관리
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  return (
    <>
      {/* 플로팅 버튼 */}
      <div
        className={`fixed z-50 flex flex-col gap-3 ${
          isMobile ? "bottom-4 right-4" : "bottom-6 right-6"
        }`}
      >
        <motion.button
          onClick={() => {
            if (!isOpen) setIsMinimized(false);
            setIsOpen(!isOpen);
          }}
          className={`${
            isMobile ? "w-12 h-12" : "w-14 h-14"
          } bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isOpen ? (
            <X size={isMobile ? 20 : 24} />
          ) : (
            <MessageCircle size={isMobile ? 20 : 24} />
          )}
        </motion.button>
      </div>

      {/* 챗봇 창 */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`fixed z-40 bg-gray-900/95 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col ${
              isMinimized
                ? isMobile
                  ? "bottom-20 right-4 w-80 h-12"
                  : "bottom-24 right-6 w-96 h-16"
                : isMobile
                ? "bottom-20 right-4 w-80 h-[320px] max-h-[60vh]"
                : "bottom-24 right-6 w-96 h-[420px] max-h-[70vh]"
            }`}
          >
            {/* 헤더 */}
            <div
              className={`flex items-center justify-between border-b border-purple-500/20 ${
                isMobile ? "p-3" : "p-4"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`${
                    isMobile ? "w-2 h-2" : "w-3 h-3"
                  } bg-green-400 rounded-full animate-pulse`}
                ></div>
                <span
                  className={`text-white font-medium ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  {ui.chatbot}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 size={isMobile ? 14 : 16} />
                  ) : (
                    <Minimize2 size={isMobile ? 14 : 16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={isMobile ? 14 : 16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* 메시지 영역 */}
                <div
                  className={`flex-1 overflow-y-auto space-y-3 ${
                    isMobile ? "p-3" : "p-4"
                  }`}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl ${
                          isMobile ? "p-2 text-xs" : "p-3 text-sm"
                        } ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-800 text-gray-100 border border-gray-700"
                        }`}
                      >
                        {message.attachments?.map((attachment, idx) => (
                          <div key={idx} className="mb-2">
                            {attachment.type === "image" && (
                              <img
                                src={attachment.url}
                                alt={attachment.caption}
                                className={`w-full object-cover rounded-lg ${
                                  isMobile ? "h-24" : "h-32"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {/* 투어 버튼은 AI 메시지에서만 조건부 렌더링 */}
                        {message.type !== "user" &&
                          (message.type === "ai-tour" ||
                            message.showTourButton ||
                            checkIfShouldRedirectToTour(
                              message.content || ""
                            )) &&
                          renderTourButton(message)}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div
                        className={`bg-gray-800 border border-gray-700 rounded-xl ${
                          isMobile ? "p-2" : "p-3"
                        }`}
                      >
                        <div className="flex gap-1">
                          <div
                            className={`${
                              isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                            } bg-purple-400 rounded-full animate-bounce`}
                          ></div>
                          <div
                            className={`${
                              isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                            } bg-purple-400 rounded-full animate-bounce`}
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className={`${
                              isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                            } bg-purple-400 rounded-full animate-bounce`}
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div
                  className={`border-t border-purple-500/20 ${
                    isMobile ? "p-3" : "p-4"
                  }`}
                >
                  {/* All screens: inline icons + input + send */}
                  <div className="flex items-stretch gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ${
                          isMobile ? "p-1.5" : "p-2"
                        }`}
                        title="갤러리에서 선택"
                      >
                        <ImageIcon
                          size={isMobile ? 14 : 16}
                          className="text-purple-400"
                        />
                      </button>
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className={`bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ${
                          isMobile ? "p-1.5" : "p-2"
                        }`}
                        title="카메라로 촬영"
                      >
                        <Camera
                          size={isMobile ? 14 : 16}
                          className="text-purple-400"
                        />
                      </button>
                    </div>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={ui.chatbotPlaceholder}
                      className={`flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-500 ${
                        isMobile ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
                      }`}
                      rows="1"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={() => handleSendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isProcessing}
                      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                        isMobile ? "p-1.5" : "p-2"
                      }`}
                    >
                      <Send size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 숨겨진 파일 입력들 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFromGallery}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageFromCamera}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, login, logout } = useAuth();
  //const { t } = useTranslation("Navigation"); //0921주영 주석처리하고 아래에 i18n추가
  const { t, i18n } = useTranslation("Navigation");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiveInfoCollapsed, setIsLiveInfoCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigationItems = getNavigationItems(t);
  // 현재 선택된 언어
  const selectedLang = i18n.language || "ko"; //0921주영

  // 로그인 성공 시 모달 닫기
  useEffect(() => {
    if (profile && showLoginModal) {
      setShowLoginModal(false);
    }
  }, [profile, showLoginModal]);

  // 터치 이벤트를 위한 ref
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 스마트 뒤로가기 - Docent 세션 우선
  const isFromDocent = () => {
    try {
      const previousPage = sessionStorage.getItem("previousPage");
      const previousPageTitle = sessionStorage.getItem("previousPageTitle");
      const timestamp = sessionStorage.getItem("previousPageTimestamp");
      if (previousPage && previousPageTitle === "AI Docent" && timestamp) {
        const now = Date.now();
        const storedTime = parseInt(timestamp);
        const fiveMinutes = 5 * 60 * 1000;
        return now - storedTime < fiveMinutes;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSmartBack = () => {
    try {
      const previousPage = sessionStorage.getItem("previousPage");
      const previousPageTitle = sessionStorage.getItem("previousPageTitle");
      if (isFromDocent() && previousPage && previousPageTitle === "AI Docent") {
        navigate(previousPage);
        sessionStorage.removeItem("previousPage");
        sessionStorage.removeItem("previousPageTitle");
        sessionStorage.removeItem("previousPageTimestamp");
        return;
      }
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // 기본 폴백: 도슨트가 최우선, 아니면 투어
        navigate("/docent");
      }
    } catch {
      navigate("/docent");
    }
  };

  const toggleLiveInfo = () => setIsLiveInfoCollapsed((prev) => !prev);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    if (!menuOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (!menuOpen) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = Math.abs(touchStartY.current - touchEndY);
    const deltaTime = Date.now() - touchStartTime.current;

    // 왼쪽으로 스와이프 조건:
    // 1. 최소 50px 이상 왼쪽으로 이동
    // 2. 수직 움직임은 100px 이하 (수평 스와이프임을 보장)
    // 3. 1초 이내에 완료 (빠른 스와이프)
    if (deltaX > 50 && deltaY < 100 && deltaTime < 1000) {
      closeMenu();
    }
  };

  // 오버레이 클릭/터치 핸들러
  const handleOverlayClick = (e) => {
    // 터치 이벤트와 클릭 이벤트 모두 처리
    if (e.type === "touchstart" || e.type === "click") {
      closeMenu();
    }
  };

  // 메인 콘텐츠 클릭/터치 핸들러 (사이드 메뉴가 열려있을 때만)
  const handleMainContentClick = (e) => {
    if (menuOpen) {
      closeMenu();
    }
  };

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && menuOpen) {
        closeMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen]);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // docent 페이지 체크
  const isDocentPage =
    location.pathname === "/docent" || location.pathname.startsWith("/docent/");
  //페르소나 페이지 체크
  const isPersonaPage =
    location.pathname === "/persona" ||
    location.pathname.startsWith("/persona/");

  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <>
      <style jsx>{`
        .layout-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0c0c0c 0%,
            #1a0a2e 50%,
            #16213e 100%
          );
        }
        .neon-menu-toggle {
          position: relative;

          z-index: 1001;
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .menu-icon {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
          z-index: 2;
          position: relative;
        }

        .neon-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            45deg,
            #a855f7,
            #ec4899,
            #3b82f6,
            #a855f7
          );
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .neon-menu-toggle:hover .neon-glow {
          opacity: 0.6;
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes neon-pulse {
          from {
            box-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7;
          }
          to {
            box-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899;
          }
        }

        .neon-sidebar {
          background: linear-gradient(
            180deg,
            rgba(12, 12, 12, 0.95) 0%,
            rgba(26, 10, 46, 0.95) 50%,
            rgba(22, 33, 62, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 50px rgba(168, 85, 247, 0.1),
            inset -1px 0 0 rgba(168, 85, 247, 0.1);
        }

        .neon-text-primary {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .neon-text-secondary {
          color: rgba(255, 255, 255, 0.6);
        }

        .neon-menu-item {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
        }

        .neon-menu-item:hover {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: white;
          transform: translateX(4px);
        }

        .neon-menu-item.active {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.2),
            rgba(236, 72, 153, 0.2)
          );
          border: 1px solid rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
          color: white;
        }

        .neon-border {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0%;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          transition: width 0.3s ease;
        }

        .neon-menu-item:hover .neon-border {
          width: 100%;
        }

        .language-buttons-container {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        }

        .main-content {
          min-height: 100vh;
          box-sizing: border-box;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        @media (max-width: 767px) {
          .main-content {
            padding-left: 15px;
            padding-right: 15px;
            padding-bottom: 15px;
            padding-top: 60px;
            min-width: 0;
            max-width: 100vw;
            margin: 0;
          }
        }
      `}</style>

      <div
        className="flex flex-col min-h-screen bg-[#18102a] relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 상단 고정 버튼들 */}
        <div className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
          {/* 메뉴버튼 (왼쪽) */}
          {!menuOpen && (
            <motion.button
              className="neon-menu-toggle"
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                width: 45,
                height: 45,
              }}
            >
              <img src="/img/menu_150.png" alt="메뉴" className="menu-icon" />
              <div className="neon-glow" />
            </motion.button>
          )}
          {/* 오른쪽 버튼들 (언어 버튼 + 홈/뒤로 버튼) */}
          {!menuOpen && (
            <div className="flex items-center gap-3">
              {/* 언어 버튼 */}
              <motion.div
                className="h-10 flex items-center justify-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <LanguageButtons />
              </motion.div>

              {/* 모바일: 홈 대신 스마트 뒤로가기 (홈 경로 '/'에서는 숨김) */}
              {isMobile
                ? location.pathname !== "/" && (
                    <motion.button
                      onClick={handleSmartBack}
                      className="text-white hover:text-purple-300 transition-colors p-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      title="뒤로가기"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </motion.button>
                  )
                : location.pathname !== "/" && (
                    <motion.button
                      onClick={handleSmartBack}
                      className="text-white hover:text-purple-300 transition-colors p-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      title="뒤로가기"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </motion.button>
                  )}
            </div>
          )}
        </div>

        {/* 오버레이 */}
        <AnimatePresence>
          {menuOpen &&
            createPortal(
              <motion.div
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={handleOverlayClick}
                onTouchStart={handleOverlayClick}
                onTouchEnd={(e) => e.stopPropagation()}
              />,
              document.body
            )}
        </AnimatePresence>

        {/* 사이드바 */}
        {menuOpen &&
          createPortal(
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 neon-sidebar flex flex-col"
              variants={sidebarVariants}
              initial="closed"
              animate={menuOpen ? "open" : "closed"}
              onTouchStart={(e) => {
                e.stopPropagation();
                // 사이드바 내부에서 터치 시작 시 좌표 저장
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
                touchStartTime.current = Date.now();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                // 사이드바 내부에서 좌측 스와이프 감지
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchStartX.current - touchEndX;
                const deltaY = Math.abs(touchStartY.current - touchEndY);
                const deltaTime = Date.now() - touchStartTime.current;

                // 왼쪽으로 스와이프 조건:
                // 1. 최소 50px 이상 왼쪽으로 이동
                // 2. 수직 움직임은 100px 이하 (수평 스와이프임을 보장)
                // 3. 1초 이내에 완료 (빠른 스와이프)
                if (deltaX > 50 && deltaY < 100 && deltaTime < 1000) {
                  closeMenu();
                }
              }}
            >
              <div className="p-3 flex-1 overflow-y-auto">
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wider px-3 py-2">
                  {t("menu")}
                </div>
                <nav className="px-2">
                  {navigationItems.map((item, index) => {
                    const active = isActive(item.url, item.exact);
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: menuOpen ? 1 : 0,
                          x: menuOpen ? 0 : -20,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: menuOpen ? index * 0.1 : 0,
                        }}
                      >
                        <Link
                          to={item.url}
                          onClick={closeMenu}
                          className={`neon-menu-item flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
                            active ? "active" : ""
                          }`}
                        >
                          <span className="font-medium">{item.title}</span>
                          <div className="neon-border" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="mt-6">
                  <BannerWidget />
                </div>
              </div>

              <div className="mt-auto">
                <LiveInfoWidget
                  isCollapsed={isLiveInfoCollapsed}
                  onToggle={toggleLiveInfo}
                  t={t}
                />
                <div className="border-t border-purple-500/20 p-6">
                  {profile ? (
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={
                          profile?.picture ||
                          profile?.profile_image ||
                          "/img/default_profile_purple_img.png"
                        }
                        alt={profile.name}
                        className="w-8 h-8 rounded-full border-2 border-purple-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {profile.name}
                        </p>
                        <p className="text-xs neon-text-secondary truncate">
                          {profile.email}
                        </p>
                      </div>
                      <button
                        onClick={logout}
                        title={t("log_out")}
                        className="p-2 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                      >
                        <LogOut size={18} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          ?
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {t("welcome_traveler")}
                        </p>
                        <p className="text-xs neon-text-secondary truncate">
                          {t("plan_your_trip_with_ai")}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          console.log("로그인 버튼 클릭됨");
                          setShowLoginModal(true);
                        }}
                        title={t("log_in")}
                        className="p-2 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                      >
                        <LogIn size={18} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.aside>,
            document.body
          )}

        {/* 메인 콘텐츠 */}
        <motion.main
          className="flex-1 flex flex-col"
          animate={{
            marginLeft: !isMobile && menuOpen ? "288px" : "0px",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 40,
          }}
          onClick={handleMainContentClick}
          onTouchStart={handleMainContentClick}
        >
          <div
            className="main-content content-shift"
            style={{
              ...(isMobile ? { height: "100vh", overflow: "auto" } : {}),
            }}
          >
            <div className="flex gap-4 w-full">
              <div className="flex-[1.2] min-w-0">{/* 관광지 목록 */}</div>
              <div className="flex-[2] min-w-0">{/* 지도 */}</div>
              <div className="flex-[1] min-w-0">{/* 상세정보 */}</div>
            </div>
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </motion.main>

        {/* 플로팅 챗봇 - docent, persona 페이지에서는 숨김 */}
        {!(isDocentPage || isPersonaPage) && (
          <FloatingChatbot selectedLang={selectedLang} />
        )}

        {/* 로그인 모달 */}
        <AnimatePresence>
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
