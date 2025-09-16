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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "components/ui/card";
import { translateText } from "integrations/translator";
import { speakText, stopTTS } from "integrations/tts";
import Papa from "papaparse";

import POIList from "components/docent/POIList";
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";

// ★★★ useIsMobile 훅을 직접 구현
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

// 다국어 UI 텍스트
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
      "こんにちは！私はあなたのAIトラベルドーセントです。場所や旅行情報について何でも聞いてください。写真を送っていただければ、その場所について詳しく説明します！",
    imageQueryText: "この場所について教えてください",
    voiceRecStart: "音声録音を開始します...",
    voiceRecResult: "音声認識結果:",
    voiceRecStop: "音声録音を停止します。",
    errorReply:
      "申し訳ありませんが、応答の生成中にエラーが発生しました。後でもう一度お試しください。",
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
  },
};

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
// ## 고정형 챗봇 컴포넌트 (모바일/데스크톱 공용)
// #################################################################
const FixedChatbot = ({ callApi, ui, isMobile }) => {
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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isProcessing]);

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
      const result = await callApi(content);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: result,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: ui.errorReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleSendMessage(ui.imageQueryText, [
        { type: "image", url: imageUrl, caption: file.name },
      ]);
    }
  };

  // 모바일과 데스크톱에 따라 높이 조정
  const chatHeight = isMobile ? "h-[280px]" : "h-[350px]";

  return (
    <div className="w-full bg-white border-t border-gray-200 flex-shrink-0">
      <Card
        className={`flex flex-col ${chatHeight} shadow-none border-none rounded-none`}
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
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
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
                          className="rounded-lg max-w-full h-auto"
                        />
                      )}
                    </div>
                  ))}
                  <div className="whitespace-pre-line text-sm leading-relaxed">
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Camera className="w-5 h-5" />
            </Button>
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
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTextSend()}
                placeholder={ui.chatbotPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isProcessing}
              />
            </div>
            <Button
              size="icon"
              onClick={handleTextSend}
              disabled={!inputMessage.trim() || isProcessing}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
// ## 메인 DocentMantine 컴포넌트
// #################################################################
export default function DocentMantine() {
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isDocentActive, setIsDocentActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedLang, setSelectedLang] = useState("ko");
  const [translatedDesc, setTranslatedDesc] = useState("");

  const ui = UI[selectedLang] || UI.ko;
  const isMobile = useIsMobile();

  const watchId = useRef(null);
  const poisRef = useRef([]);

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

  const csvPois = useMemo(() => {
    return (csvData || [])
      .map((row) => {
        const lat = parseFloat(row.lat);
        const lng = parseFloat(row.lon);
        if (isNaN(lat) || isNaN(lng)) return null;
        return {
          id: row.poi_id || `${row.name_ko}-${lat}-${lng}`,
          name_ko: row.name_ko || "장소",
          address_ko: row.address_ko || "",
          description_ko: row.rag_seed_text_ko || "",
          location: { lat, lng },
          _raw: row,
        };
      })
      .filter(Boolean);
  }, [csvData]);

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
    if (!csvPois.length) return (pois || []).map((p) => ({ ...p }));
    return csvPois.map((c) => ({
      id: c.id,
      name: selectedLang === "ko" ? c.name_ko : nameTr[c.id] || c.name_ko,
      address:
        selectedLang === "ko" ? c.address_ko : addrTr[c.id] || c.address_ko,
      description: c.description_ko,
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

  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("위치 추적 오류:", err);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    }
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
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

  const VISIBLE_LIMIT = 10;
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
    () => (selectedPOI ? [selectedPOI] : limitedListData),
    [selectedPOI, limitedListData]
  );
  const mapPoisDesktop = useMemo(
    () => (selectedPOI ? [selectedPOI] : listData),
    [selectedPOI, listData]
  );
  const stopAllTTS = () => {
    stopTTS();
    setIsPlaying(false);
  };
  //azure function 사용
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

  // =========================
  // 모바일 레이아웃
  // =========================
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{ui.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="border rounded-md px-2 py-1 text-xs"
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
                />
                <label className="text-sm font-medium">{ui.aiDocent}</label>
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 지도 */}
          <div className="h-1/3 flex-shrink-0">
            <LocationMap
              userLocation={userLocation}
              pois={mapPoisMobile}
              selectedPOI={selectedPOI}
              onSelectPOI={setSelectedPOI}
              showSelectedPopup
            />
          </div>

          {/* 목록/상세정보 (스크롤) */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-white">
            {selectedPOI ? (
              <POIDetails
                poi={{ ...selectedPOI, description: translatedDesc }}
                userLocation={userLocation}
                onPlayTTS={() => speakText(translatedDesc, selectedLang)}
                isDocentActive={isDocentActive}
              />
            ) : (
              <POIList
                pois={limitedListData}
                selectedPOI={selectedPOI}
                nearbyPOIs={limitedNearby}
                userLocation={userLocation}
                onSelectPOI={(poi) => setSelectedPOI(poi)}
                isDocentActive={isDocentActive}
                isPlaying={isPlaying}
              />
            )}
          </div>

          {/* 하단 고정 챗봇 */}
          <FixedChatbot callApi={callTourismAPI} ui={ui} isMobile={true} />
        </div>
      </div>
    );
  }

  // =========================
  // 데스크톱 레이아웃
  // =========================
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ui.title}</h1>
              <p className="text-xs text-gray-500">{ui.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
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

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 min-h-0">
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <POIList
            pois={listData}
            selectedPOI={selectedPOI}
            nearbyPOIs={nearbyCsvCards}
            userLocation={userLocation}
            onSelectPOI={(poi) => setSelectedPOI(poi)}
            isDocentActive={isDocentActive}
            isPlaying={isPlaying}
          />
        </div>
        <div className="flex-1 relative min-w-0 min-h-0">
          <div className="absolute inset-0">
            <LocationMap
              userLocation={userLocation}
              pois={mapPoisDesktop}
              selectedPOI={selectedPOI}
              onSelectPOI={setSelectedPOI}
              showSelectedPopup
            />
          </div>
        </div>
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
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

      {/* 하단 고정 챗봇 (데스크톱용) */}
      <FixedChatbot callApi={callTourismAPI} ui={ui} isMobile={false} />
    </div>
  );
}
