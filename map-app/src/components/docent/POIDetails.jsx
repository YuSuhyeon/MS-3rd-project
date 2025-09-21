import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { translateText } from "../../integrations/translator";

export default function POIDetails({
  poi,
  userLocation,
  onPlayTTS,
  isDocentActive,
  isMobile = false,
  ui = null,
  selectedLang = "ko",
}) {
  const [translatedName, setTranslatedName] = useState(poi?.name || "");

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
      <div className="h-full flex items-center justify-center text-gray-500">
        장소를 선택하세요
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
            <Button onClick={() => onPlayTTS?.(poi)} className="flex-1">
              {ui?.voiceGuide || "음성 안내"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={openKakaoDirections}
            className="flex-1"
          >
            {ui?.directions || "길찾기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
