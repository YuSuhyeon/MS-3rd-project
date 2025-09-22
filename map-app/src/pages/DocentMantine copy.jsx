import React, { useState, useEffect, useRef, useMemo } from "react";
import { POI } from "Entities/POI";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import {
  Navigation,
  VolumeX,
  Send,
  Mic,
  MicOff,
  Camera,
  Bot,
  User,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "components/ui/card";
import { translateText } from "integrations/translator";
import { speakText, stopTTS } from "integrations/tts";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
// NeonTheme 컴포넌트들을 import
import {
  BackgroundEffect,
  NeonCard,
  NeonCardJH,
  NeonCardJHMobile,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";

import POIList, { POIListJH } from "components/docent/POIList";
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";

// ========= YOLO / Azure Function (환경변수)
const YOLO_API = process.env.REACT_APP_YOLO_API || "/api";
const AZURE_FUNC_BASE = process.env.REACT_APP_AZURE_FUNC_BASE || "/api";

// ★★★ useIsMobile 훅
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobile(width < breakpoint);
      }
    };

    checkIsMobile();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }
  }, [breakpoint]);

  return isMobile;
};

// ========= 다국어 UI
const UI = {
  ko: {
    title: "AI 도슨트",
    subtitle: "실시간 위치 기반 가이드",
    aiDocent: "AI 도슨트",
    stopVoice: "음성 중지",
    current: "현재 위치",
    directions: "길찾기",
    chatbot: "관광 챗봇",
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
      "안녕하세요! 저는 당신의 AI 여행 도슨트입니다. 궁금한 장소나 여행 정보를 물어보세요. 사진을 보내주시면 그 장소에 대한 자세한 설명도 드릴 수 있어요!",
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
    chatbot: "Tourism Chatbot",
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
      "Hello! I am your AI travel docent. Ask me about places or travel information. You can also send a photo for a detailed explanation of the location!",
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
      "こんにちは！私はあなたのAI旅行ドーセントです。場所や旅行情報について何でも尋ねてください。写真を送ってください。その場所について詳しく説明します！",
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
      "您好！我是您的AI旅行讲解员。您可以询问任何关于地点或旅行信息的问题。您也可以发送照片，我会为您提供该地点的详细说明！",
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
// ── 라벨 정규화/허용 목록
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
const prettyPct = (p = 0) => (p * 100).toFixed(1) + "%";
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// #################################################################
// ## 고정형 챗봇 (모바일/데스크톱 공용)
// #################################################################
const FixedChatbot = ({
  callApi,
  ui,
  isMobile,
  selectedLang = "ko",
  expanded,
  setExpanded,
}) => {
  const [messages, setMessages] = useState([
    {
      id: "initial",
      type: "ai",
      content: ui.chatbotInitialMessage,
      timestamp: new Date(),
    },
  ]);
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // 갤러리/파일
  const cameraInputRef = useRef(null); // 카메라(촬영)

  useEffect(() => {
    // 언어가 바뀌면 초기 메시지만 새 언어로 업데이트 (기존 대화 내용 유지)
    setMessages((prev) => {
      const hasInitialMessage = prev.some((msg) => msg.id === "initial");
      if (hasInitialMessage) {
        // 초기 메시지만 새 언어로 업데이트
        return prev.map((msg) =>
          msg.id === "initial"
            ? { ...msg, content: ui.chatbotInitialMessage }
            : msg
        );
      } else {
        // 초기 메시지가 없으면 새로 추가
        return [
          {
            id: "initial",
            type: "ai",
            content: ui.chatbotInitialMessage,
            timestamp: new Date(),
          },
          ...prev,
        ];
      }
    });
    setInputMessage("");
  }, [ui.chatbotInitialMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isProcessing]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };
  useEffect(scrollToBottom, [messages, isProcessing]);

  // YOLO / Azure Function 헬퍼

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

  // 텍스트 메시지에서도 투어 키워드 감지 개선
  const handleSendMessageEnhanced = async (content, attachments) => {
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
      const koResult = await callApi(koQuery);

      // 🔥 텍스트 질문에서도 투어 키워드 체크
      if (checkIfShouldRedirectToTour(koResult)) {
        const tourMessages = {
          ko: "🎯 투어 관련 질문이시군요! 전문 가이드 투어 서비스와 맞춤 코스 추천은 투어 페이지에서 확인하실 수 있습니다.",
          en: "🎯 I see you're asking about tours! Professional guided tour services and custom course recommendations are available on our tour page.",
          ja: "🎯 ツアーに関するご質問ですね！専門ガイドツアーサービスとカスタムコース推薦は、ツアーページでご確認いただけます。",
          zh: "🎯 看起来您在咨询旅游相关问题！专业导游服务和定制路线推荐可在旅游页面查看。",
        };

        const tourMessage = tourMessages[selectedLang] || tourMessages.ko;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai-tour",
            content: tourMessage,
            showTourButton: true,
            originalResponse: koResult,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // 일반 응답 처리
      const result = await fromKo(koResult);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: result,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // 에러 처리...
    } finally {
      setIsProcessing(false);
    }
  };

  // 기존 텍스트 질문 처리
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
      // ko ↔ selectedLang 자동 변환
      const toKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, "ko");
      const fromKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, selectedLang);

      const koQuery = await toKo(content || "");
      const koResult = await callApi(koQuery);
      const result = await fromKo(koResult); //0917진희님 파일 통합때 이걸로 살림

      // const result = await callApi(content);  0917 주영 주석처리
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: result,
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

  const handleTextSend = () => handleSendMessage(inputMessage);

  // 음성 토글(샘플)
  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        const transcribedText = ui.examples.items[0];
        setIsRecording(false);
        handleSendMessage(transcribedText);
      }, 2000);
    }
  };

  const checkIfShouldRedirectToTour = (response) => {
    //투어 단어 감지
    const tourKeywords = [
      "투어 서비스 페이지",
      "투어 예약",
      "가이드 투어",
      "투어 신청",
      "예약하세요",
      "tour service",
      "book a tour",
      "guided tour",
      "tour booking",
    ];

    return tourKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 투어 페이지로 이동하는 함수
  const handleTourRedirect = () => {
    navigate("/tour");
  };

  // 파일/카메라 입력 공통 처리 (YOLO + Azure Function)
  // const processImage = async (file) => {
  //   if (!file) return;
  //   const imageUrl = URL.createObjectURL(file);

  //   // 1) 사용자 말풍선 (이미지)
  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       id: String(Date.now()),
  //       type: "user",
  //       content: ui.imageQueryText,
  //       attachments: [{ type: "image", url: imageUrl, caption: file.name }],
  //       timestamp: new Date(),
  //     },
  //   ]);
  //   setIsProcessing(true);

  //   try {
  //     // 2) YOLO 감지
  //     const dets = await callYOLO(file);
  //     if (!dets.length) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: String(Date.now() + 1),
  //           type: "ai",
  //           content: "대상이 인식되지 않았어요. 다른 사진으로 시도해 보실래요?",
  //           timestamp: new Date(),
  //         },
  //       ]);
  //       return;
  //     }

  //     // 3) 허용 라벨 정규화/필터
  //     const allowed = dets
  //       .map((d) => ({ ...d, canon: normalizeLabel(d.label) }))
  //       .filter((d) => !!d.canon);

  //     if (!allowed.length) {
  //       const tops = dets
  //         .slice(0, 3)
  //         .map((d) => `${d.label}(${prettyPct(d.conf)})`)
  //         .join(", ");
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: String(Date.now() + 2),
  //           type: "ai",
  //           content: `아직은 63스퀘어/경복궁/남산서울타워/롯데월드타워만 지원해요.\n감지: ${tops}`,
  //           timestamp: new Date(),
  //         },
  //       ]);
  //       return;
  //     }

  //     // 4) Azure Function 상세 정보 조회
  //     const uniqueNames = Array.from(
  //       new Set(allowed.map((d) => d.canon))
  //     ).slice(0, 3);
  //     const infos = await fetchPOIInfos(uniqueNames);

  //     if (!infos.length) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: String(Date.now() + 3),
  //           type: "ai",
  //           content: `인식: ${uniqueNames.join(
  //             ", "
  //           )} — 상세 정보를 가져오지 못했어요.`,
  //           timestamp: new Date(),
  //         },
  //       ]);
  //       return;
  //     }

  //     // 5) 말풍선 출력
  //     const infoTextBlocks = infos.map((info) => {
  //       const lines = [
  //         `**${info.name || ""}**`,
  //         info.address ? `• 주소: ${info.address}` : null,
  //         info.phone ? `• 전화: ${info.phone}` : null,
  //         info.open_hours_text ? `• 운영시간: ${info.open_hours_text}` : null,
  //         info.ticket_price_text ? `• 입장료: ${info.ticket_price_text}` : null,
  //         info.website ? `• 웹사이트: ${info.website}` : null,
  //         info.description ? `\n${info.description}` : null,
  //       ]
  //         .filter(Boolean)
  //         .join("\n");
  //       return lines;
  //     });

  //     setMessages((prev) => [
  //       ...prev,
  //       ...infoTextBlocks.map((txt, i) => ({
  //         id: String(Date.now() + 4 + i),
  //         type: "ai",
  //         content: txt,
  //         timestamp: new Date(),
  //       })),
  //     ]);
  //   } catch (err) {
  //     console.error(err);
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         id: String(Date.now() + 999),
  //         type: "ai",
  //         content: `오류가 발생했어요: ${String(err?.message || err)}`,
  //         timestamp: new Date(),
  //       },
  //     ]);
  //   } finally {
  //     setIsProcessing(false);
  //     setTimeout(() => URL.revokeObjectURL(imageUrl), 10000);
  //   }
  // };
  // 파일/카메라 입력 공통 처리 (YOLO + RAG Azure Function)
  const processImage = async (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setExpanded(true); // 업로드하면 자동 확대

    // 1) 사용자 말풍선 (이미지)
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
      // 2) YOLO 감지
      const dets = await callYOLO(file);

      if (!dets.length) {
        // 탐지 결과 없을 때 일반적인 이미지 질문
        const fallbackQuery =
          "이 이미지의 장소에 대해 알려주세요. 관광 정보를 제공해 주세요.";
        const ragResponse = await callApi(fallbackQuery);

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

      // 3) 허용 라벨 정규화/필터
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

      // 4) 탐지된 장소들로 RAG 쿼리 생성  - 챗봇 통합
      const uniqueNames = Array.from(
        new Set(allowed.map((d) => d.canon))
      ).slice(0, 3);
      const confidenceInfo = allowed
        .slice(0, 3)
        .map((d) => `${d.canon}(${prettyPct(d.conf)})`)
        .join(", ");
      //const infos = await fetchPOIInfos(uniqueNames);

      // 5) callTourismAPI로 RAG+GPT 모델에 쿼리 전달
      const ragQuery = `${uniqueNames.join(", ")}`;

      const ragResponse = await callApi(ragQuery); // callTourismAPI 사용

      // 🔥 투어 페이지 리다이렉트 체크 - 개선된 버전
      if (checkIfShouldRedirectToTour(ragResponse)) {
        // 언어별 메시지 생성
        const tourMessages = {
          ko: "🎯 더 자세한 투어 정보와 예약은 투어 서비스 페이지에서 확인하실 수 있어요!\n전문 가이드와 함께하는 특별한 여행을 경험해보세요.",
          en: "🎯 For more detailed tour information and reservations, please check our tour service page!\nExperience a special journey with professional guides.",
          ja: "🎯 より詳しいツアー情報とご予約は、ツアーサービスページでご確認いただけます！\n専門ガイドと一緒に特別な旅をお楽しみください。",
          zh: "🎯 更详细的旅游信息和预订可在旅游服务页面查看！\n与专业导游一起体验特别的旅程。",
        };

        const tourMessage = tourMessages[selectedLang] || tourMessages.ko;

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: "ai-tour",
            content: tourMessage,
            showTourButton: true,
            originalResponse: ragResponse, // 원본 응답도 보관
            timestamp: new Date(),
          },
        ]);
        return; // 일반 응답 처리 방지
      }

      // 6) 선택된 언어로 번역
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

  //여기 투어버튼
  const renderTourButton = (message) => {
    if (message.type === "ai-tour" && message.showTourButton) {
      const buttonTexts = {
        ko: "🎯 투어 서비스 페이지로 이동",
        en: "🎯 Go to Tour Service Page",
        ja: "🎯 ツアーサービスページへ移動",
        zh: "🎯 前往旅游服务页面",
      };

      return (
        <div className="mt-3 space-y-2">
          {/* 메인 투어 페이지 버튼 */}
          <button
            onClick={handleTourRedirect}
            className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700
            active:from-blue-700 active:to-blue-800
            text-white shadow-md hover:shadow-lg
            touch-manipulation cursor-pointer
            ${isMobile ? "text-base" : "text-sm"}
          `}
            style={{
              minHeight: isMobile ? "44px" : "36px",
            }}
          >
            {buttonTexts[selectedLang] || buttonTexts.ko}
          </button>

          {/* 추가: 원본 응답도 보여주는 옵션 */}
          {message.originalResponse && (
            <button
              onClick={() => {
                // 원본 응답을 새 메시지로 추가
                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(Date.now() + 1000),
                    type: "ai",
                    content:
                      selectedLang === "ko"
                        ? message.originalResponse
                        : translateText(message.originalResponse, selectedLang),
                    timestamp: new Date(),
                  },
                ]);
              }}
              className={`
              w-full py-2 px-3 rounded-lg text-sm transition-all duration-200
              bg-gray-700 hover:bg-gray-600 text-gray-200
              border border-gray-600 hover:border-gray-500
              ${isMobile ? "text-sm" : "text-xs"}
            `}
            >
              {selectedLang === "ko" ? "📝 상세 정보 보기" : "📝 View Details"}
            </button>
          )}
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

  // const chatHeight = isMobile ? "h-[280px]" : "h-full";
  const chatHeight = isMobile
    ? "h-full"
    : // expanded
      //   ? "h-[60vh]"
      //   : "h-[280px]"
      "h-full";
  // const inChatHeight = "h-full";
  return (
    <div
      className={`${chatHeight} w-full bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-lg border-t border-purple-500/30`}
    >
      <div
        className={`flex flex-col ${chatHeight} ${
          isMobile ? "p-2" : "p-4"
        } transition-all duration-300`}
      >
        {/* 메시지 영역 */}
        <div
          className={`${
            isMobile && !expanded ? "hidden" : "flex-1"
          } overflow-y-auto neon-scrollbar space-y-4 pb-2`}
        >
          <AnimatePresence>
            // 메시지 영역에서 각 메시지를 렌더링할 때
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm ${
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
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* 투어 버튼 추가  */}
                  {(message.type === "ai-tour" ||
                    message.content.includes("투어 서비스 페이지") ||
                    message.content.includes("Tour Service Page")) && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          window.location.href = "/tour"; // 간단한 방법
                          // 또는 navigate('/tour'); // useNavigate 훅 사용하는 경우
                        }}
                        className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                      >
                        🎯{" "}
                        {selectedLang === "ko"
                          ? "투어 서비스 페이지로 이동"
                          : "Go to Tour Service Page"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/90 rounded-2xl px-4 py-3 border border-gray-600/30">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div
          className={`border-t border-purple-500/30 pt-3 ${
            isMobile && !expanded ? "mt-0" : "mt-3"
          } flex-shrink-0 bg-gray-900/95 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2">
            {/* 파일 업로드 (갤러리) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFromGallery}
              accept="image/*"
              className="hidden"
            />
            {/* 카메라(촬영) */}

            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleImageFromCamera}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <NeonButton
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                }
                cameraInputRef.current?.click();
              }}
              disabled={isProcessing}
              className="p-2"
              title="카메라(촬영)"
            >
              <Camera className="w-5 h-5" />
            </NeonButton>

            <NeonButton
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                }
                fileInputRef.current?.click();
              }}
              disabled={isProcessing}
              title="파일에서 선택"
              className="p-2"
            >
              <img
                src={`${process.env.PUBLIC_URL}/img/Upload.png`}
                alt="업로드"
                className="w-5 h-5 object-contain filter brightness-0 invert"
              />
            </NeonButton>

            {/* 음성 */}
            <NeonButton
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                }
                handleVoiceRecording();
              }}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
              disabled={isProcessing}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </NeonButton>
            {/* 텍스트 */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTextSend()}
                onFocus={() => {
                  if (!expanded) {
                    setExpanded(true);
                  }
                }}
                placeholder={ui.chatbotPlaceholder}
                className="w-full px-4 py-2.5 border border-purple-500/30 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 text-sm bg-gray-800/70 text-white placeholder-gray-400 backdrop-blur-sm shadow-lg"
                disabled={isProcessing}
              />
            </div>
            {/* 확대/축소 */}
            <NeonButton
              size="icon"
              variant="outline"
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? "작게" : "크게"}
            >
              {expanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </NeonButton>
            {/* 전송 */}
            <NeonButton
              size="icon"
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                }
                handleTextSend();
              }}
              disabled={!inputMessage.trim() || isProcessing}
              className="rounded-full p-2"
            >
              <Send className="w-5 h-5" />
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};
// #################################################################
// ## 메인 DocentMantine
// #################################################################
const CATEGORY_OPTIONS = ["all", "museum", "palace", "landmark", "historic"];
const guessCategoryKey = (raw) => {
  const s = (raw || "").toString().toLowerCase();
  if (/museum|미술|박물|gallery/.test(s)) return "museum";
  if (/palace|궁|고궁/.test(s)) return "palace";
  if (/landmark|tower|타워|랜드마크/.test(s)) return "landmark";
  if (/historic|역사|유적|heritage/.test(s)) return "historic";
  return "landmark";
};
export default function DocentMantine() {
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isDocentActive, setIsDocentActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedLang, setSelectedLang] = useState("ko");
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [isLocationTracking, setIsLocationTracking] = useState(false);

  const ui = UI[selectedLang] || UI.ko;
  const isMobile = useIsMobile();
  const watchId = useRef(null);
  const poisRef = useRef([]);

  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

  // CSV 로드
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/final_visit_seoul.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (r) => setCsvData(r.data),
        });
      })
      .catch((e) => console.error("CSV load error", e));
  }, []);

  // CSV → 내부 POI
  const csvPois = useMemo(
    () =>
      (csvData || [])
        .map((row) => {
          const lat = parseFloat(row.lat);
          const lng = parseFloat(row.lon);
          if (isNaN(lat) || isNaN(lng)) return null;
          const catRaw =
            row.category ||
            row.category_ko ||
            row.category_en ||
            row.cat ||
            row.tag ||
            row.name_ko;
          return {
            id: row.poi_id || `${row.name_ko}-${lat}-${lng}`,
            name_ko: row.name_ko || "장소",
            address_ko: row.address_ko || "",
            description_ko: row.rag_seed_text_ko || "",
            category: guessCategoryKey(catRaw),
            location: { lat, lng },
            _raw: row,
          };
        })
        .filter(Boolean),
    [csvData]
  );

  // 정적 텍스트 번역 캐시
  const [nameTr, setNameTr] = useState({});
  const [addrTr, setAddrTr] = useState({});
  useEffect(() => {
    (async () => {
      if (!csvPois.length || selectedLang === "ko") {
        setNameTr({});
        setAddrTr({});
        return;
      }
      const names = csvPois.map((c) => c.name_ko);
      const addrs = csvPois.map((c) => c.address_ko);
      try {
        const [nOut, aOut] = await Promise.all([
          translateText(names, selectedLang),
          translateText(addrs, selectedLang),
        ]);
        const nMap = {},
          aMap = {};
        csvPois.forEach((c, i) => {
          nMap[c.id] = nOut[i] || c.name_ko;
          aMap[c.id] = aOut[i] || c.address_ko;
        });
        setNameTr(nMap);
        setAddrTr(aMap);
      } catch (e) {
        setNameTr({});
        setAddrTr({});
      }
    })();
  }, [csvPois, selectedLang]);
  // 리스트 데이터(번역 반영)
  const listData = useMemo(() => {
    if (!csvPois.length)
      return (pois || []).map((p) => ({ ...p, category: "landmark" }));
    return csvPois.map((c) => ({
      id: c.id,
      name: selectedLang === "ko" ? c.name_ko : nameTr[c.id] || c.name_ko,
      address:
        selectedLang === "ko" ? c.address_ko : addrTr[c.id] || c.address_ko,
      description: c.description_ko,
      category: c.category,
      location: c.location,
    }));
  }, [csvPois, pois, selectedLang, nameTr, addrTr]);

  useEffect(() => {
    if (csvPois.length) return;
    (async () => {
      try {
        const data = await POI.list();
        setPOIs(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [csvPois.length]);
  // 카테고리 필터
  const filteredList = useMemo(() => {
    if (category === "all") return listData;
    return listData.filter((p) => p.category === category);
  }, [listData, category]);
  // 위치 추적 토글 함수
  const toggleLocationTracking = () => {
    if (isLocationTracking) {
      // 위치 추적 중지
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsLocationTracking(false);
      setUserLocation({ lat: 37.5665, lng: 126.978 }); // 서울로 리셋
    } else {
      // 위치 추적 시작
      if (navigator.geolocation) {
        setIsLocationTracking(true);
        watchId.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            console.warn("위치 추적 오류:", err);
            setIsLocationTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );
      }
    }
  };

  // 초기 위치 설정
  useEffect(() => {
    setUserLocation({ lat: 37.5665, lng: 126.978 });
  }, []);
  // 상세설명 번역
  useEffect(() => {
    (async () => {
      if (!selectedPOI || !selectedPOI.description) {
        setTranslatedDesc("");
        return;
      }
      const text = selectedPOI.description;
      if (selectedLang === "ko") {
        setTranslatedDesc(text);
        return;
      }
      try {
        const out = await translateText(text, selectedLang);
        setTranslatedDesc(out);
      } catch {
        setTranslatedDesc(text);
      }
    })();
  }, [selectedPOI, selectedLang]);

  useEffect(() => {
    (async () => {
      if (isDocentActive && selectedPOI && translatedDesc) {
        setIsPlaying(true);
        try {
          await speakText(translatedDesc, selectedLang);
        } finally {
          setIsPlaying(false);
        }
      }
    })();
  }, [isDocentActive, selectedPOI, translatedDesc, selectedLang]);

  const VISIBLE_LIMIT = 3; // 10에서 3으로 변경
  const limitedListData = useMemo(
    () => listData.slice(0, VISIBLE_LIMIT),
    [listData]
  );
  const nearbyCsvCards = useMemo(() => {
    if (!userLocation || !csvData.length) return [];
    return csvData.filter((card) => {
      const lat = parseFloat(card.lat),
        lon = parseFloat(card.lon);
      if (isNaN(lat) || isNaN(lon)) return false;
      return getDistance(userLocation.lat, userLocation.lng, lat, lon) <= 0.05;
    });
  }, [userLocation, csvData]);
  const limitedNearby = useMemo(
    () => nearbyCsvCards.slice(0, VISIBLE_LIMIT),
    [nearbyCsvCards]
  );

  const mapPoisMobile = useMemo(
    () => (selectedPOI ? [selectedPOI] : filteredList),
    [selectedPOI, filteredList]
  );
  const mapPoisDesktop = useMemo(
    () => (selectedPOI ? [selectedPOI] : filteredList),
    [selectedPOI, filteredList]
  );
  const stopAllTTS = () => {
    stopTTS();
    setIsPlaying(false);
  };

  // 챗봇 function 불러옴
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
  // 카테고리 버튼
  const CategoryBar = ({ ui, category, setCategory }) => (
    <div className="bg-gray-900/80 backdrop-blur-lg border-b border-purple-500/30 px-4 py-3">
      <div className={`flex flex-wrap ${isMobile ? "gap-1" : "gap-2"}`}>
        {CATEGORY_OPTIONS.map((key) => (
          <NeonButton
            key={key}
            size="sm"
            variant={category === key ? "primary" : "outline"}
            onClick={() => {
              setCategory(key);
              setExpanded(false); // 카테고리 변경 시 챗봇창 축소
              setSelectedPOI(null); // 카테고리 변경 시 상세정보 닫기
            }}
            className={`rounded-full transition-all duration-300 ${
              isMobile
                ? `px-2 py-1 text-xs ${
                    category === key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : "border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-400"
                  }`
                : `px-4 py-2 text-sm ${
                    category === key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : "border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-400"
                  }`
            }`}
          >
            {ui?.categories?.[key] || key}
          </NeonButton>
        ))}
      </div>
    </div>
  );

  // =========================
  // 모바일
  // =========================
  if (isMobile) {
    return (
      <BackgroundEffect>
        <NeonScrollbarStyles />
        <div
          className="h-screen flex flex-col"
          style={{ height: "calc(100vh - 75px)" }}
        >
          {/* 헤더 */}
          <div className="bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 px-3 py-2 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Navigation className="w-3 h-3 text-white" />
                </div>
                <GradientText
                  variant="secondary"
                  size="lg"
                  className="font-bold"
                >
                  {ui.title}
                </GradientText>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="border border-purple-500/30 rounded px-1 py-0.5 text-xs bg-gray-800/50 text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">Eng</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={isDocentActive}
                    onCheckedChange={(v) => {
                      if (!v) stopAllTTS();
                      setIsDocentActive(v);
                    }}
                    className="data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:bg-gradient-to-r scale-75"
                  />
                  <span className="text-xs text-gray-300">AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={isLocationTracking}
                    onCheckedChange={toggleLocationTracking}
                    className="data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=checked]:bg-gradient-to-r scale-75"
                  />
                  <span className="text-xs text-gray-300">
                    {ui?.location || "위치"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리 바를 헤더 밖으로 이동 */}
          <CategoryBar ui={ui} category={category} setCategory={setCategory} />

          {/* 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* 지도 */}
            <div
              className={`${
                selectedPOI ? "h-1/2" : "h-1/3"
              } flex-shrink-0 border border-purple-500/20 rounded-lg m-2 overflow-hidden relative z-20 transition-all duration-500 ease-in-out`}
              style={{ pointerEvents: "auto", touchAction: "none" }}
            >
              <LocationMap
                userLocation={userLocation}
                pois={mapPoisMobile}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => {
                  setSelectedPOI(poi);
                  setExpanded(false); // POI 선택 시 챗봇창 축소
                }}
                showSelectedPopup
                directionsLabel={ui.directions}
                selectedLang={selectedLang}
              />
            </div>

            {/* 카드 목록 영역 */}
            <div className="flex-1 min-h-0">
              <NeonCardJHMobile className="m-2 ">
                <div className="p-3 pb-1 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-white mb-3 flex-shrink-0">
                    {selectedPOI
                      ? ui?.detailedInfo || "상세 정보"
                      : category === "all"
                      ? ui?.allTourismSpots || "전체 관광지"
                      : ui?.categories?.[category] || category}
                  </h3>
                  <div className="flex-1 min-h-0 overflow-y-auto neon-scrollbar">
                    {selectedPOI ? (
                      <POIDetails
                        poi={{ ...selectedPOI, description: translatedDesc }}
                        userLocation={userLocation}
                        onPlayTTS={() =>
                          speakText(translatedDesc, selectedLang)
                        }
                        isDocentActive={isDocentActive}
                        isMobile={isMobile}
                        ui={ui}
                        selectedLang={selectedLang}
                      />
                    ) : (
                      <POIListJH
                        pois={filteredList}
                        maxRows={0}
                        selectedPOI={selectedPOI}
                        nearbyPOIs={[]}
                        userLocation={userLocation}
                        onSelectPOI={(poi) => {
                          setSelectedPOI(poi);
                          setExpanded(false); // 카드 선택 시 챗봇창 축소
                        }}
                        isDocentActive={isDocentActive}
                        isPlaying={isPlaying}
                      />
                    )}
                  </div>
                </div>
              </NeonCardJHMobile>
            </div>

            {/* 하단 고정 챗봇 */}
            <div
              className={`transition-[height] duration-300 ease-in-out ${
                expanded ? "h-[50%]" : "h-[10%]"
              } flex-shrink-0`}
            >
              <FixedChatbot
                callApi={callTourismAPI}
                ui={ui}
                isMobile={true}
                selectedLang={selectedLang}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            </div>
            {/* <FixedChatbot
              callApi={callTourismAPI}
              ui={ui}
              isMobile
              selectedLang={selectedLang}
              expanded={expanded}
              setExpanded={setExpanded}
            /> */}
          </div>
        </div>
      </BackgroundEffect>
    );
  }

  // =========================
  // 데스크톱
  // =========================

  return (
    <BackgroundEffect>
      <NeonScrollbarStyles />
      <div className="h-screen flex flex-col">
        {/* 헤더 - 기존과 동일 */}
        <div className="bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 px-6 py-4 shadow-lg">
          {/* 헤더 내용 그대로 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <GradientText
                  variant="secondary"
                  size="xl"
                  className="font-bold"
                >
                  {ui.title}
                </GradientText>
                <p className="text-xs text-gray-400">{ui.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="border border-purple-500/30 rounded-md px-2 py-1 text-sm bg-gray-800/50 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">中文(简体)</option>
              </select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isDocentActive}
                  onCheckedChange={(v) => {
                    if (!v) stopAllTTS();
                    setIsDocentActive(v);
                  }}
                />
                <span className="data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:bg-gradient-to-r">
                  {ui.aiDocent}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isLocationTracking}
                  onCheckedChange={toggleLocationTracking}
                />
                <span className="data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=checked]:bg-gradient-to-r">
                  {ui?.locationTracking || "위치 추적"}
                </span>
              </div>
              {isPlaying && (
                <NeonButton
                  variant="outline"
                  size="sm"
                  onClick={stopAllTTS}
                  className="flex items-center gap-1"
                >
                  <VolumeX className="w-4 h-4 mr-1" />
                  {ui.stopVoice}
                </NeonButton>
              )}
            </div>
          </div>
        </div>
        {/* 카테고리 바  */}
        <CategoryBar ui={ui} category={category} setCategory={setCategory} />
        {/* 메인 콘텐츠 - 수직으로 60%/40% 분할 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 상단 영역 (60%) - POI리스트 + 지도 + 상세정보 */}
          <div className="h-[60%] flex min-h-0">
            {/* 왼쪽 POI 리스트 */}
            <div className="w-80 flex-shrink-0">
              <NeonCardJH className="h-full overflow-hidden">
                <div className="p-3 pb-1 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {ui?.tourismList || "관광지 목록"}
                  </h3>
                  <div className="flex-1 min-h-0 overflow-y-auto neon-scrollbar">
                    <POIListJH
                      pois={filteredList}
                      maxRows={6}
                      selectedPOI={selectedPOI}
                      nearbyPOIs={[]}
                      userLocation={userLocation}
                      onSelectPOI={(poi) => {
                        setSelectedPOI(poi);
                        setExpanded(false); // 카드 선택 시 챗봇창 축소
                      }}
                      isDocentActive={isDocentActive}
                      isPlaying={isPlaying}
                    />
                  </div>
                </div>
              </NeonCardJH>
            </div>

            {/* 중앙 지도 */}
            <div className="w-1/2 relative min-w-0 min-h-0 m-3">
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border border-purple-500/20 kakao-map-theme"
                style={{ pointerEvents: "auto" }}
              >
                <LocationMap
                  userLocation={userLocation}
                  pois={mapPoisDesktop}
                  selectedPOI={selectedPOI}
                  onSelectPOI={(poi) => {
                    setSelectedPOI(poi);
                    setExpanded(false); // POI 선택 시 챗봇창 축소
                  }}
                  showSelectedPopup
                  directionsLabel={ui.directions}
                  selectedLang={selectedLang}
                />
              </div>
            </div>

            {/* 오른쪽 상세정보  */}
            <div className="w-80 flex-shrink-0">
              <NeonCardJH className="h-full">
                <div className="p-3 pb-0 h-full">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {ui?.detailedInfo || "상세 정보"}
                  </h3>

                  {/* 강제 높이 제한으로 스크롤 보장 */}
                  <div
                    className="overflow-y-auto neon-scrollbar pb-2"
                    style={{
                      height: "calc(100% - 2.5rem)", // 헤더 높이만큼 빼기
                      // maxHeight: "500px", // 최대 높이 제한
                    }}
                  >
                    <div className="poi-details">
                      <POIDetails
                        poi={
                          selectedPOI
                            ? { ...selectedPOI, description: translatedDesc }
                            : null
                        }
                        userLocation={userLocation}
                        onPlayTTS={() =>
                          speakText(translatedDesc, selectedLang)
                        }
                        isDocentActive={isDocentActive}
                        ui={ui}
                        selectedLang={selectedLang}
                      />
                    </div>
                  </div>
                </div>
              </NeonCardJH>
            </div>
          </div>
          <style jsx global>{`
            /* ===== Kakao InfoWindow / CustomOverlay 글자 가독성 ===== */
            .kakao-map-theme {
              --map-popup-title: #3e4044ff; /* 제목 색 */
              --map-popup-text: #27324d; /* 본문 색 */
              --map-popup-btn: #3f4042ff; /* 버튼 글자 색 */
            }

            /* 팝업 내부 텍스트가 다른 유틸에 의해 덮이지 않도록 */
            .kakao-map-theme .map-popup * {
              color: inherit;
            }
            /* ===== 우측 상세 정보(흰 카드) 글자 가독성 ===== */
            .poi-details {
              color: #0f172a;
              opacity: 1 !important; /* 상위에서 opacity 먹는 경우 무력화 */
            }
            .poi-details h1,
            .poi-details h2,
            .poi-details h3,
            .poi-details .title,
            .poi-details .poi-name {
              color: #1d273a !important; /* "갤러리 학고재" 같은 제목 */
              font-weight: 800 !important;
              text-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
            }
            .poi-details p,
            .poi-details li {
              color: #2b3242 !important; /* 본문 */
              line-height: 1.55;
            }
            .poi-details a {
              color: #1f2937 !important;
              font-weight: 700;
            }
            .poi-details [class*="opacity-"] {
              opacity: 1 !important;
            } /* 불투명 강제 */
            .poi-details [class*="text-white/"],
            .poi-details [class*="text-gray-"] {
              color: #1d273a !important;
            } /* 희미한 유틸 클래스 무력화 */
          `}</style>

          {/* 하단 챗봇 영역 (40%) */}
          <div
            className={`transition-[height] duration-300 ease-in-out ${
              expanded ? "h-[60%]" : "h-[40%]"
            } flex-shrink-0`}
          >
            <FixedChatbot
              callApi={callTourismAPI}
              ui={ui}
              isMobile={false}
              selectedLang={selectedLang}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </div>
        </div>
      </div>
    </BackgroundEffect>
  );
}
