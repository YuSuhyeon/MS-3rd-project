import React, { useEffect, useRef } from "react";
import { Card } from "components/ui/card";
import { createKakaoMap } from "../../kakaoMap";

export default function MapContainer({ 
  startLocation, 
  endLocation, 
  waypoints, 
  routeData, 
  onLocationSelect 
}) {
  const containerRef = useRef(null);
  const mapObjRef = useRef({ map: null, markers: [] });

  // 1) 지도 초기화
  useEffect(() => {
    const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_API_KEY || process.env.REACT_APP_KAKAOMAP_JS_KEY;
    if (!KAKAO_JS_KEY) {
      console.warn("Kakao JS Key가 설정되지 않았습니다. .env의 REACT_APP_KAKAO_API_KEY를 확인하세요.");
      return;
    }
    const id = "route-map";
    if (containerRef.current) {
      containerRef.current.id = id;
      createKakaoMap({
        containerId: id,
        KAKAO_JS_KEY,
        center: { lat: 37.5665, lng: 126.9780 },
        level: 5,
        onMapReady: (map) => {
          mapObjRef.current.map = map;
        },
      });
    }
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapObjRef.current.map = null;
      mapObjRef.current.markers.forEach((m) => m.setMap && m.setMap(null));
      mapObjRef.current.markers = [];
    };
  }, []);

  // 2) 마커 갱신
  useEffect(() => {
    const { map, markers } = mapObjRef.current;
    if (!map || !window.kakao?.maps) return;
    // 기존 마커 제거
    markers.forEach((m) => m.setMap(null));
    mapObjRef.current.markers = [];

    const geocoder = new window.kakao.maps.services.Geocoder();
    const addMarkerByName = async (name, type, idx) => {
      if (!name) return;
      // 간단 주소 검색 (장소명으로 주소 검색)
      return new Promise((resolve) => {
        geocoder.addressSearch(name, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const y = parseFloat(result[0].y);
            const x = parseFloat(result[0].x);
            const pos = new window.kakao.maps.LatLng(y, x);
            const marker = new window.kakao.maps.Marker({ position: pos, map });
            mapObjRef.current.markers.push(marker);
            resolve(pos);
          } else {
            resolve(null);
          }
        });
      });
    };

    const tasks = [];
    tasks.push(addMarkerByName(startLocation, "start"));
    waypoints.forEach((w, i) => tasks.push(addMarkerByName(w.location, "wp", i)));
    tasks.push(addMarkerByName(endLocation, "end"));

    Promise.all(tasks).then((positions) => {
      const valid = positions.filter(Boolean);
      if (valid.length) {
        const bounds = new window.kakao.maps.LatLngBounds();
        valid.forEach((p) => bounds.extend(p));
        map.setBounds(bounds);
      }
    });
  }, [startLocation, endLocation, waypoints]);

  return (
    <Card className="h-full m-4 overflow-hidden shadow-lg">
      <div 
        ref={containerRef}
        className="w-full h-full"
      />
    </Card>
  );
}
