import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import { ArrowUp, ArrowDown, Plus, Search, X, Save, Trash2, Copy } from "lucide-react";
import { Reorder } from "framer-motion";
import TMapContainer from "components/directions/TMapContainer";
import WaypointList from "components/directions/WaypointList";
import { ensureTmap } from "integrations/tmapLoader";

export default function DirectionsMantineImproved() {
  const location = useLocation();

  // Multi-day state
  const makeEmptyDay = (idx = 0) => ({
    id: `day-${idx + 1}`,
    title: `Day ${idx + 1}`,
    startLocation: "",
    startCoords: null,
    endLocation: "",
    endCoords: null,
    waypoints: [], // [{ name, lat?, lng? }]
    priority: "RECOMMEND",
    startTime: "09:00",
    stays: [], // minutes per stop index (start, wps..., end)
    timeline: [],
    summary: null,
    lastRoutes: null, // raw routes from Kakao for redraw on tab switch
  });

  const [days, setDays] = useState([makeEmptyDay(0)]);
  const [activeDay, setActiveDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareInfo, setShareInfo] = useState(null); // { id, shareUrl }
  const [mapProvider, setMapProvider] = useState('KAKAO'); // 'KAKAO' | 'TMAP'
  const [routeMode, setRouteMode] = useState('CAR'); // 'CAR' | 'PEDESTRIAN' | 'TRANSIT'
  const presetAppliedRef = useRef(false);
  const [tmapReady, setTmapReady] = useState(false);

  // Ensure T Map SDK when provider toggles to TMAP
  useEffect(() => {
    let cancelled = false;
    if (mapProvider !== 'TMAP') {
      setTmapReady(false);
      return;
    }
    const overrideKey =
      (process.env.REACT_APP_TMAP_APP_KEY) ||
      (typeof window !== 'undefined' && window.REACT_APP_TMAP_APP_KEY) ||
      undefined;
    ensureTmap(overrideKey)
      .then((api) => {
        if (cancelled) return;
        const ok = !!(api && typeof api.Map === 'function' && typeof api.LatLng === 'function');
        setTmapReady(ok);
      })
      .catch(() => {
        if (!cancelled) setTmapReady(false);
      });
    return () => { cancelled = true; };
  }, [mapProvider]);

  // kakao map refs
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const markerRefs = useRef([]);

  // load kakao maps
  useEffect(() => {
    const ensureKakao = () =>
      new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }
        const appkey = process.env.REACT_APP_KAKAO_API_KEY || window.REACT_APP_KAKAO_API_KEY;
        const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => window.kakao.maps.load(resolve);
        document.head.appendChild(s);
      });
    ensureKakao().then(() => {
      if (!mapObjRef.current && mapElRef.current) {
        const center = new window.kakao.maps.LatLng(37.5665, 126.978);
        mapObjRef.current = new window.kakao.maps.Map(mapElRef.current, { center, level: 7 });
      }
    });
  }, []);

  // Load preset course into Day 1 if provided via router state (with sessionStorage fallback)
  useEffect(() => {
    try {
      let preset = (location.state && location.state.presetCourse) || null;
      if (!preset) {
        try {
          const raw = sessionStorage.getItem('routePreset');
          if (raw) preset = JSON.parse(raw);
        } catch {}
      }
      if (preset && Array.isArray(preset.stops) && preset.stops.length >= 2) {
        setDays((prev) => {
          const next = [...prev];
          const d0 = { ...next[0] };
          const first = preset.stops[0];
          const last = preset.stops[preset.stops.length - 1];
          d0.startLocation = first?.name || "";
          d0.endLocation = last?.name || "";
          d0.startCoords =
            typeof first?.lat === 'number' && typeof first?.lng === 'number'
              ? { lat: first.lat, lng: first.lng }
              : null;
          d0.endCoords =
            typeof last?.lat === 'number' && typeof last?.lng === 'number'
              ? { lat: last.lat, lng: last.lng }
              : null;
          d0.waypoints = preset.stops.slice(1, -1).map((s) => ({
            name: s?.name || '',
            lat: typeof s?.lat === 'number' ? s.lat : undefined,
            lng: typeof s?.lng === 'number' ? s.lng : undefined,
          }));
          next[0] = d0;
          return next;
        });
        presetAppliedRef.current = true;
        try { sessionStorage.removeItem('routePreset'); } catch {}
      }
    } catch {}
  }, [location.state]);

  // Load draft from localStorage (skip when preset applied or preset exists in route state/session)
  useEffect(() => {
    try {
      const hasPresetState = !!(location.state && location.state.presetCourse);
      let hasPresetSession = false;
      try { hasPresetSession = !!sessionStorage.getItem('routePreset'); } catch {}
      if (presetAppliedRef.current || hasPresetState || hasPresetSession) return;
      const raw = localStorage.getItem("routePlanDraft");
      if (raw) {
        const j = JSON.parse(raw);
        if (Array.isArray(j.days) && j.days.length) {
          setDays(j.days);
          setActiveDay(j.activeDay || 0);
        }
      }
    } catch {}
  }, []);

  // Save draft
  useEffect(() => {
    try {
      localStorage.setItem("routePlanDraft", JSON.stringify({ days, activeDay }));
    } catch {}
  }, [days, activeDay]);

  const cur = days[activeDay] || makeEmptyDay(activeDay);

  const updateCur = (patch) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDay] = { ...next[activeDay], ...patch };
      return next;
    });
  };

  const haversine = (a, b) => {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat),
      dLng = toRad(b.lng - a.lng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  const geocode = (name) =>
    new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error("empty"));
        return;
      }
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(name, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          resolve({ lat: parseFloat(data[0].y), lng: parseFloat(data[0].x), name });
        } else {
          reject(new Error("not_found"));
        }
      });
    });

  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
    markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
    markerRefs.current = [];
  };

  const drawPolylines = (routes) => {
    // Kakao 지도로만 그립니다. (단, T Map 선택인데 SDK 준비 실패 시 Kakao로 폴백하여 그립니다)
    if (mapProvider !== 'KAKAO' && tmapReady) return;
    const map = mapObjRef.current;
    if (!map) return;
    clearMap();
    if (!routes || !Array.isArray(routes) || routes.length === 0) return;
    const colors = ["#2563eb", "#7c3aed", "#059669"];
    const bounds = new window.kakao.maps.LatLngBounds();
    routes.slice(0, 3).forEach((route, idx) => {
      const path = [];
      (route.sections || []).forEach((sec) =>
        (sec.roads || []).forEach((r) => {
          const v = r.vertexes || [];
          for (let i = 0; i < v.length; i += 2) {
            const lat = v[i + 1],
              lng = v[i];
            const ll = new window.kakao.maps.LatLng(lat, lng);
            path.push(ll);
            bounds.extend(ll);
          }
        })
      );
      if (path.length) {
        const poly = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: colors[idx % colors.length],
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
        poly.setMap(map);
        polyRefs.current.push(poly);
      }
    });
    if (!bounds.isEmpty()) map.setBounds(bounds);
  };

  // Redraw when tab switches or provider changes
  useEffect(() => {
    if (mapProvider === 'KAKAO' || (mapProvider === 'TMAP' && !tmapReady)) {
      if (cur && cur.lastRoutes) drawPolylines(cur.lastRoutes);
      else clearMap();
    } else {
      // T Map 사용 중: Kakao 오버레이 제거
      clearMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, mapProvider]);

  // TMap 표시용 좌표 path 추출기
  const extractPathForTmap = (routes) => {
    const list = (routes || []);
    if (!list.length) return [];
    const route = list[0];
    const out = [];
    const sections = Array.isArray(route?.sections) ? route.sections : [];
    // 1) Kakao vertexes => [lng,lat] 짝을 lat,lng 객체로 변환
    sections.forEach((sec) => {
      const roads = sec?.roads || [];
      roads.forEach((r) => {
        const v = r?.vertexes || [];
        for (let i = 0; i < v.length; i += 2) {
          const lat = v[i + 1];
          const lng = v[i];
          if (typeof lat === 'number' && typeof lng === 'number') out.push({ lat, lng });
        }
      });
    });
    if (out.length) return out;
    // 2) Fallback: sections.path ([[lng,lat], ...])
    sections.forEach((sec) => {
      const sp = sec?.path || [];
      for (let i = 0; i < sp.length; i++) {
        const item = sp[i];
        if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
          out.push({ lat: item[1], lng: item[0] });
        }
      }
    });
    return out;
  };

  const tmapStops = useMemo(() => {
    const arr = [];
    if (cur?.startCoords && typeof cur.startCoords.lat === 'number' && typeof cur.startCoords.lng === 'number') {
      arr.push({ name: cur.startLocation, lat: cur.startCoords.lat, lng: cur.startCoords.lng });
    }
    (cur?.waypoints || []).forEach((w) => {
      if (typeof w?.lat === 'number' && typeof w?.lng === 'number') arr.push({ name: w.name, lat: w.lat, lng: w.lng });
    });
    if (cur?.endCoords && typeof cur.endCoords.lat === 'number' && typeof cur.endCoords.lng === 'number') {
      arr.push({ name: cur.endLocation, lat: cur.endCoords.lat, lng: cur.endCoords.lng });
    }
    return arr;
  }, [cur.startCoords, cur.endCoords, cur.waypoints, cur.startLocation, cur.endLocation]);

  const tmapPath = useMemo(() => extractPathForTmap(cur?.lastRoutes), [cur.lastRoutes]);

  const recomputeTimelineWithStays = ({ stops, sections, startTime, stays }) => {
    const steps = [];
    const toMinutes = (hhmm) => {
      const [h, m] = String(hhmm || "0:0").split(":");
      return parseInt(h || "0", 10) * 60 + parseInt(m || "0", 10);
    };
    let accMin = toMinutes(startTime || "09:00");
    const map = mapObjRef.current;
    if (map) {
      markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
      markerRefs.current = [];
    }
    for (let i = 0; i < stops.length; i++) {
      const curS = stops[i];
      const prevS = i > 0 ? stops[i - 1] : null;
      let km = 0,
        minutes = 0,
        roadName = "";
      if (prevS && sections && sections[i - 1] && sections[i - 1].summary) {
        const sec = sections[i - 1];
        const dist = sec.summary.distance || 0;
        const dur = sec.summary.duration || 0;
        km = dist / 1000;
        minutes = Math.round(dur / 60);
        const r0 = (sec.roads || []).find((r) => r && (r.name || r.road_name));
        roadName = (r0 && (r0.name || r0.road_name)) || "";
      }
      if (i > 0) accMin += minutes; // travel from prev -> current
      const hh = Math.floor(accMin / 60)
        .toString()
        .padStart(2, "0");
      const mm = (accMin % 60).toString().padStart(2, "0");
      steps.push({ idx: i + 1, name: curS.name, km, minutes, roadName, arrival: `${hh}:${mm}` });
      if (map && typeof curS.lat === "number" && typeof curS.lng === "number") {
        const marker = new window.kakao.maps.Marker({ position: new window.kakao.maps.LatLng(curS.lat, curS.lng), map });
        markerRefs.current.push(marker);
      }
      const stay = Array.isArray(stays) && typeof stays[i] === "number" ? stays[i] : 0;
      accMin += i < stops.length - 1 ? stay : 0; // dwell before next leg
    }
    return steps;
  };

  const calculateRoute = async () => {
    if (!cur.startLocation || !cur.endLocation) return;
    setIsCalculating(true);
    try {
      // Resolve coordinates (prefer user-selected coords, fallback to geocoding)
      const start = cur.startCoords && cur.startCoords.lat && cur.startCoords.lng
        ? { name: cur.startLocation, lat: cur.startCoords.lat, lng: cur.startCoords.lng }
        : await geocode(cur.startLocation);
      const end = cur.endCoords && cur.endCoords.lat && cur.endCoords.lng
        ? { name: cur.endLocation, lat: cur.endCoords.lat, lng: cur.endCoords.lng }
        : await geocode(cur.endLocation);
      const mids = [];
      for (const w of cur.waypoints || []) {
        if (w && typeof w.lat === "number" && typeof w.lng === "number") {
          mids.push({ name: w.name, lat: w.lat, lng: w.lng });
        } else if (w && w.name) {
          try {
            const p = await geocode(w.name);
            mids.push(p);
          } catch {}
        }
      }

      let j = null;
      if (mapProvider === 'TMAP') {
        if (routeMode === 'TRANSIT') {
          const r = await fetch('/api/tmap/transit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: { x: String(start.lng), y: String(start.lat), name: start.name },
              destination: { x: String(end.lng), y: String(end.lat), name: end.name },
              count: 3,
            }),
          });
          j = await r.json();
          if (!r.ok) {
            alert('T Map 대중교통 경로 요청 실패');
            return;
          }
        } else {
          const r = await fetch('/api/tmap/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: { x: String(start.lng), y: String(start.lat), name: start.name },
              destination: { x: String(end.lng), y: String(end.lat), name: end.name },
              waypoints: mids.map((m) => ({ x: String(m.lng), y: String(m.lat) })),
              mode: routeMode,
              priority: cur.priority || 'RECOMMEND',
            }),
          });
          j = await r.json();
        }
      } else {
        const payload = {
          origin: { x: String(start.lng), y: String(start.lat) },
          destination: { x: String(end.lng), y: String(end.lat) },
          waypoints: mids.map((m) => ({ x: String(m.lng), y: String(m.lat) })),
          priority: cur.priority || 'RECOMMEND',
        };
        const r = await fetch('/api/kakao-waypoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        j = await r.json();
      }
      if (!j || !j.routes) {
        alert('경로 요청 실패');
        return;
      }
      const route = (j.routes && j.routes[0]) || null;
      if (mapProvider === 'KAKAO' || (mapProvider === 'TMAP' && !tmapReady)) {
        drawPolylines(j.routes);
      } else {
        // T Map 표시는 TMapContainer가 lastRoutes 변화를 통해 그립니다.
      }

      // Build timeline using Kakao sections (per-leg accuracy)
      const stops = [start, ...mids, end];
      const sections = route && Array.isArray(route.sections) ? route.sections : [];
      // Normalize stays length
      const stays = Array.isArray(cur.stays) ? [...cur.stays] : [];
      const needLen = stops.length;
      while (stays.length < needLen) stays.push(0);
      const steps = recomputeTimelineWithStays({ stops, sections, startTime: cur.startTime, stays });

      const totalKm = route?.summary?.distance ? route.summary.distance / 1000 : steps.reduce((s, x) => s + (x.idx > 1 ? x.km : 0), 0);
      const totalMin = route?.summary?.duration ? Math.round(route.summary.duration / 60) : steps.reduce((s, x) => s + (x.idx > 1 ? x.minutes : 0), 0);

      updateCur({
        timeline: steps,
        summary: { distance: totalKm, duration: totalMin },
        lastRoutes: j.routes,
        stays,
        startCoords: { lat: start.lat, lng: start.lng },
        endCoords: { lat: end.lat, lng: end.lng },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateStay = (idx, minutes) => {
    setDays((prev) => {
      const next = [...prev];
      const d = { ...next[activeDay] };
      const stays = Array.isArray(d.stays) ? [...d.stays] : [];
      while (stays.length < 1 + (d.waypoints?.length || 0) + 1) stays.push(0);
      stays[idx] = Math.max(0, parseInt(minutes || 0, 10));
      if (d.lastRoutes && d.lastRoutes[0]) {
        const start = d.startCoords ? { name: d.startLocation, lat: d.startCoords.lat, lng: d.startCoords.lng } : { name: d.startLocation };
        const end = d.endCoords ? { name: d.endLocation, lat: d.endCoords.lat, lng: d.endCoords.lng } : { name: d.endLocation };
        const mids = (d.waypoints || []).map((w) => ({ name: w.name, lat: w.lat, lng: w.lng }));
        const stops = [start, ...mids, end];
        const route = d.lastRoutes[0];
        const sections = route && Array.isArray(route.sections) ? route.sections : [];
        const steps = recomputeTimelineWithStays({ stops, sections, startTime: d.startTime, stays });
        const totalKm = route?.summary?.distance ? route.summary.distance / 1000 : steps.reduce((s, x) => s + (x.idx > 1 ? x.km : 0), 0);
        const totalMin = route?.summary?.duration ? Math.round(route.summary.duration / 60) : steps.reduce((s, x) => s + (x.idx > 1 ? x.minutes : 0), 0);
        d.timeline = steps;
        d.summary = { distance: totalKm, duration: totalMin };
      }
      d.stays = stays;
      next[activeDay] = d;
      return next;
    });
  };

  const addDay = () => {
    setDays((prev) => [...prev, makeEmptyDay(prev.length)]);
    setActiveDay(days.length);
  };

  const removeDay = (idx) => {
    setDays((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, id: `day-${i + 1}`, title: `Day ${i + 1}` }));
      return next;
    });
    setActiveDay((p) => Math.max(0, Math.min(p, days.length - 2)));
  };

  const duplicateDay = (idx) => {
    setDays((prev) => {
      const src = prev[idx];
      const copy = {
        ...src,
        id: `day-${prev.length + 1}`,
        title: `Day ${prev.length + 1}`,
        lastRoutes: null,
        timeline: [],
        summary: null,
      };
      return [...prev, copy];
    });
    setActiveDay(days.length);
  };

  const saveToBackend = async () => {
    try {
      const payload = { name: "route-plan", days };
      const r = await fetch("/api/route-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok && j.id) {
        setShareInfo({ id: j.id, shareUrl: j.shareUrl });
      } else {
        alert("백엔드 저장 실패");
      }
    } catch (e) {
      console.error(e);
      alert("백엔드 저장 오류");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle>경로 편집</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-600 mr-2">지도: {mapProvider === 'KAKAO' ? 'Kakao' : 'T Map'}</div>
              <Button variant="outline" onClick={() => setMapProvider((p) => (p === 'KAKAO' ? 'TMAP' : 'KAKAO'))}>
                지도 전환
              </Button>
              {shareInfo && (
                <a
                  href={shareInfo.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-600 underline"
                >
                  공유 링크
                </a>
              )}
              <Button variant="outline" onClick={saveToBackend}>
                <Save className="w-4 h-4 mr-1" />저장/공유
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Day tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {days.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDay(i)}
                  className={`px-3 py-1.5 rounded-full border ${
                    i === activeDay
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {d.title}
                </button>
              ))}
              <Button variant="outline" onClick={addDay}>
                <Plus className="w-4 h-4 mr-1" />일차 추가
              </Button>
              {days.length > 1 && (
                <Button variant="outline" onClick={() => removeDay(activeDay)}>
                  <Trash2 className="w-4 h-4 mr-1" />일차 삭제
                </Button>
              )}
              <Button variant="outline" onClick={() => duplicateDay(activeDay)}>
                <Copy className="w-4 h-4 mr-1" />일차 복사
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-slate-500 mb-1">출발</div>
                <PlaceSearchInput
                  value={cur.startLocation}
                  onChange={(v) => updateCur({ startLocation: v, startCoords: null })}
                  onSelect={(p) => updateCur({ startLocation: p.name, startCoords: { lat: p.lat, lng: p.lng } })}
                  placeholder="예: 서울역"
                />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">도착</div>
                <PlaceSearchInput
                  value={cur.endLocation}
                  onChange={(v) => updateCur({ endLocation: v, endCoords: null })}
                  onSelect={(p) => updateCur({ endLocation: p.name, endCoords: { lat: p.lat, lng: p.lng } })}
                  placeholder="예: 강남역"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => setSearchOpen(true)} variant="outline" className="w-1/2">
                  <Search className="w-4 h-4 mr-1" />경유지 검색
                </Button>
                <Button onClick={calculateRoute} disabled={isCalculating || !cur.startLocation || !cur.endLocation} className="bg-indigo-600 text-white w-1/2">
                  {isCalculating ? "계산 중..." : "경로 계산"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-slate-500 mb-1">이동 수단</div>
                <select value={routeMode} onChange={(e) => setRouteMode(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="CAR">자동차</option>
                  <option value="PEDESTRIAN">도보</option>
                  <option value="TRANSIT">대중교통</option>
                </select>
                {routeMode === 'TRANSIT' && (
                  <div className="text-[11px] text-slate-500 mt-1">대중교통은 하루에 10회만 조회 가능해요.</div>
                )}
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">우선순위</div>
                <select
                  value={cur.priority}
                  onChange={(e) => updateCur({ priority: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="RECOMMEND">추천</option>
                  <option value="FAST">최단시간</option>
                  <option value="SHORTEST">최단거리</option>
                </select>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">출발 시간</div>
                <input type="time" value={cur.startTime} onChange={(e) => updateCur({ startTime: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">경유지</div>
              <div className="space-y-2">
                {/* 드래그앤드롭 재정렬 가능 목록 */}
                {(() => {
                  // WaypointList는 {id, location} 형태를 사용하므로 변환
                  const items = (cur.waypoints || []).map((w, idx) => ({ id: `wp-${idx}`, location: w.name }));
                  const onAdd = () => updateCur({ waypoints: [...(cur.waypoints || []), { name: "" }] });
                  const onRemove = (id) => {
                    const i = items.findIndex((x) => x.id === id);
                    if (i >= 0) updateCur({ waypoints: cur.waypoints.filter((_, idx) => idx !== i) });
                  };
                  const onUpdate = (id, val) => {
                    const i = items.findIndex((x) => x.id === id);
                    if (i >= 0) {
                      const next = [...cur.waypoints];
                      next[i] = { ...next[i], name: val };
                      updateCur({ waypoints: next });
                    }
                  };
                  const onReorder = (nextItems) => {
                    // nextItems는 {id, location} 순서로 들어옴 → cur.waypoints 순서 재배열
                    const order = nextItems.map((x) => x.id);
                    const re = [];
                    order.forEach((oid) => {
                      const j = items.findIndex((x) => x.id === oid);
                      if (j >= 0) re.push(cur.waypoints[j]);
                    });
                    updateCur({ waypoints: re });
                  };
                  return (
                    <WaypointList
                      waypoints={items}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      onReorder={onReorder}
                    />
                  );
                })()}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-slate-500 mb-1">전체 순서 변경 (출발/경유/도착)</div>
              {(() => {
                const stops = [];
                stops.push({ id: 'start', name: cur.startLocation, type: 'start', lat: cur.startCoords?.lat, lng: cur.startCoords?.lng });
                (cur.waypoints || []).forEach((w, i) => stops.push({ id: `wp-${i}`, name: w.name, type: 'wp', lat: w.lat, lng: w.lng }));
                stops.push({ id: 'end', name: cur.endLocation, type: 'end', lat: cur.endCoords?.lat, lng: cur.endCoords?.lng });
                const onReorder = (next) => {
                  // next[0] -> start, next[last] -> end, middle -> waypoints
                  if (!Array.isArray(next) || next.length < 2) return;
                  const first = next[0];
                  const last = next[next.length - 1];
                  const mids = next.slice(1, -1);
                  updateCur({
                    startLocation: first?.name || '',
                    startCoords: (typeof first?.lat === 'number' && typeof first?.lng === 'number') ? { lat: first.lat, lng: first.lng } : null,
                    endLocation: last?.name || '',
                    endCoords: (typeof last?.lat === 'number' && typeof last?.lng === 'number') ? { lat: last.lat, lng: last.lng } : null,
                    waypoints: mids.map((m) => ({ name: m?.name || '', lat: m?.lat, lng: m?.lng })),
                  });
                };
                return (
                  <Reorder.Group axis="y" values={stops} onReorder={(n) => { onReorder(n); }} className="space-y-2">
                    {stops.map((s) => (
                      <Reorder.Item key={s.id} value={s} className="p-2 rounded-lg border bg-white flex items-center gap-2">
                        <span className="text-slate-400 cursor-grab">≡</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-50">
                          {s.type === 'start' ? '출발' : s.type === 'end' ? '도착' : '경유'}
                        </span>
                        <span className="text-sm text-slate-800 truncate">{s.name || '(미지정)'}</span>
                      </Reorder.Item>
                    ))}
                </Reorder.Group>
                );
              })()}
            </div>

            <div className="grid lg:grid-cols-5 gap-4 pt-2">
              <div className="lg:col-span-3">
                {mapProvider === 'TMAP' && tmapReady ? (
                  <div className="w-full h-80 rounded-2xl border overflow-hidden">
                    <TMapContainer stops={tmapStops} path={tmapPath} />
                  </div>
                ) : (
                  <div className="relative w-full h-80">
                    {mapProvider === 'TMAP' && !tmapReady && (
                      <div className="absolute z-10 top-3 left-3 text-[11px] bg-white/90 backdrop-blur px-2 py-1 rounded border text-slate-600">
                        T Map SDK 준비가 되지 않아 Kakao 지도로 표시합니다.
                      </div>
                    )}
                    <div ref={mapElRef} className="w-full h-full rounded-2xl border" />
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>이동 타임라인</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cur.summary && (
                      <div className="text-sm text-slate-600 mb-2">총 {cur.summary.distance.toFixed(1)} km · {cur.summary.duration} 분</div>
                    )}
                    <ol className="space-y-2 text-sm">
                      {(cur.timeline || []).map((s, idx) => (
                        <li key={s.idx} className="p-2 rounded-xl border bg-white flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center font-bold text-slate-700">{s.idx}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                            {s.idx > 1 && (
                              <div className="text-slate-500">도착 {s.arrival} · 약 {s.km.toFixed(1)} km · {s.minutes} 분{s.roadName ? ` · ${s.roadName}` : ""}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <label className="whitespace-nowrap">체류(분)</label>
                            <input
                              type="number"
                              min="0"
                              value={cur.stays && typeof cur.stays[idx] === "number" ? cur.stays[idx] : 0}
                              onChange={(e) => updateStay(idx, e.target.value)}
                              className="w-20 border rounded px-2 py-1"
                            />
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">경유지 검색</div>
              <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <PlaceSearchInput
                value={""}
                onChange={() => {}}
                onSelect={(p) => {
                  updateCur({ waypoints: [...(cur.waypoints || []), { name: p.name, lat: p.lat, lng: p.lng }] });
                  setSearchOpen(false);
                }}
                placeholder="장소명을 입력하고 목록에서 선택"
              />
              <div className="text-xs text-slate-500">목록에서 항목을 선택하면 경유지로 추가됩니다.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
