// components/directions/TMapContainer.jsx

import React, { useEffect, useRef } from "react";
import ensureTmap from "integrations/tmapLoader";

/**
 * T Map 지도 컨테이너
 * props
 *  - stops: [{ lat, lng, name }]
 *  - path: [{ lat, lng }] 혹은 [[lng,lat], ...] 형태도 일부 허용
 */
export default function TMapContainer({ stops = [], path = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const apiRef = useRef(null);
  const overlaysRef = useRef({ markers: [], polylines: [] });

  // 지도 초기화 useEffect
  useEffect(() => {
    let cancelled = false;

    // ▼▼▼▼▼ ensureTmap 호출 방식을 API 키 없이 변경 ▼▼▼▼▼
    ensureTmap()
      .then((Tmapv2) => {
        // 컴포넌트가 언마운트되었거나, 컨테이너가 없거나, 지도가 이미 생성되었다면 중단
        if (cancelled || !containerRef.current || mapRef.current) return;

        apiRef.current = Tmapv2;
        const center = new Tmapv2.LatLng(37.5665, 126.978);
        const map = new Tmapv2.Map(containerRef.current, {
          center,
          zoom: 14,
          width: "100%",
          height: "100%",
        });
        mapRef.current = map;
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("TMap 초기화 실패:", error);
        }
      });

    // Cleanup 함수
    return () => {
      cancelled = true;
      if (mapRef.current) {
        // 오버레이 제거
        overlaysRef.current.markers.forEach((m) => m.setMap(null));
        overlaysRef.current.polylines.forEach((p) => p.setMap(null));

        // 맵 인스턴스 파괴
        mapRef.current.destroy();
        mapRef.current = null;
        apiRef.current = null;
        overlaysRef.current = { markers: [], polylines: [] };
      }
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 마커 및 경로 갱신 useEffect
  useEffect(() => {
    const Tmapv2 = apiRef.current;
    const map = mapRef.current;
    if (!Tmapv2 || !map || typeof Tmapv2.LatLng !== "function") return;

    // cleanup
    overlaysRef.current.markers.forEach((m) => m.setMap(null));
    overlaysRef.current.polylines.forEach((p) => p.setMap(null));
    overlaysRef.current = { markers: [], polylines: [] };

    const bounds = new Tmapv2.LatLngBounds();

    // markers
    (stops || []).forEach((s, idx) => {
      if (typeof s?.lat !== "number" || typeof s?.lng !== "number") return;
      const pos = new Tmapv2.LatLng(s.lat, s.lng);
      const marker = new Tmapv2.Marker({ position: pos, map });
      overlaysRef.current.markers.push(marker);
      bounds.extend(pos);
      // 간단한 텍스트 라벨
      if (s?.name) {
        const label = new Tmapv2.InfoWindow({
          position: pos,
          content: `<div style="padding:4px 6px;font-size:12px;background:#fff;border:1px solid #ddd;border-radius:6px;">${
            idx + 1
          }. ${s.name}</div>`,
          type: 2, // DOM
          map,
        });
        overlaysRef.current.markers.push(label);
      }
    });

    // polyline path (좌표 배열 정규화)
    const normPath = [];
    (path || []).forEach((pt) => {
      if (
        Array.isArray(pt) &&
        pt.length >= 2 &&
        typeof pt[0] === "number" &&
        typeof pt[1] === "number"
      ) {
        normPath.push({ lat: pt[1], lng: pt[0] });
      } else if (typeof pt?.lat === "number" && typeof pt?.lng === "number") {
        normPath.push(pt);
      }
    });

    const pathToDraw =
      normPath.length >= 2
        ? normPath
        : (stops || []).filter(
            (s) => typeof s?.lat === "number" && typeof s?.lng === "number"
          );

    if (pathToDraw.length >= 2) {
      const linePath = pathToDraw.map((p) => new Tmapv2.LatLng(p.lat, p.lng));
      const line = new Tmapv2.Polyline({
        path: linePath,
        strokeColor: "#2563eb",
        strokeWeight: 4,
        map,
      });
      overlaysRef.current.polylines.push(line);
      linePath.forEach((p) => bounds.extend(p));
    }

    if (!bounds.isEmpty()) {
      map.panToBounds(bounds, true, 80);
    }
  }, [stops, path]); // stops 또는 path가 변경될 때만 실행

  return <div ref={containerRef} className="w-full h-full" />;
}
