import React, { useEffect, useRef, useState } from "react";
import {
  createKakaoMap,
  addKakaoMarkers,
  showKakaoInfoWindow,
  drawCircle,
} from "../../kakaoMap";
import { translateText } from "../../integrations/translator";

export default function LocationMap({
  pois = [],
  selectedPOI,
  onSelectPOI,
  userLocation,
  showSelectedPopup = false,
  directionsLabel = "길찾기",
  selectedLang = "ko",
}) {
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // key(id) -> marker
  const infoWindowRef = useRef(null); // 열린 InfoWindow
  const circleRef = useRef(null);
  const [translatedContent, setTranslatedContent] = useState(new Map()); // 번역된 내용 캐시
  const [currentPOI, setCurrentPOI] = useState(null); // 현재 선택된 POI 추적

  const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_API_KEY;
  const MARKER_IMG = process.env.PUBLIC_URL + "/img/card_blue.png";

  // 번역된 내용 가져오기
  const getTranslatedContent = (key) => {
    if (selectedLang === "ko" || !key) {
      return key;
    }
    // 번역된 내용이 있으면 사용, 없으면 원본 사용
    return translatedContent.get(key) || key;
  };

  // 팝업 HTML (가독성 색상 inline)
  const buildInfoContent = (name = "", address = "") => {
    const translatedName = getTranslatedContent(name);
    const translatedAddress = getTranslatedContent(address);
    const translatedDirectionsLabel = getTranslatedContent(directionsLabel);

    return `
      <div style="
        padding:8px 10px;
        max-width:260px;
        font-size:13px;
        line-height:1.45;
        color:var(--map-popup-text, #0f172a);
      ">
        <div style="
          color:var(--map-popup-title, #1b243a);
          font-weight:800;
          letter-spacing:.2px;
          margin-bottom:4px;
        ">${translatedName}</div>

        <div style="
          color:var(--map-popup-text, #27324d);
          margin-bottom:8px;
        ">${translatedAddress}</div>

        <button type="button" class="map-popup-btn" style="
          color:var(--map-popup-btn, #0b1220);
          font-weight:700;
          border:1px solid #cbd5e1;
          border-radius:6px;
          padding:6px 10px;
          background:#fff;
          cursor:pointer;
        ">
          ${translatedDirectionsLabel}
        </button>
      </div>
    `;
  };

  // 번역 처리
  useEffect(() => {
    const translateContent = async () => {
      if (selectedLang === "ko") {
        // 한국어인 경우 원본 그대로 사용
        setTranslatedContent(new Map());
        return;
      }

      const newTranslatedContent = new Map();

      // directionsLabel 번역
      if (directionsLabel) {
        try {
          const translated = await translateText(directionsLabel, selectedLang);
          newTranslatedContent.set(directionsLabel, translated);
        } catch (error) {
          console.error("Directions label translation error:", error);
          newTranslatedContent.set(directionsLabel, directionsLabel);
        }
      }

      // POI 이름과 주소 번역
      const allTexts = new Set();
      pois.forEach((poi) => {
        if (poi.name) allTexts.add(poi.name);
        if (poi.address) allTexts.add(poi.address);
      });

      for (const text of allTexts) {
        try {
          const translated = await translateText(text, selectedLang);
          newTranslatedContent.set(text, translated);
        } catch (error) {
          console.error("POI content translation error:", error);
          newTranslatedContent.set(text, text);
        }
      }

      setTranslatedContent(newTranslatedContent);
    };

    translateContent();
  }, [selectedLang, directionsLabel, pois]);

  // 통합된 팝업 관리 로직
  useEffect(() => {
    const updatePopup = () => {
      if (!mapRef.current || !currentPOI?.location) return;

      const key =
        currentPOI.id ||
        `${currentPOI.location.lat},${currentPOI.location.lng}`;
      const marker = markersRef.current.get(key);

      if (marker) {
        // 기존 팝업 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          infoWindowRef.current = null;
        }

        // 새 팝업 표시 (번역된 내용 포함)
        infoWindowRef.current = showKakaoInfoWindow({
          map: mapRef.current,
          marker,
          contentHtml: buildInfoContent(
            currentPOI.name || "",
            currentPOI.address || ""
          ),
        });
      }
    };

    if (currentPOI) {
      updatePopup();
    }
  }, [currentPOI, translatedContent]);

  // selectedPOI 변경 시 currentPOI 업데이트
  useEffect(() => {
    if (selectedPOI) {
      setCurrentPOI(selectedPOI);
    }
  }, [selectedPOI]);

  // 1) 최초 지도 생성
  useEffect(() => {
    if (!KAKAO_JS_KEY) {
      console.warn("Set REACT_APP_KAKAO_API_KEY in .env");
    }
    createKakaoMap({
      containerId: "docent-map",
      KAKAO_JS_KEY,
      center: userLocation || { lat: 37.5665, lng: 126.978 },
      level: 4,
      onMapReady: (map) => {
        mapRef.current = map;

        // 지도 클릭 시 원 갱신 + 팝업 닫기 + 선택 해제
        const { kakao } = window;
        kakao.maps.event.addListener(map, "click", (e) => {
          const latlng = e.latLng;
          const center = { lat: latlng.getLat(), lng: latlng.getLng() };
          if (circleRef.current) circleRef.current.setMap(null);
          circleRef.current = drawCircle({ map, center, radius: 50 });
          infoWindowRef.current?.close?.();
          infoWindowRef.current = null;
          onSelectPOI?.(null);
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) POI 마커 렌더/업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 기존 마커 정리
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    if (!Array.isArray(pois) || pois.length === 0) return;

    const data = pois.map((p) => ({
      poi_id: p.id,
      lat: p.location?.lat,
      lon: p.location?.lng,
      name: p.name,
      address: p.address,
    }));

    const { markers } = addKakaoMarkers({
      map,
      data,
      markerImg: MARKER_IMG,
      onClick: (row, marker) => {
        // 기존 팝업 닫기
        infoWindowRef.current?.close?.();
        infoWindowRef.current = null;

        const sel = pois.find((p) => p.id === row.poi_id) || {
          name: row.name,
          address: row.address,
          location: { lat: parseFloat(row.lat), lng: parseFloat(row.lon) },
        };

        // 현재 POI 업데이트
        setCurrentPOI(sel);
        onSelectPOI?.(sel);

        // 팝업 열기 (즉시 표시)
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          infoWindowRef.current = null;
        }

        infoWindowRef.current = showKakaoInfoWindow({
          map,
          marker,
          contentHtml: buildInfoContent(row.name || "", row.address || ""),
        });

        // 길찾기 클릭
        setTimeout(() => {
          const btn = document.querySelector(".map-popup-btn");
          if (btn) {
            btn.onclick = () => {
              const sName = "내 위치";
              const eName = row.name || "도착지";
              window.open(
                `https://map.kakao.com/?sName=${encodeURIComponent(
                  sName
                )}&eName=${encodeURIComponent(eName)}`,
                "_blank"
              );
            };
          }
        }, 60);
      },
    });

    // markers 저장 (Map or Array 대응)
    if (markers) {
      if (markers.forEach) {
        markers.forEach((m, key) => markersRef.current.set(key, m));
      } else if (Array.isArray(markers)) {
        markers.forEach((m, i) => {
          const key = data[i]?.poi_id ?? `${data[i]?.lat},${data[i]?.lon}`;
          if (m) markersRef.current.set(key, m);
        });
      }
    }
  }, [pois, directionsLabel]);

  // 3) 사용자 위치 원/센터
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (circleRef.current) circleRef.current.setMap(null);
    circleRef.current = drawCircle({ map, center: userLocation, radius: 50 });
    const { kakao } = window;
    map.setCenter(new kakao.maps.LatLng(userLocation.lat, userLocation.lng));
  }, [userLocation]);

  // 4) 선택된 POI가 바뀌면 자동 팝업
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showSelectedPopup || !selectedPOI) {
      infoWindowRef.current?.close?.();
      return;
    }

    // 팝업이 이미 5번 useEffect에서 처리되는 경우 스킵
    // (showSelectedPopup이 true이고 selectedPOI가 있는 경우)
    return;
  }, [selectedPOI, showSelectedPopup, directionsLabel]);

  // 5) 선택 시 지도 센터 이동 및 팝업 표시 (통합 처리)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPOI?.location) return;
    const { kakao } = window;
    const { lat, lng } = selectedPOI.location;

    // 지도 중심 이동
    const moveToCenter = () => {
      const moveLatLng = new kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLng);

      // 지도 크기 변화 후 다시 중심 조정 및 팝업 표시
      setTimeout(() => {
        map.relayout(); // 지도 크기 재계산

        // 팝업은 통합된 로직에서 처리되므로 여기서는 제거

        // 중심 재조정
        map.setCenter(moveLatLng);
      }, 600); // 지도 크기 변화 애니메이션 완료 후
    };

    moveToCenter();
  }, [selectedPOI, showSelectedPopup]);

  return <div id="docent-map" className="w-full h-full" />;
}
