import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { translateText } from "../../integrations/translator";

export default function POIDetails({
  poi,
  userLocation,
  onPlayTTS,
  onStopTTS,
  isDocentActive,
  isPlaying = false,
  isMobile = false,
  selectedLang = "ko",
  t = null,
}) {
  const [translatedName, setTranslatedName] = useState(poi?.name || "");
  const [isVoiceActive, setIsVoiceActive] = useState(isDocentActive);

  // AI 도슨트 상태에 따라 버튼 상태 업데이트
  useEffect(() => {
    setIsVoiceActive(isDocentActive);
  }, [isDocentActive]);

  // POI 제목 번역 처리
  useEffect(() => {
    const translatePOIName = async () => {
      if (!poi?.name) {
        setTranslatedName("");
        return;
      }

      if (selectedLang === "ko") {
        setTranslatedName(poi.name);
        return;
      }

      try {
        const translated = await translateText(poi.name, selectedLang);
        setTranslatedName(translated);
      } catch (error) {
        console.error("POI name translation error:", error);
        setTranslatedName(poi.name);
      }
    };

    translatePOIName();
  }, [poi?.name, selectedLang]);

  if (!poi) {
    return (
      <div className="h-full flex items-center justify-center text-purple-300">
        {t("selectPlace")}
      </div>
    );
  }
  const openKakaoDirections = () => {
    if (!userLocation) return;
    const sName = "내 위치";
    const eName = poi.name || "도착지";
    window.open(
      `https://map.kakao.com/?sName=${encodeURIComponent(
        sName
      )}&eName=${encodeURIComponent(eName)}`,
      "_blank"
    );
  };
  return (
    <Card
      className={`${
        isMobile ? "h-max" : "h-full"
      } rounded-xl border border-purple-500/20 bg-black/40 p-4 shadow-lg shadow-purple-500/10 backdrop-blur-sm transition-transform hover:-translate-y-1`}
    >
      <CardHeader className="p-0 mb-3">
        <CardTitle className="text-lg font-bold text-white">
          {translatedName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-sm text-gray-200 mb-4 whitespace-pre-wrap">
          {poi.description}
        </p>
        <div className="flex gap-2">
          {isDocentActive && (
            <Button
              onClick={() => {
                if (isVoiceActive) {
                  setIsVoiceActive(false);
                  onStopTTS?.();
                } else {
                  setIsVoiceActive(true);
                  onPlayTTS?.();
                }
              }}
              className={`flex-1 text-xs py-1 px-2 h-8 whitespace-nowrap border-0 ${
                isVoiceActive
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              }`}
            >
              {isVoiceActive ? t("stopVoice") : t("voiceGuide")}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={openKakaoDirections}
            className="flex-1 text-xs py-1 px-2 h-8 border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 hover:bg-purple-500/10"
          >
            {t("directions")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
