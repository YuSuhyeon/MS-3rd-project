import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  X,
  Save,
  Trash2,
  Copy,
} from "lucide-react";
import "../styles/directions.css";

export default function DirectionsMyro() {
  const location = useLocation();

  // Multi-day state
  const makeEmptyDay = (idx = 0) => ({
    id: `day-${idx + 1}`,
    title: `${idx + 1}일차`,
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
  const presetAppliedRef = useRef(false);

  // kakao map refs
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const markerRefs = useRef([]);
  const [routeLegend, setRouteLegend] = useState([]);
  const ROUTE_COLORS = ["#2563eb", "#7c3aed", "#059669"];
  const lastRoutesRef = useRef(null);
  const lastStopsRef = useRef([]); // 최근 정지점 목록(경유 포함)
  const [activeRouteIdx, setActiveRouteIdx] = useState(-1);
  const [showOnlyActive, setShowOnlyActive] = useState(false);


  // load kakao maps
  useEffect(() => {
    const ensureKakao = () =>
      new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }
        const appkey =
          process.env.REACT_APP_KAKAO_API_KEY || window.REACT_APP_KAKAO_API_KEY;
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
        mapObjRef.current = new window.kakao.maps.Map(mapElRef.current, {
          center,
          level: 7,
        });
      }
    });
  }, []);

  // Load preset course into Day 1 if provided via router state (with sessionStorage fallback)
  useEffect(() => {
    try {
      let preset = (location.state && location.state.presetCourse) || null;
      if (!preset) {
        try {
          const raw = sessionStorage.getItem("routePreset");
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
          // keep coords when provided
          d0.startCoords =
            typeof first?.lat === "number" && typeof first?.lng === "number"
              ? { lat: first.lat, lng: first.lng }
              : null;
          d0.endCoords =
            typeof last?.lat === "number" && typeof last?.lng === "number"
              ? { lat: last.lat, lng: last.lng }
              : null;
          d0.waypoints = preset.stops.slice(1, -1).map((s) => ({
            name: s?.name || "",
            lat: typeof s?.lat === "number" ? s.lat : undefined,
            lng: typeof s?.lng === "number" ? s.lng : undefined,
          }));
          d0.priority = "SHORTEST";
          next[0] = d0;
          return next;
        });
        presetAppliedRef.current = true;
        try { sessionStorage.removeItem("routePreset"); } catch {}
        // 간단 테스트 프롬프트: 코스 불러오기 후 즉시 경로 계산 여부 확인
                // 지도 준비 후 자동 계산(최단거리 차량 경로)
        const autoCalcWhenReady = () => {
          let tries = 0;
          const tick = () => {
            if (mapObjRef.current && typeof calculateRoute === "function") {
              calculateRoute(0);
            } else if (tries++ < 20) {
              setTimeout(tick, 200);
            }
          };
          tick();
        };
        autoCalcWhenReady();
      }
    } catch {}
  }, [location.state]);

  // Load draft from localStorage (skip when incoming preset exists)
  useEffect(() => {
    try {
      const hasPresetState = !!(location.state && location.state.presetCourse);
      const hasPresetSession = !!sessionStorage.getItem("routePreset");
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
      localStorage.setItem(
        "routePlanDraft",
        JSON.stringify({ days, activeDay })
      );
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

  const geocode = (name, opts = {}) =>
    new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error("empty"));
        return;
      }
      const ps = new window.kakao.maps.services.Places();
      const options = {};
      if (opts.center && opts.center.lat && opts.center.lng) {
        options.location = new window.kakao.maps.LatLng(opts.center.lat, opts.center.lng);
        if (typeof opts.radius === "number") options.radius = opts.radius;
      }
      ps.keywordSearch(name, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          resolve({
            lat: parseFloat(data[0].y),
            lng: parseFloat(data[0].x),
            name: data[0].place_name || name,
          });
        } else {
          reject(new Error("not_found"));
        }
      }, options);
    });

  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
    markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
    markerRefs.current = [];
  };

  // 경로 Path 생성 유틸: Kakao vertexes -> sections.path -> 정지점 직선
  const buildPathFromRoute = (route) => {
    const path = [];
    (route?.sections || []).forEach((sec) =>
      (sec?.roads || []).forEach((r) => {
        const v = r?.vertexes || [];
        for (let i = 0; i < v.length; i += 2) {
          const lat = v[i + 1], lng = v[i];
          if (typeof lat === "number" && typeof lng === "number") {
            path.push(new window.kakao.maps.LatLng(lat, lng));
          }
        }
      })
    );
    if (path.length) return path;
    (route?.sections || []).forEach((sec) => {
      const sp = sec?.path || [];
      for (let i = 0; i < sp.length; i++) {
        const item = sp[i];
        if (Array.isArray(item) && item.length >= 2) {
          const lng = item[0], lat = item[1];
          if (typeof lat === "number" && typeof lng === "number")
            path.push(new window.kakao.maps.LatLng(lat, lng));
        }
      }
    });
    if (path.length) return path;
    const stops = lastStopsRef.current || [];
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      if (a && b && typeof a.lat === "number" && typeof a.lng === "number" && typeof b.lat === "number" && typeof b.lng === "number") {
        path.push(new window.kakao.maps.LatLng(a.lat, a.lng));
        path.push(new window.kakao.maps.LatLng(b.lat, b.lng));
      }
    }
    return path;
  };

  const drawPolylines = (routes) => {
    const map = mapObjRef.current;
    if (!map) return;
    clearMap();
    if (!routes || !Array.isArray(routes) || routes.length === 0) return;
    const colors = ROUTE_COLORS;
    const bounds = new window.kakao.maps.LatLngBounds();
    const list = routes.slice(0, 3);
    list.forEach((route, idx) => {
      const path = buildPathFromRoute(route);
      if (path.length) {
        const isActive = activeRouteIdx === -1 ? idx === 0 : idx === activeRouteIdx;
        if (showOnlyActive && !isActive) return;
        const poly = new window.kakao.maps.Polyline({
          path,
          strokeWeight: isActive ? 5 : 3,
          strokeColor: colors[idx % colors.length],
          strokeOpacity: isActive ? 1.0 : 0.6,
          strokeStyle: "solid",
        });
        poly.setMap(map);
        // 폴리라인 클릭 시 해당 경로 강조
        window.kakao.maps.event.addListener(poly, 'click', () => {
          setActiveRouteIdx(idx);
          drawPolylines(list);
        });
        polyRefs.current.push(poly);
      }
    });
    if (!bounds.isEmpty()) map.setBounds(bounds);
  };

  // 거리/시간 계산 보조: 좌표 기반 하버사인(km)
  // Recompute timeline using Kakao sections + stays
  const recomputeTimelineWithStays = ({
    stops,
    sections,
    startTime,
    stays,
  }) => {
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
      if (prevS) {
        if (sections && sections[i - 1] && sections[i - 1].summary) {
          const sec = sections[i - 1];
          const dist = sec.summary.distance || 0;
          const dur = sec.summary.duration || 0;
          km = dist / 1000;
          minutes = Math.round(dur / 60);
          const r0 = (sec.roads || []).find((r) => r && (r.name || r.road_name));
          roadName = (r0 && (r0.name || r0.road_name)) || "";
        } else {
          // 섹션 요약이 없으면 직선거리 추정값 사용
          if (
            typeof prevS.lat === "number" && typeof prevS.lng === "number" &&
            typeof curS.lat === "number" && typeof curS.lng === "number"
          ) {
            const R = 6371;
            const toRad = (d) => (d * Math.PI) / 180;
            const dLat = toRad(curS.lat - prevS.lat);
            const dLng = toRad(curS.lng - prevS.lng);
            const s = Math.sin(dLat/2)**2 + Math.cos(toRad(prevS.lat))*Math.cos(toRad(curS.lat))*Math.sin(dLng/2)**2;
            const kmEst = 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
            km = kmEst;
            minutes = Math.round((kmEst / 4.5) * 60);
          }
        }
      }
      if (i > 0) accMin += minutes; // travel from prev -> current
      const hh = Math.floor(accMin / 60)
        .toString()
        .padStart(2, "0");
      const mm = (accMin % 60).toString().padStart(2, "0");
      steps.push({
        idx: i + 1,
        name: curS.name,
        km,
        minutes,
        roadName,
        arrival: `${hh}:${mm}`,
      });
      if (map && typeof curS.lat === "number" && typeof curS.lng === "number") {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(curS.lat, curS.lng),
          map,
        });
        markerRefs.current.push(marker);
      }
      const stay =
        Array.isArray(stays) && typeof stays[i] === "number" ? stays[i] : 0;
      accMin += i < stops.length - 1 ? stay : 0; // dwell before next leg
    }
    return steps;
  };

  const calculateRoute = async (dayIndex = activeDay) => {
    const d = days[dayIndex];
    if (!d || !d.startLocation || !d.endLocation) return;
    setIsCalculating(true);
    try {
      // Resolve coordinates (prefer user-selected coords, fallback to geocoding)
      const start =
        d.startCoords && d.startCoords.lat && d.startCoords.lng
          ? {
              name: d.startLocation,
              lat: d.startCoords.lat,
              lng: d.startCoords.lng,
            }
          : await geocode(d.startLocation);
      const end =
        d.endCoords && d.endCoords.lat && d.endCoords.lng
          ? { name: d.endLocation, lat: d.endCoords.lat, lng: d.endCoords.lng }
          : await geocode(d.endLocation);
      const mids = [];
      for (const w of d.waypoints || []) {
        if (w && typeof w.lat === "number" && typeof w.lng === "number") {
          mids.push({ name: w.name, lat: w.lat, lng: w.lng });
        } else if (w && w.name) {
          try {
            const p = await geocode(w.name);
            mids.push(p);
          } catch {}
        }
      }

      const payload = {
        origin: { x: String(start.lng), y: String(start.lat) },
        destination: { x: String(end.lng), y: String(end.lat) },
        waypoints: mids.slice(0, 10).map((m) => ({ x: String(m.lng), y: String(m.lat) })),
        priority: (d.priority === "SHORTEST" ? "DISTANCE" : (d.priority === "FAST" ? "FAST" : "RECOMMEND")),
        multi: true,
      };
      const r = await fetch("/api/kakao-waypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || !j.routes) {
        console.error("/api/kakao-waypoints error", r.status, j);
        alert("경로 요청 실패: " + (j?.msg || j?.message || r.status));
        return;
      }
      const route = (j.routes && j.routes[0]) || null;
      const legend = (j.routes || []).slice(0, 3).map((rt, idx) => {
        const p = rt && rt.__priority;
        const base = p === "DISTANCE" ? "\uCD5C\uB2E8\uAC70\uB9AC" : p === "FAST" ? "\uBE60\uB978\uAE38" : "\uCD94\uCC9C";
        const km = rt && rt.summary && typeof rt.summary.distance === "number" ? (rt.summary.distance / 1000) : 0;
        const min = rt && rt.summary && typeof rt.summary.duration === "number" ? Math.round(rt.summary.duration / 60) : 0;
        const label = base + (km ? (" \u00B7 " + km.toFixed(1) + "km \u00B7 " + min + "\uBD84") : "");
        return { color: ROUTE_COLORS[idx % ROUTE_COLORS.length], label };
      });
      setRouteLegend(legend);
      lastRoutesRef.current = j.routes;
      setActiveRouteIdx(-1);
      // Draw using API vertexes
      const stops = [start, ...mids, end];
      lastStopsRef.current = stops;
      drawPolylines(j.routes);

      // Build timeline using Kakao sections (per-leg accuracy)
      const sections =
        route && Array.isArray(route.sections) ? route.sections : [];
      // Normalize stays length
      const stays = Array.isArray(d.stays) ? [...d.stays] : [];
      const needLen = stops.length;
      while (stays.length < needLen) stays.push(0);
      const steps = recomputeTimelineWithStays({
        stops,
        sections,
        startTime: d.startTime,
        stays,
      });

      const totalKm = route?.summary?.distance
        ? route.summary.distance / 1000
        : steps.reduce((s, x) => s + (x.idx > 1 ? x.km : 0), 0);
      const totalMin = route?.summary?.duration
        ? Math.round(route.summary.duration / 60)
        : steps.reduce((s, x) => s + (x.idx > 1 ? x.minutes : 0), 0);

      // 경로 폴백: 일부 경로가 비어있으면 재지오코딩 및 Naver 보행 폴백 적용
      const anyEmpty = (j.routes || []).slice(0,3).some(rt => (buildPathFromRoute(rt) || []).length === 0);
      if (anyEmpty) {
        let center = null;
        try {
          const all = stops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
          if (all.length) {
            const avg = all.reduce((acc,s)=>({ lat: acc.lat + s.lat, lng: acc.lng + s.lng }), { lat:0, lng:0 });
            center = { lat: avg.lat / all.length, lng: avg.lng / all.length };
          }
        } catch {}
        if (center) {
          try {
            const s2 = d.startCoords && d.startCoords.lat && d.startCoords.lng
              ? { name: d.startLocation, lat: d.startCoords.lat, lng: d.startCoords.lng }
              : await geocode(d.startLocation, { center, radius: 20000 });
            const e2 = d.endCoords && d.endCoords.lat && d.endCoords.lng
              ? { name: d.endLocation, lat: d.endCoords.lat, lng: d.endCoords.lng }
              : await geocode(d.endLocation, { center, radius: 20000 });
            const m2 = [];
            for (const w of d.waypoints || []) {
              if (w && typeof w.lat === 'number' && typeof w.lng === 'number') m2.push({ name:w.name, lat:w.lat, lng:w.lng });
              else if (w && w.name) { try { m2.push(await geocode(w.name, { center, radius: 20000 })); } catch {} }
            }
            lastStopsRef.current = [s2, ...m2, e2];
            const payload2 = {
              origin: { x: String(s2.lng), y: String(s2.lat) },
              destination: { x: String(e2.lng), y: String(e2.lat) },
              waypoints: m2.slice(0,10).map(m=>({ x:String(m.lng), y:String(m.lat) })),
              priority: (d.priority === "SHORTEST" ? "DISTANCE" : (d.priority === "FAST" ? "FAST" : "RECOMMEND")),
              multi: true,
            };
            const r2 = await fetch('/api/kakao-waypoints', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload2) });
            const j2 = await r2.json();
            if (r2.ok && j2?.routes?.length) { lastRoutesRef.current = j2.routes; drawPolylines(j2.routes); }
          } catch (e) { console.warn('re-geocode retry failed', e); }
        }
        const stillEmpty = (lastRoutesRef.current || j.routes || []).slice(0,3).every(rt => (buildPathFromRoute(rt) || []).length === 0);
        if (stillEmpty) {
          try {
            const payload3 = {
              origin: { x: String(lastStopsRef.current[0].lng), y: String(lastStopsRef.current[0].lat) },
              destination: { x: String(lastStopsRef.current[lastStopsRef.current.length-1].lng), y: String(lastStopsRef.current[lastStopsRef.current.length-1].lat) },
              waypoints: lastStopsRef.current.slice(1,-1).map(m=>({ x:String(m.lng), y:String(m.lat) })),
            };
            const r3 = await fetch('/api/naver/walking', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload3) });
            const j3 = await r3.json();
            if (r3.ok && j3?.routes?.length) { lastRoutesRef.current = j3.routes; drawPolylines(j3.routes); }
          } catch (e) { console.warn('naver fallback failed', e); }
        }
      }

      setDays((prev) => {
        const next = [...prev];
        next[dayIndex] = {
          ...next[dayIndex],
          timeline: steps,
          summary: { distance: totalKm, duration: totalMin },
          lastRoutes: lastRoutesRef.current || j.routes,
          stays,
          startCoords: { lat: start.lat, lng: start.lng },
          endCoords: { lat: end.lat, lng: end.lng },
          waypoints: (d.waypoints || []).map((w, i) => {
            const src = mids[i];
            return src && typeof src.lat === 'number' && typeof src.lng === 'number'
              ? { name: src.name, lat: src.lat, lng: src.lng }
              : w;
          }),
        };
        return next;
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
        const start = d.startCoords
          ? {
              name: d.startLocation,
              lat: d.startCoords.lat,
              lng: d.startCoords.lng,
            }
          : { name: d.startLocation };
        const end = d.endCoords
          ? { name: d.endLocation, lat: d.endCoords.lat, lng: d.endCoords.lng }
          : { name: d.endLocation };
        const mids = (d.waypoints || []).map((w) => ({
          name: w.name,
          lat: w.lat,
          lng: w.lng,
        }));
        const stops = [start, ...mids, end];
        const route = d.lastRoutes[0];
        const sections =
          route && Array.isArray(route.sections) ? route.sections : [];
        const steps = recomputeTimelineWithStays({
          stops,
          sections,
          startTime: d.startTime,
          stays,
        });
        const totalKm = route?.summary?.distance
          ? route.summary.distance / 1000
          : steps.reduce((s, x) => s + (x.idx > 1 ? x.km : 0), 0);
        const totalMin = route?.summary?.duration
          ? Math.round(route.summary.duration / 60)
          : steps.reduce((s, x) => s + (x.idx > 1 ? x.minutes : 0), 0);
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
        .map((d, i) => ({ ...d, id: `day-${i + 1}`, title: `${i + 1}일차` }));
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
        title: `${prev.length + 1}일차`,
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
        alert("코스 저장에 실패했습니다");
      }
    } catch (e) {
      console.error(e);
      alert("코스 저장 오류");
    }
  };

  return (
    <div className="directions-wrapper">
      {/* Left vertical step nav */}
      <aside className="directions-leftbar">
        <div className="directions-actionbar">
          <button className=" leftbar-primary">전체설정</button>
        </div>
        <nav className="step-nav">
          <div className="step-item">
            <span className="label">STEP 1</span>
            <span className="title">장소 선택</span>
          </div>
          <div className="step-item">
            <span className="label">STEP 2</span>
            <span className="title">경로 편집</span>
          </div>
          <div className="step-item">
            <span className="label">STEP 3</span>
            <span className="title">저장/공유</span>
          </div>
        </nav>
        <div className="directions-actionbar">
          <Button variant="outline" className="mb-2">
            취소
          </Button>
          <Button variant="outline" className="mb-2">
            적용
          </Button>
          <Button className="bg-indigo-600 text-white">저장</Button>
        </div>
      </aside>

      {/* Middle: content panel */}
      <main className="directions-panel">
        <div className="flex items-center justify-between mb-3">
          <div className="font-extrabold text-lg text-slate-800">경로 편집</div>
          <div className="flex items-center gap-2">
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
              <Save className="w-4 h-4 mr-1" />
              저장/공유
            </Button>
          </div>
        </div>

        {/* Active-day controls (top toolbar) */}
        <Card className="shadow-sm mb-3">
          <CardContent className="pt-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-slate-500 mb-1">출발</div>
                <PlaceSearchInput
                  value={cur.startLocation}
                  onChange={(v) =>
                    updateCur({ startLocation: v, startCoords: null })
                  }
                  onSelect={(p) =>
                    updateCur({
                      startLocation: p.name,
                      startCoords: { lat: p.lat, lng: p.lng },
                    })
                  }
                  placeholder="예) 서울역"
                />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">도착</div>
                <PlaceSearchInput
                  value={cur.endLocation}
                  onChange={(v) =>
                    updateCur({ endLocation: v, endCoords: null })
                  }
                  onSelect={(p) =>
                    updateCur({
                      endLocation: p.name,
                      endCoords: { lat: p.lat, lng: p.lng },
                    })
                  }
                  placeholder="예) 강남역"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => setSearchOpen(true)}
                  variant="outline"
                  className="w-1/2"
                >
                  <Search className="w-4 h-4 mr-1" />
                  경유지 검색
                </Button>
                <Button
                  onClick={() => calculateRoute(activeDay)}
                  disabled={
                    isCalculating || !cur.startLocation || !cur.endLocation
                  }
                  className="bg-indigo-600 text-white w-1/2"
                >
                  {isCalculating ? "계산 중..." : "경로 계산"}
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
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
                <input
                  type="time"
                  value={cur.startTime}
                  onChange={(e) => updateCur({ startTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={addDay}>
                  <Plus className="w-4 h-4 mr-1" />
                  일차 추가
                </Button>
                {days.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => removeDay(activeDay)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    일차 삭제
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => duplicateDay(activeDay)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  일차 복사
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day columns */}
        <div className="day-columns">
          {days.map((d, i) => (
            <Card
              key={d.id}
              className={`shadow-sm day-card ${
                i === activeDay ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <button
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      i === activeDay
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700"
                    }`}
                    onClick={() => setActiveDay(i)}
                  >
                    {d.title}
                  </button>
                  <span className="text-slate-500 text-xs mr-1">시작</span>
                  <input
                    type="time"
                    value={d.startTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDays((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], startTime: v };
                        return next;
                      });
                    }}
                    className="border rounded px-2 py-1 text-xs"
                  />
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calculateRoute(i)}
                  >
                    계산
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {d.summary && (
                  <div className="text-xs text-slate-600 mb-1">
                    총 {d.summary.distance?.toFixed?.(1) || 0} km 약{" "}
                    {d.summary.duration || 0} 분
                  </div>
                )}
                <ol className="space-y-2 text-sm">
                  {(d.timeline || []).map((s, idx) => (
                    <li
                      key={`${d.id}-${s.idx}-${idx}`}
                      className="p-2 rounded-xl border bg-white flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white grid place-items-center font-bold text-[11px]">
                        {s.idx}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {s.name}
                        </div>
                        {s.idx > 1 && (
                          <div className="text-slate-500 text-xs">
                            도착 {s.arrival} 약 {s.km.toFixed(1)} km 약{" "}
                            {s.minutes} 분
                            {s.roadName ? ` 약 ${s.roadName}` : ""}
                          </div>
                        )}
                      </div>
                      {i === activeDay && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <label className="whitespace-nowrap">체류(분)</label>
                          <input
                            type="number"
                            min="0"
                            value={
                              d.stays && typeof d.stays[idx] === "number"
                                ? d.stays[idx]
                                : 0
                            }
                            onChange={(e) => {
                              setActiveDay(i);
                              updateStay(idx, e.target.value);
                            }}
                            className="w-16 border rounded px-2 py-1"
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Right: full-height map */}
      <section className="directions-mapbox p-4">
        <div className="relative w-full h-full">
          {routeLegend && routeLegend.length > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur rounded-lg border shadow px-3 py-2 text-xs text-slate-700">
              <div className="font-semibold mb-1">경로 우선순위</div>
              <div className="flex gap-3 items-center">
                {routeLegend.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActiveRouteIdx(idx); if (lastRoutesRef.current) drawPolylines(lastRoutesRef.current); }}
                    className={`flex items-center gap-1 ${activeRouteIdx === idx ? 'font-semibold' : ''}`}
                  >
                    <span
                      style={{ background: it.color }}
                      className="inline-block w-3 h-3 rounded-full border"
                    />
                    <span>{it.label}</span>
                  </button>
                ))}
                <label className="ml-2 inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={showOnlyActive}
                    onChange={(e) => { setShowOnlyActive(e.target.checked); if (lastRoutesRef.current) drawPolylines(lastRoutesRef.current); }}
                  />
                  <span>단일 경로 강조</span>
                </label>
              </div>
            </div>
          )}
          <div ref={mapElRef} className="w-full h-full rounded-2xl border" />
        </div>
      </section>

      {/* Waypoint search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">경유지 검색</div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <PlaceSearchInput
                value={""}
                onChange={() => {}}
                onSelect={(p) => {
                  updateCur({
                    waypoints: [
                      ...(cur.waypoints || []),
                      { name: p.name, lat: p.lat, lng: p.lng },
                    ],
                  });
                  setSearchOpen(false);
                }}
                placeholder="장소명을 입력하고 목록에서 선택"
              />
              <div className="text-xs text-slate-500">
                목록에서 항목을 선택하면 경유지로 추가됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

