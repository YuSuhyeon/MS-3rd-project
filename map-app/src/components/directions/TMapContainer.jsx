// components/directions/TMapContainer.jsx

import React, { useEffect, useRef } from "react";
import ensureTmap from "integrations/tmapLoader";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getDefaultStopLabel = (idx, total) => {
  if (!Number.isFinite(total) || total <= 0) return "경유지";
  if (idx === 0) return "출발지";
  if (idx === total - 1) return "도착지";
  return `경유지 ${idx}`;
};

const markerRoleColors = {
  start: "#16a34a",
  end: "#ef4444",
  waypoint: "#2563eb",
};

const markerSvgCache = new Map();
const buildMarkerIcon = (role = "waypoint", order = 1) => {
  const normalizedRole = Object.prototype.hasOwnProperty.call(
    markerRoleColors,
    role
  )
    ? role
    : "waypoint";
  const numericOrder = Number(order);
  const displayOrder =
    Number.isFinite(numericOrder) && numericOrder > 0
      ? numericOrder > 99
        ? "99+"
        : String(Math.round(numericOrder))
      : "";
  const cacheKey = `${normalizedRole}-${displayOrder}`;
  if (markerSvgCache.has(cacheKey)) {
    return markerSvgCache.get(cacheKey);
  }
  const fill = markerRoleColors[normalizedRole];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <g fill="none" fill-rule="evenodd">
      <path d="M20 1C10.059 1 2 9.059 2 19c0 10.132 9.05 20.17 16.31 30.447a2 2 0 0 0 3.38 0C28.95 39.17 38 29.132 38 19 38 9.059 29.941 1 20 1Z" fill="${fill}" stroke="#0f172a" stroke-width="1.5" />
      <text x="20" y="22" font-size="14" font-family="Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${displayOrder}</text>
    </g>
  </svg>`;
  const uri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  markerSvgCache.set(cacheKey, uri);
  return uri;
};

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
  const overlaysRef = useRef({ markers: [], polylines: [], infoWindows: [] });
  const mapClickListenerRef = useRef(null);

  const detachMarker = (marker) => {
    if (!marker) return;
    try {
      marker.setMap(null);
    } catch (error) {
      console.warn("TMap marker detach failed", error);
    }
  };

  const detachPolyline = (polyline) => {
    if (!polyline) return;
    try {
      polyline.setMap(null);
    } catch (error) {
      console.warn("TMap polyline detach failed", error);
    }
  };

  const closeInfo = (info) => {
    if (!info) return;
    try {
      if (typeof info.setMap === "function") {
        info.setMap(null);
      } else if (typeof info.close === "function") {
        info.close();
      }
    } catch (error) {
      console.warn("TMap info window close failed", error);
    }
  };

  // 지도 초기화 useEffect
  useEffect(() => {
    let cancelled = false;

    // ensureTmap 호출 방식을 API 키 없이
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

    // Cleanup ??
    return () => {
      cancelled = true;
      if (mapRef.current) {
        const Tmapv2 = apiRef.current;
        if (mapClickListenerRef.current && Tmapv2?.Event?.removeListener) {
          try {
            Tmapv2.Event.removeListener(mapClickListenerRef.current);
          } catch (error) {
            console.warn("Failed to remove TMap click listener", error);
          }
          mapClickListenerRef.current = null;
        }
        overlaysRef.current.markers.forEach(detachMarker);
        overlaysRef.current.polylines.forEach(detachPolyline);
        overlaysRef.current.infoWindows.forEach(closeInfo);

        try {
          mapRef.current.destroy();
        } catch (error) {
          console.warn("Failed to destroy TMap instance", error);
        }
        mapRef.current = null;
        apiRef.current = null;
        overlaysRef.current = { markers: [], polylines: [], infoWindows: [] };
      }
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // stops 또는 path 변경 시 오버레이 갱신 useEffect
  useEffect(() => {
    const Tmapv2 = apiRef.current;
    const map = mapRef.current;
    if (!Tmapv2 || !map || typeof Tmapv2.LatLng !== "function") return;

    overlaysRef.current.markers.forEach(detachMarker);
    overlaysRef.current.polylines.forEach(detachPolyline);
    overlaysRef.current.infoWindows.forEach(closeInfo);
    overlaysRef.current = { markers: [], polylines: [], infoWindows: [] };

    if (mapClickListenerRef.current && Tmapv2?.Event?.removeListener) {
      try {
        Tmapv2.Event.removeListener(mapClickListenerRef.current);
      } catch (error) {
        console.warn("Failed to detach TMap map click listener", error);
      }
      mapClickListenerRef.current = null;
    }

    const closeInfoWindows = () => {
      overlaysRef.current.infoWindows.forEach(closeInfo);
    };

    const safeStops = Array.isArray(stops) ? stops : [];
    const bounds = new Tmapv2.LatLngBounds();
    const totalStops = safeStops.length;

    safeStops.forEach((s, idx) => {
      const lat = Number(s?.lat);
      const lng = Number(s?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const pos = new Tmapv2.LatLng(lat, lng);
      const order = Number.isFinite(s?.order) ? s.order : idx + 1;
      const role =
        s?.role ||
        (idx === 0 ? "start" : idx === totalStops - 1 ? "end" : "waypoint");
      const iconUrl = buildMarkerIcon(role, order);
      let marker = null;
      try {
        marker = new Tmapv2.Marker({
          position: pos,
          map,
          icon: iconUrl,
          iconSize: new Tmapv2.Size(40, 52),
        });
        overlaysRef.current.markers.push(marker);
      } catch (error) {
        console.error("TMap marker creation failed", error);
      }

      try {
        bounds.extend(pos);
      } catch (error) {
        console.warn("TMap bounds extend failed", error);
      }

      const label = s?.label || getDefaultStopLabel(idx, totalStops);
      const safeHeader = escapeHtml(`${order}. ${label}`);
      const safeName = escapeHtml(s?.name || label);
      const displayAddress =
        typeof s?.roadAddress === "string" && s.roadAddress.trim().length
          ? s.roadAddress.trim()
          : typeof s?.address === "string" && s.address.trim().length
          ? s.address.trim()
          : "주소 정보 없음";
      const safeAddress = escapeHtml(displayAddress);
      let info = null;
      try {
        info = new Tmapv2.InfoWindow({
          position: pos,
          content: `<div style="padding:8px 12px;font-size:13px;line-height:1.5;color:#0f172a;background:#fff;border:1px solid rgba(148,163,184,0.6);border-radius:10px;box-shadow:0 10px 24px rgba(15,23,42,0.18);white-space:nowrap;max-width:220px;"><strong style="display:block;margin-bottom:4px;">${safeHeader}</strong><div style="font-weight:600;margin-bottom:2px;">${safeName}</div><div style="font-size:11px;color:#475569;">${safeAddress}</div></div>`,
          type: 2,
          map: null,
        });
        overlaysRef.current.infoWindows.push(info);
      } catch (error) {
        console.error("TMap info window creation failed", error);
      }

      if (marker && info && Tmapv2?.Event?.addListener) {
        Tmapv2.Event.addListener(marker, "click", () => {
          closeInfoWindows();
          if (typeof info.setMap === "function") {
            info.setMap(map);
          } else if (typeof info.open === "function") {
            info.open(map, marker);
          }
        });
      }

      if (idx === 0 && info && marker) {
        try {
          if (typeof info.setMap === "function") {
            info.setMap(map);
          } else if (typeof info.open === "function") {
            info.open(map, marker);
          }
        } catch (error) {
          console.warn("TMap info window auto-open failed", error);
        }
      }
    });

    const normPath = [];
    (Array.isArray(path) ? path : []).forEach((pt) => {
      const lat = Array.isArray(pt) ? Number(pt[1]) : Number(pt?.lat);
      const lng = Array.isArray(pt) ? Number(pt[0]) : Number(pt?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      normPath.push({ lat, lng });
    });

    const pathToDraw =
      normPath.length >= 2
        ? normPath
        : safeStops
            .map((s) => ({ lat: Number(s?.lat), lng: Number(s?.lng) }))
            .filter(
              (coord) =>
                Number.isFinite(coord.lat) && Number.isFinite(coord.lng)
            );

    if (pathToDraw.length >= 2) {
      const linePath = pathToDraw.map((p) => new Tmapv2.LatLng(p.lat, p.lng));
      try {
        const line = new Tmapv2.Polyline({
          path: linePath,
          strokeColor: "#0ea5e9",
          strokeWeight: 5,
          strokeOpacity: 0.85,
          map,
        });
        overlaysRef.current.polylines.push(line);
      } catch (error) {
        console.error("TMap polyline creation failed", error);
      }
      linePath.forEach((point) => {
        try {
          bounds.extend(point);
        } catch (error) {
          console.warn("TMap bounds extend failed", error);
        }
      });
    }

    if (Tmapv2?.Event?.addListener) {
      try {
        mapClickListenerRef.current = Tmapv2.Event.addListener(
          map,
          "click",
          closeInfoWindows
        );
      } catch (error) {
        console.warn("TMap click listener registration failed", error);
      }
    }

    if (!bounds.isEmpty()) {
      try {
        map.panToBounds(bounds, true, 80);
      } catch (error) {
        console.warn("TMap panToBounds failed", error);
      }
    } else if (safeStops[0]) {
      const lat = Number(safeStops[0]?.lat);
      const lng = Number(safeStops[0]?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        try {
          map.setCenter(new Tmapv2.LatLng(lat, lng));
        } catch (error) {
          console.warn("TMap setCenter failed", error);
        }
      }
    }
  }, [stops, path]);

  return <div ref={containerRef} className="w-full h-full" />;
}
