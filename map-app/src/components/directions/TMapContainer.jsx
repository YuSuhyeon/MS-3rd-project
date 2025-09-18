import React, { useEffect, useRef } from "react";
import { ensureTmap } from "integrations/tmapLoader";

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

  useEffect(() => {
    let cancelled = false;
    const overrideKey =
      (typeof process !== 'undefined' && process.env && process.env.REACT_APP_TMAP_APP_KEY) ||
      (typeof window !== 'undefined' && window.REACT_APP_TMAP_APP_KEY) ||
      undefined;
    ensureTmap(overrideKey).then((Tmapv2) => {
      if (cancelled || !containerRef.current) return;
      if (!Tmapv2) return; // API not ready, skip
      const waitReady = () =>
        typeof Tmapv2?.Map === 'function' && typeof Tmapv2?.LatLng === 'function';
      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        if (waitReady()) {
          const center = new Tmapv2.LatLng(37.5665, 126.9780);
          const map = new Tmapv2.Map(containerRef.current, { center, zoom: 14 });
          mapRef.current = map;
          apiRef.current = Tmapv2;
        } else if (tries++ < 100) {
          setTimeout(tick, 100);
        }
      };
      tick();
    });
    return () => {
      cancelled = true;
      overlaysRef.current.markers.forEach((m) => m.setMap(null));
      overlaysRef.current.polylines.forEach((p) => p.setMap(null));
      overlaysRef.current = { markers: [], polylines: [] };
      mapRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  // 마커 및 경로 갱신
  useEffect(() => {
    const Tmapv2 = apiRef.current || window.Tmapv2;
    const map = mapRef.current;
    if (!Tmapv2 || !map || typeof Tmapv2.LatLng !== 'function') return;

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
          content: `<div style="padding:4px 6px;font-size:12px;background:#fff;border:1px solid #ddd;border-radius:6px;">${idx + 1}. ${s.name}</div>`,
          type: 2, // DOM
          map,
        });
        overlaysRef.current.markers.push(label);
      }
    });

    // polyline path (좌표 배열 정규화)
    const normPath = [];
    (path || []).forEach((pt) => {
      if (Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === "number" && typeof pt[1] === "number") {
        // [lng, lat] 형태
        normPath.push({ lat: pt[1], lng: pt[0] });
      } else if (typeof pt?.lat === "number" && typeof pt?.lng === "number") {
        normPath.push(pt);
      }
    });
    // Fallback: 경로 좌표가 없으면 정점(stops)으로 직선 연결
    const pathToDraw = normPath.length >= 2 ? normPath : (
      (stops || []).filter(s => typeof s?.lat === 'number' && typeof s?.lng === 'number')
    );
    if (pathToDraw.length >= 2) {
      const line = new Tmapv2.Polyline({
        path: pathToDraw.map((p) => new Tmapv2.LatLng(p.lat, p.lng)),
        strokeColor: "#2563eb",
        strokeWeight: 4,
        map,
      });
      overlaysRef.current.polylines.push(line);
      pathToDraw.forEach((p) => bounds.extend(new Tmapv2.LatLng(p.lat, p.lng)));
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 30);
    }
  }, [stops, path]);

  return <div ref={containerRef} className="w-full h-full" />;
}
