import React, { useState, useEffect, useRef, useMemo } from "react";
import { POI } from "Entities/POI";
import { Switch } from "components/ui/switch";
import {
  Navigation,
  VolumeX,
  Send,
  RefreshCw,
  Camera,
  Bot,
  Maximize2,
  Minimize2,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translateText } from "integrations/translator";
import { speakText, stopTTS } from "integrations/tts";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// NeonTheme 컴포넌트들을 import
import {
  BackgroundEffect,
  NeonCardJH,
  NeonCardJHMobile,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";

import { POIListJH } from "components/docent/POIList";
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
  t,
  isMobile,
  selectedLang,
  expanded,
  setExpanded,
}) => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem("docentChatHistory");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
    return [
      {
        id: "initial",
        type: "ai",
        content: t("chatbotInitialMessage"),
        timestamp: new Date(),
      },
    ];
  });
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    setMessages((prev) => {
      const hasInitialMessage = prev.some((msg) => msg.id === "initial");
      if (hasInitialMessage) {
        return prev.map((msg) =>
          msg.id === "initial"
            ? { ...msg, content: t("chatbotInitialMessage") }
            : msg
        );
      } else {
        return [
          {
            id: "initial",
            type: "ai",
            content: t("chatbotInitialMessage"),
            timestamp: new Date(),
          },
          ...prev,
        ];
      }
    });
    setInputMessage("");
  }, [t("chatbotInitialMessage")]);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("docentChatHistory", JSON.stringify(messages));
    }
  }, [messages]);

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
      const koResult = await callApi(koQuery);

      if (checkIfShouldRedirectToTour(koResult)) {
        const tourMessage = t("tourDetection.message");

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
          content: t("errorReply"),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSend = () => handleSendMessage(inputMessage);

  const checkIfShouldRedirectToTour = (response) => {
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

  const handleTourRedirect = () => {
    sessionStorage.setItem("previousPage", window.location.pathname);
    sessionStorage.setItem("previousPageTitle", "AI Docent");
    sessionStorage.setItem("previousPageTimestamp", Date.now().toString());
    navigate("/tour");
  };

  const clearChatHistory = () => {
    const initialMessage = {
      id: "initial",
      type: "ai",
      content: t("chatbotInitialMessage"),
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    sessionStorage.removeItem("docentChatHistory");
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const processImage = async (file) => {
    if (!file) return;

    const imageBase64 = await fileToBase64(file);

    setExpanded(true);

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: "user",
        content: t("imageQueryText"),
        attachments: [{ type: "image", url: imageBase64, caption: file.name }],
        timestamp: new Date(),
      },
    ]);
    setIsProcessing(true);

    try {
      const dets = await callYOLO(file);

      if (!dets.length) {
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
      const ragResponse = await callApi(ragQuery);

      if (checkIfShouldRedirectToTour(ragResponse)) {
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
            originalResponse: ragResponse,
            timestamp: new Date(),
          },
        ]);
        return;
      }

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
    }
  };

  const renderTourButton = (message) => {
    if (message.type === "ai-tour" && message.showTourButton) {
      return (
        <div className="mt-3 space-y-2">
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
            {t("tourDetection.buttonText")}
          </button>
          {message.originalResponse && (
            <button
              onClick={async () => {
                let content = message.originalResponse;

                if (selectedLang !== "ko") {
                  content = await translateText(
                    message.originalResponse,
                    selectedLang
                  );
                }

                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(Date.now() + 1000),
                    type: "ai",
                    content: content,
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
              {t("viewDetails")}
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

  const chatHeight = isMobile ? "h-full" : "h-full";
  return (
    <div
      className={`${chatHeight} w-full bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-lg border-t border-purple-500/30`}
    >
      <div
        className={`flex flex-col ${chatHeight} ${
          isMobile ? "p-2" : "p-4"
        } transition-all duration-300`}
      >
        <div
          className={`${
            isMobile && !expanded ? "hidden" : "flex-1"
          } overflow-y-auto neon-scrollbar space-y-4 pb-2`}
        >
          <AnimatePresence>
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
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {renderTourButton(message)}
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
        <div
          className={`border-t border-purple-500/30 pt-3 ${
            isMobile && !expanded ? "mt-0" : "mt-3"
          } flex-shrink-0 bg-gray-900/95 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFromGallery}
              accept="image/*"
              className="hidden"
            />
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
                if (!expanded) setExpanded(true);
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
                if (!expanded) setExpanded(true);
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

            <NeonButton
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!expanded) setExpanded(true);
                clearChatHistory();
              }}
              disabled={isProcessing}
              title="대화 내역 새로고침"
            >
              <RefreshCw className="w-5 h-5" />
            </NeonButton>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing)
                    handleTextSend();
                }}
                onFocus={() => {
                  if (!expanded) setExpanded(true);
                }}
                placeholder={t("chatbotPlaceholder")}
                className="w-full px-4 py-2.5 border border-purple-500/30 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 text-sm bg-gray-800/70 text-white placeholder-gray-400 backdrop-blur-sm shadow-lg"
                disabled={isProcessing}
              />
            </div>
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
            <NeonButton
              size="icon"
              onClick={() => {
                if (!expanded) setExpanded(true);
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

const translationCache = new Map();
const guessCategoryKey = (raw) => {
  const s = (raw || "").toString().toLowerCase();
  if (/museum|미술|박물|gallery/.test(s)) return "museum";
  if (/palace|궁|고궁/.test(s)) return "palace";
  if (/landmark|tower|타워|랜드마크/.test(s)) return "landmark";
  if (/historic|역사|유적|heritage/.test(s)) return "historic";
  return "landmark";
};
export default function DocentMantine() {
  const { t, i18n } = useTranslation("DocentMantine");
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isDocentActive, setIsDocentActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedLang, setSelectedLang] = useState(i18n.language || "ko");
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const isMobile = useIsMobile();
  const watchId = useRef(null);
  const poisRef = useRef([]);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setSelectedLang(lng);
    };
    setSelectedLang(i18n.language);
    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

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

  const filteredList = useMemo(() => {
    if (category === "all") return listData;
    return listData.filter((p) => p.category === category);
  }, [listData, category]);

  const toggleLocationTracking = () => {
    if (isLocationTracking) {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsLocationTracking(false);
      setUserLocation({ lat: 37.5665, lng: 126.978 });
    } else {
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

  useEffect(() => {
    setUserLocation({ lat: 37.5665, lng: 126.978 });
  }, []);

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

  const CategoryDropdown = ({ t, category, setCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      if (isOpen) document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const currentLabel = t(`categories.${category}`) || category;

    const handleSelect = (value) => {
      setCategory(value);
      setExpanded(false);
      setSelectedPOI(null);
      setIsOpen(false);
    };

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-block text-left" ref={dropdownRef}>
          {/* ★★★ 내부 너비 고정은 제거해도 되지만, 시각적 일관성을 위해 유지합니다. */}
          <motion.button
            onClick={() => setIsOpen((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 h-10 px-3 text-sm font-medium text-white rounded-lg border border-purple-500/30 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-w-[7rem] max-w-[14rem]`}
            style={{
              background:
                "linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
            }}
            whileHover={{
              scale: 1.05,
              background:
                "linear-gradient(145deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="truncate max-w-[10rem]">{currentLabel}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 opacity-70" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.1 }}
                className={`absolute ${
                  isMobile ? "left-0" : "right-0"
                } mt-2 w-48 origin-top-right rounded-xl border border-purple-500/20 shadow-2xl ring-1 ring-black ring-opacity-5 z-50`}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(12, 12, 12, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="p-1">
                  {CATEGORY_OPTIONS.map((key) => (
                    <motion.button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className={`${
                        category === key
                          ? "bg-purple-600/30 text-purple-100"
                          : "text-gray-300 hover:bg-purple-600/20 hover:text-purple-200"
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{t(`categories.${key}`) || key}</span>
                      {category === key && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-purple-400 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

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
          <div className="bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 px-3 py-2 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-end">
              {/* ★★★ 최종 수정 (모바일): 컨트롤 그룹 전체를 감싸는 컨테이너입니다. w-full과 justify-end로 우측 정렬을 유지하면서 안정적인 레이아웃을 만듭니다. */}
              <div className="flex w-full items-center justify-end gap-2">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setExpanded(false);
                    setSelectedPOI(null);
                  }}
                  className="w-[120px] h-8 rounded-lg px-2 py-1 text-xs text-white backdrop-blur-sm cursor-pointer transition-all duration-200 shadow-[0_0_8px_rgba(168,85,247,0.25)] border border-purple-500/30 focus:outline-none focus:ring-1 focus:ring-purple-400/50 hover:border-purple-300"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                  }}
                >
                  {CATEGORY_OPTIONS.map((key) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-gray-900 text-white"
                      style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                    >
                      {t(`categories.${key}`) || key}
                    </option>
                  ))}
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
                  <span className="text-xs text-gray-300 w-12 text-center">
                    {t("location") || "위치"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div
              className={`${
                selectedPOI ? "h-1/2" : "h-1/3"
              } flex-shrink-0 border border-purple-500/20 rounded-lg m-2 overflow-hidden relative z-20 transition-all duration-500 ease-in-out`}
              style={{ pointerEvents: "auto", touchAction: "pan-x pan-y" }}
            >
              <LocationMap
                userLocation={userLocation}
                pois={mapPoisMobile}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => {
                  setSelectedPOI(poi);
                  setExpanded(false);
                }}
                showSelectedPopup
                directionsLabel={t("directions")}
                selectedLang={selectedLang}
              />
            </div>
            <div className="flex-1 min-h-0">
              <NeonCardJHMobile className="m-2 ">
                <div className="p-3 pb-1 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-white mb-3 flex-shrink-0">
                    {selectedPOI
                      ? t("detailedInfo") || "상세 정보"
                      : t(`categories.${category}`) || category}
                  </h3>
                  <div className="flex-1 min-h-0 overflow-y-auto neon-scrollbar">
                    {selectedPOI ? (
                      <POIDetails
                        poi={{ ...selectedPOI, description: translatedDesc }}
                        userLocation={userLocation}
                        onPlayTTS={async () => {
                          setIsPlaying(true);
                          try {
                            await speakText(translatedDesc, selectedLang);
                          } finally {
                            setIsPlaying(false);
                          }
                        }}
                        onStopTTS={() => {
                          stopAllTTS();
                          setIsPlaying(false);
                        }}
                        isDocentActive={isDocentActive}
                        isPlaying={isPlaying}
                        isMobile={isMobile}
                        t={t}
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
                          setExpanded(false);
                        }}
                        isDocentActive={isDocentActive}
                        isPlaying={isPlaying}
                      />
                    )}
                  </div>
                </div>
              </NeonCardJHMobile>
            </div>
            <div
              className={`transition-[height] duration-300 ease-in-out ${
                expanded ? "h-[50%]" : "h-[10%]"
              } flex-shrink-0`}
            >
              <FixedChatbot
                callApi={callTourismAPI}
                t={t}
                isMobile={true}
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

  // =========================
  // 데스크톱
  // =========================
  return (
    <>
      <NeonScrollbarStyles />
      <div className="h-screen flex flex-col">
        {/* 헤더 부분은 원래의 간단한 코드로 되돌립니다. */}
        <div
          className="relative z-50 bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 px-6 py-4 shadow-lg"
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              <CategoryDropdown
                t={t}
                category={category}
                setCategory={setCategory}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={isDocentActive}
                  onCheckedChange={(v) => {
                    if (!v) stopAllTTS();
                    setIsDocentActive(v);
                  }}
                />
                {/* 너비 고정 클래스를 제거하여 자연스러운 너비를 갖도록 합니다. */}
                <span className="text-white max-w-[12ch] truncate">
                  {t("aiDocent")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isLocationTracking}
                  onCheckedChange={toggleLocationTracking}
                />
                <span className="text-white max-w-[14ch] truncate">
                  {t("locationTracking") || "위치 추적"}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-[60%] flex min-h-0">
            <div className="w-80 flex-shrink-0 min-w-0">
              <NeonCardJH className="h-full overflow-hidden">
                <div className="p-3 pb-1 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t("tourismList") || "관광지 목록"}
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
                        setExpanded(false);
                      }}
                      isDocentActive={isDocentActive}
                      isPlaying={isPlaying}
                    />
                  </div>
                </div>
              </NeonCardJH>
            </div>
            
            {/* ★★★ 여기가 진짜 수정 지점입니다! ★★★ */}
            {/* 지도 패널의 너비를 w-[520px] 대신 flex-1로 변경하여 남은 공간을 모두 차지하게 합니다. */}
            <div className="flex-1 relative min-w-0 min-h-0 m-3">
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
                    setExpanded(false);
                  }}
                  showSelectedPopup
                  directionsLabel={t("directions")}
                  selectedLang={selectedLang}
                />
              </div>
            </div>
            
            <div className="w-80 flex-shrink-0 min-w-0">
              <NeonCardJH className="h-full">
                <div className="p-3 pb-0 h-full">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t("detailedInfo") || "상세 정보"}
                  </h3>
                  <div
                    className="overflow-y-auto neon-scrollbar pb-2"
                    style={{
                      height: "calc(100% - 2.5rem)",
                    }}
                  >
                    <div className="poi-details min-h-0">
                      <POIDetails
                        poi={
                          selectedPOI
                            ? { ...selectedPOI, description: translatedDesc }
                            : null
                        }
                        userLocation={userLocation}
                        onPlayTTS={async () => {
                          setIsPlaying(true);
                          try {
                            await speakText(translatedDesc, selectedLang);
                          } finally {
                            setIsPlaying(false);
                          }
                        }}
                        onStopTTS={() => {
                          stopAllTTS();
                          setIsPlaying(false);
                        }}
                        isDocentActive={isDocentActive}
                        isPlaying={isPlaying}
                        t={t}
                        selectedLang={selectedLang}
                      />
                    </div>
                  </div>
                </div>
              </NeonCardJH>
            </div>
          </div>
          <style jsx global>{`
            .kakao-map-theme {
              --map-popup-title: #e5e7eb;
              --map-popup-text: #d1d5db;
              --map-popup-btn: #f3f4f6;
            }
            .kakao-map-theme .map-popup * {
              color: inherit;
            }
          `}</style>
          <div
            className={`transition-[height] duration-300 ease-in-out ${
              expanded ? "h-[60%]" : "h-[40%]"
            } flex-shrink-0`}
          >
            <FixedChatbot
              callApi={callTourismAPI}
              t={t}
              isMobile={false}
              selectedLang={selectedLang}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </div>
        </div>
      </div>
    </>
  );
}
