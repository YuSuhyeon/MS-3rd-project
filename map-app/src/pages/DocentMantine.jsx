import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { POI } from "Entities/POI";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { Navigation, VolumeX, MessageCircle, Send, X } from "lucide-react";
import { translateText } from "integrations/translator";
import { speakText, stopTTS } from "integrations/tts";
import Papa from "papaparse";

import POIList from "components/docent/POIList";
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";

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
        "오징어게임 촬영지",
      ],
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

export default function DocentMantine() {
  const { t } = useTranslation();
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isDocentActive, setIsDocentActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [csvData, setCsvData] = useState([]);
  const [selectedLang, setSelectedLang] = useState("ko");
  const [translatedDesc, setTranslatedDesc] = useState("");

  // 챗봇 관련 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const ui = UI[selectedLang] || UI.ko;

  const watchId = useRef(null);
  const poisRef = useRef([]);
  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

  // Load CSV (from public)
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

  // Build POIs from CSV with per-language name/address
  const csvPois = useMemo(() => {
    const base = (csvData || [])
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
    return base;
  }, [csvData]);

  // Translation caches for name/address
  const [nameTr, setNameTr] = useState({});
  const [addrTr, setAddrTr] = useState({});
  useEffect(() => {
    (async () => {
      if (!csvPois.length) return;
      if (selectedLang === "ko") {
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

  // Effective POIs with translated fields
  const listData = useMemo(() => {
    if (!csvPois.length)
      return (pois || []).map((p) => ({
        id: p.id,
        name: p.name,
        address: "",
        description: p.description,
        location: p.location,
      }));
    return csvPois.map((c) => ({
      id: c.id,
      name: selectedLang === "ko" ? c.name_ko : nameTr[c.id] || c.name_ko,
      address:
        selectedLang === "ko" ? c.address_ko : addrTr[c.id] || c.address_ko,
      description: c.description_ko,
      location: c.location,
    }));
  }, [csvPois, pois, selectedLang, nameTr, addrTr]);

  // Load POIs (fallback) if CSV empty
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

  // Geolocation
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

  // Translate selected description
  useEffect(() => {
    (async () => {
      if (!selectedPOI) {
        setTranslatedDesc("");
        return;
      }
      const text = selectedPOI.description || "";
      if (!text) {
        setTranslatedDesc("");
        return;
      }
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

  // Auto play TTS
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

  const nearbyCsvCards = useMemo(() => {
    if (!userLocation || !csvData.length) return [];
    return csvData.filter((card) => {
      const lat = parseFloat(card.lat),
        lon = parseFloat(card.lon);
      if (isNaN(lat) || isNaN(lon)) return false;
      return getDistance(userLocation.lat, userLocation.lng, lat, lon) <= 0.05;
    });
  }, [userLocation, csvData]);

  const stopAllTTS = () => {
    stopTTS();
    setIsPlaying(false);
  };

  // 챗봇 API 호출 함수
  // 챗봇 API 호출 함수 - Azure Functions 사용
  const callTourismAPI = async (userQuery) => {
    // Azure Functions URL로 변경
    const functionUrl =
      "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/tourismqnaapi?code=BcqZANgpmolF-eQNAkdB4BgrhINolY8tLktSFVRHhaGhAzFu3b1_Tw==";

    try {
      console.log("API 호출 시작:", userQuery);

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userQuery,
          location: "Seoul,KR",
        }),
      });

      console.log("응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("응답 오류:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API 응답 성공:", result);

      // Azure API 응답 형식에 맞춰 반환
      return result.answer || result;
    } catch (error) {
      console.error("API 호출 오류:", error);
      throw error;
    }
  };
  // 챗봇 질문 제출 핸들러
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    setChatLoading(true);
    setChatAnswer("");

    try {
      const result = await callTourismAPI(chatQuery);
      setChatAnswer(result);
    } catch (error) {
      setChatAnswer(
        "죄송합니다. 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // 예시 질문 클릭 핸들러
  const handleExampleClick = (example) => {
    setChatQuery(example);
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* 챗봇 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          {isChatbotOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* 챗봇 모달 */}
      {isChatbotOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="flex flex-col h-full">
            {/* 챗봇 헤더 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">{t("docent.chatbot")}</h3>
              <p className="text-sm opacity-90">{t("docent.ask")}</p>
            </div>

            {/* 챗봇 내용 */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* 예시 질문들 */}
              {!chatAnswer && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t("docent.examples.title")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(t("docent.examples.items", { returnObjects: true }) || []).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border text-gray-700 transition-colors"
                        disabled={chatLoading}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 답변 표시 */}
              {chatAnswer && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">답변:</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {chatAnswer}
                  </div>
                </div>
              )}

              {/* 로딩 상태 */}
              {chatLoading && (
                <div className="text-center py-4 text-gray-500">
                  답변을 생성하고 있습니다...
                </div>
              )}
            </div>

            {/* 챗봇 입력 폼 */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder={t("docent.input.placeholder")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <Button
                  type="submit"
                  disabled={chatLoading || !chatQuery.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md disabled:opacity-50"
                >
                  {chatLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 기존 UI */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t("docent.title")}</h1>
              <p className="text-xs text-gray-500">{t("docent.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="ko">{t("lang.ko")}</option>
              <option value="en">{t("lang.en")}</option>
              <option value="ja">{t("lang.ja")}</option>
              <option value="zh">{t("lang.zh")}</option>
            </select>
            <div className="flex items-center gap-2">
              <Switch
                checked={isDocentActive}
                onCheckedChange={(v) => {
                  if (!v) stopAllTTS();
                  setIsDocentActive(v);
                }}
              />
              <span className="text-sm font-medium">{t("docent.ai_docent")}</span>
            </div>
            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAllTTS}
                className="text-red-600 hover:text-red-700"
              >
                <VolumeX className="w-4 h-4 mr-1" />
                {t("docent.stop_voice")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-80 bg-white border-r border-gray-200">
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
        <div className="flex-1">
          <LocationMap
            userLocation={userLocation}
            pois={listData}
            selectedPOI={selectedPOI}
            onSelectPOI={setSelectedPOI}
          />
        </div>
        <div className="w-80 bg-white border-l border-gray-200">
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
  );
}
