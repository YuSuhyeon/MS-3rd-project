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

import POIList from "components/docent/POIList";
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";

// ========= YOLO / Azure Function (환경변수)
const YOLO_API = process.env.REACT_APP_YOLO_API || "/api";
const AZURE_FUNC_BASE = process.env.REACT_APP_AZURE_FUNC_BASE || "/api";

// ★★★ useIsMobile 훅
const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < bp);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bp]);
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

// #################################################################
// ## 고정형 챗봇 (모바일/데스크톱 공용)
// #################################################################
const FixedChatbot = ({ callApi, ui, isMobile, selectedLang = "ko" }) => {
  const [messages, setMessages] = useState([
    {
      id: "initial",
      type: "ai",
      content: ui.chatbotInitialMessage,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // 갤러리/파일
  const cameraInputRef = useRef(null); // 카메라(촬영)

  useEffect(() => {
    // 언어가 바뀌면 초기 메시지만 새 언어로
    setMessages([
      {
        id: "initial",
        type: "ai",
        content: ui.chatbotInitialMessage,
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
  }, [ui.chatbotInitialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const chatHeight = isMobile
    ? expanded
      ? "h-[60vh]"
      : "h-[240px]"
    : expanded
    ? "h-[55vh]"
    : "h-[350px]";

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

  const fetchPOIInfos = async (names) => {
    const resp = await fetch(`${AZURE_FUNC_BASE}/poi-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names, lang: "ko" }),
    });
    if (!resp.ok) throw new Error(`Azure Function HTTP ${resp.status}`);
    const js = await resp.json();
    return js?.items || [];
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
      // ko ↔ selectedLang 자동 변환
      const toKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, "ko");
      const fromKo = async (t) =>
        selectedLang === "ko" ? t : await translateText(t, selectedLang);

      const koQuery = await toKo(content || "");
      const koResult = await callApi(koQuery);
      const result = await fromKo(koResult);

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

  const processImage = async (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setExpanded(true); // 업로드하면 자동 확대

    // 사용자 말풍선(이미지)
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
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            type: "ai",
            content: "대상이 인식되지 않았어요. 다른 사진으로 시도해 보실래요?",
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
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 2),
            type: "ai",
            content: `지원 라벨만 제공 중입니다.\n감지: ${tops}`,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const uniqueNames = Array.from(
        new Set(allowed.map((d) => d.canon))
      ).slice(0, 3);
      const infos = await fetchPOIInfos(uniqueNames);

      if (!infos.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: "ai",
            content: `인식: ${uniqueNames.join(
              ", "
            )} — 상세 정보를 가져오지 못했어요.`,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const infoTextBlocks = infos.map((info) => {
        const lines = [
          `**${info.name || ""}**`,
          info.address ? `• 주소: ${info.address}` : null,
          info.phone ? `• 전화: ${info.phone}` : null,
          info.open_hours_text ? `• 운영시간: ${info.open_hours_text}` : null,
          info.ticket_price_text ? `• 입장료: ${info.ticket_price_text}` : null,
          info.website ? `• 웹사이트: ${info.website}` : null,
          info.description ? `\n${info.description}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        return lines;
      });

      setMessages((prev) => [
        ...prev,
        ...infoTextBlocks.map((txt, i) => ({
          id: String(Date.now() + 4 + i),
          type: "ai",
          content: txt,
          timestamp: new Date(),
        })),
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 999),
          type: "ai",
          content: `오류가 발생했어요: ${String(err?.message || err)}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => URL.revokeObjectURL(imageUrl), 10000);
    }
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

  return (
    <div className="w-full bg-white/90 backdrop-blur-[2px] border-t border-gray-200 flex-shrink-0">
      <Card
        className={`flex flex-col ${chatHeight} transition-[height] duration-300 shadow-none border-none rounded-none`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78ch] rounded-2xl px-4 py-2.5 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.attachments?.map((attachment, index) => (
                    <div key={index} className="mb-2">
                      {attachment.type === "image" && (
                        <img
                          src={attachment.url}
                          alt={attachment.caption}
                          className="rounded-lg max-w-60 max-h-60 w-auto h-auto object-cover"
                        />
                      )}
                    </div>
                  ))}
                  <div className="whitespace-pre-line text-[15px] leading-relaxed">
                    {message.content}
                  </div>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
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
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2">
            {/* 파일 선택(갤러리) */}
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
            <Button
              size="icon"
              variant="ghost"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              title="카메라(촬영)"
            >
              <Camera className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              title="파일에서 선택"
              className="px-2"
            >
              {ui.filePick}
            </Button>

            {/* 음성 */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVoiceRecording}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
              disabled={isProcessing}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>

            {/* 텍스트 */}
            <div className="flex-1">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-[15px]"
                placeholder={ui.chatbotPlaceholder}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
              />
            </div>

            {/* 확대/축소 */}
            <Button
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
            </Button>

            {/* 전송 */}
            <Button
              size="icon"
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              onClick={() => handleTextSend()}
              disabled={!inputMessage.trim() || isProcessing}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
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

  const ui = UI[selectedLang] || UI.ko;
  const isMobile = useIsMobile();
  const watchId = useRef(null);

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

  // 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );
    return () =>
      watchId.current && navigator.geolocation.clearWatch(watchId.current);
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
        try {
          await speakText(translatedDesc, selectedLang);
        } finally {
          // 표시만 false로 둘 수 있음
        }
      }
    })();
  }, [isDocentActive, selectedPOI, translatedDesc, selectedLang]);

  const stopAllTTS = () => {
    stopTTS();
    setIsPlaying(false);
  };

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

  // 카테고리 버튼 – pill
  const CategoryBar = () => (
    <div className="flex flex-wrap gap-2 p-3 border-b bg-white/90 backdrop-blur-[2px]">
      {CATEGORY_OPTIONS.map((key) => (
        <Button
          key={key}
          size="sm"
          variant="ghost"
          onClick={() => setCategory(key)}
          className={
            category === key
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-sm"
              : "bg-white/80 border border-indigo-100 text-gray-700 rounded-full hover:bg-white"
          }
        >
          {ui.categories[key]}
        </Button>
      ))}
    </div>
  );

  // =========================
  // 모바일
  // =========================
  if (isMobile) {
    return (
      <div className="h-screen antialiased text-[15px] md:text-[16px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50/60 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white/90 backdrop-blur-[2px] border-b border-indigo-100 px-4 py-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  {ui.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="ko">한국어</option>
                <option value="en">Eng</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={isDocentActive}
                  onCheckedChange={(v) => {
                    if (!v) stopAllTTS();
                    setIsDocentActive(v);
                  }}
                  className="data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:bg-gradient-to-r"
                />
                <label className="text-sm font-medium">{ui.aiDocent}</label>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 바 */}
        <CategoryBar />

        {/* 지도 */}
        <div className="h-[34vh] flex-shrink-0">
          <LocationMap
            userLocation={userLocation}
            pois={filteredList}
            selectedPOI={selectedPOI}
            onSelectPOI={setSelectedPOI}
            showSelectedPopup
          />
        </div>

        {/* 목록/상세 */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white/90 backdrop-blur-[2px]">
          {selectedPOI ? (
            <POIDetails
              poi={{ ...selectedPOI, description: translatedDesc }}
              userLocation={userLocation}
              onPlayTTS={() => speakText(translatedDesc, selectedLang)}
              isDocentActive={isDocentActive}
            />
          ) : (
            <POIList
              pois={filteredList}
              maxRows={4}
              selectedPOI={selectedPOI}
              nearbyPOIs={[]}
              userLocation={userLocation}
              onSelectPOI={setSelectedPOI}
              isDocentActive={isDocentActive}
              isPlaying={isPlaying}
            />
          )}
        </div>

        {/* 하단 챗봇 */}
        <FixedChatbot
          callApi={callTourismAPI}
          ui={ui}
          isMobile
          selectedLang={selectedLang}
        />
      </div>
    );
  }

  // =========================
  // 데스크톱
  // =========================
  return (
    <div className="h-screen antialiased text-[15px] md:text-[16px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50/60 flex flex-col">
      {/* 상단바 */}
      <div className="bg-white/90 backdrop-blur-[2px] border-b border-indigo-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {ui.title}
              </h1>
              <p className="text-xs text-gray-600">{ui.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 text-gray-700 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                className="data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:bg-gradient-to-r"
              />
              <span className="text-sm font-medium">{ui.aiDocent}</span>
            </div>
            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAllTTS}
                className="text-red-600 hover:text-red-700"
              >
                <VolumeX className="w-4 h-4 mr-1" />
                {ui.stopVoice}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 카테고리 바 */}
      <CategoryBar />

      {/* 본문 3분할 */}
      <div className="flex flex-1 min-h-0">
        {/* 좌측: 목록 */}
        <div className="w-80 bg-white/90 backdrop-blur-[2px] border-r border-indigo-100 overflow-hidden">
          <POIList
            pois={filteredList}
            maxRows={4}
            selectedPOI={selectedPOI}
            nearbyPOIs={[]}
            userLocation={userLocation}
            onSelectPOI={setSelectedPOI}
            isDocentActive={isDocentActive}
            isPlaying={isPlaying}
          />
        </div>

        {/* 중앙: 지도 */}
        <div className="flex-1 relative min-w-0 min-h-0">
          <div className="absolute inset-0">
            <LocationMap
              userLocation={userLocation}
              pois={filteredList}
              selectedPOI={selectedPOI}
              onSelectPOI={setSelectedPOI}
              showSelectedPopup
            />
          </div>
        </div>

        {/* 우측: 상세(연보라 카드 프레임 + 테두리) */}
        <div className="w-80 bg-violet-50/60 border-l border-violet-200/60 px-3 py-3">
          <div className="h-full overflow-y-auto rounded-xl border border-violet-200 bg-violet-50/70 shadow-sm p-3">
            <POIDetails
              poi={
                selectedPOI
                  ? { ...selectedPOI, description: translatedDesc }
                  : null
              }
              userLocation={userLocation}
              onPlayTTS={() => speakText(translatedDesc, selectedLang)}
              isDocentActive={isDocentActive}
            />
          </div>
        </div>
      </div>

      {/* 하단 챗봇 */}
      <FixedChatbot
        callApi={callTourismAPI}
        ui={ui}
        isMobile={false}
        selectedLang={selectedLang}
      />
    </div>
  );
}
