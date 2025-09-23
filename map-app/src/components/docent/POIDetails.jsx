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
    <Card className={`${isMobile ? "h-max" : "h-full"} rounded-none border-0 `}>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900">
          {translatedName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{poi.description}</p>
        <div className="flex gap-2">
          {isDocentActive && (
            <Button 
              onClick={() => {
                if (isVoiceActive) {
                  // 음성 중지
                  setIsVoiceActive(false);
                  onStopTTS?.();
                } else {
                  // 음성 재생
                  setIsVoiceActive(true);
                  onPlayTTS?.();
                }
              }} 
              className={`flex-1 text-xs py-1 px-2 h-8 whitespace-nowrap ${
                isVoiceActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isVoiceActive ? t("stopVoice") : t("voiceGuide")}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={openKakaoDirections}
            className="flex-1 text-xs py-1 px-2 h-8"
          >
            {t("directions")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
