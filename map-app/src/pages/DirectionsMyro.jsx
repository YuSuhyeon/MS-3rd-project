import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import { Plus, Search, X, Save, Trash2, Copy, Car, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DirectionsMyro() {
  const location = useLocation();

  // Multi-day state and helper
  const makeEmptyDay = (idx = 0) => ({
    id: `day-${Date.now()}-${idx}`, // Use a more unique ID
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

  // Kakao map refs
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const markerRefs = useRef([]);
  const [routeLegend, setRouteLegend] = useState([]);
  const ROUTE_COLORS = ["#60a5fa", "#a78bfa", "#34d399"]; // Updated colors for dark theme
  const lastRoutesRef = useRef(null);
  const lastStopsRef = useRef([]);
  const [activeRouteIdx, setActiveRouteIdx] = useState(-1);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // --- LOGIC FUNCTIONS (UNCHANGED) ---

  // Load Kakao Maps SDK
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

  // Load preset course
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
          d0.startCoords =
            typeof first?.lat === "number" && typeof first?.lng === "number"
              ? { lat: first.lat, lng: first.lng }
              : null;
          d0.endCoords =
            typeof last?.lat === "number" && typeof last?.lng === "number"
              ? { lat: last.lat, lng: last.lng }
              : null;
          d0.waypoints = preset.stops
            .slice(1, -1)
            .map((s) => ({
              name: s?.name || "",
              lat: typeof s?.lat === "number" ? s.lat : undefined,
              lng: typeof s?.lng === "number" ? s.lng : undefined,
            }));
          d0.priority = "SHORTEST";
          next[0] = d0;
          return next;
        });
        presetAppliedRef.current = true;
        try {
          sessionStorage.removeItem("routePreset");
        } catch {}
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

  // Load draft from localStorage
  useEffect(() => {
    try {
      const hasPresetState = !!(location.state && location.state.presetCourse);
      const hasPresetSession = !!sessionStorage.getItem("routePreset");
      if (presetAppliedRef.current || hasPresetState || hasPresetSession)
        return;
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

  // Save draft to localStorage
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

  const geocode = (name) =>
    new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error("empty"));
        return;
      }
      const ps = new window.kakao.maps.services.Places();
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
      });
    });

  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
    markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
    markerRefs.current = [];
  };

  const buildPathFromRoute = (route) => {
    const path = [];
    (route?.sections || []).forEach((sec) =>
      (sec?.roads || []).forEach((r) => {
        const v = r?.vertexes || [];
        for (let i = 0; i < v.length; i += 2)
          path.push(new window.kakao.maps.LatLng(v[i + 1], v[i]));
      })
    );
    return path;
  };

  const drawPolylines = (routes) => {
    const map = mapObjRef.current;
    if (!map || !routes) return;
    clearMap();
    const bounds = new window.kakao.maps.LatLngBounds();
    routes.slice(0, 3).forEach((route, idx) => {
      const path = buildPathFromRoute(route);
      if (path.length) {
        path.forEach((p) => bounds.extend(p));
        const isActive =
          activeRouteIdx === -1 ? idx === 0 : idx === activeRouteIdx;
        if (showOnlyActive && !isActive) return;
        const poly = new window.kakao.maps.Polyline({
          path,
          strokeWeight: isActive ? 6 : 4,
          strokeColor: ROUTE_COLORS[idx % ROUTE_COLORS.length],
          strokeOpacity: isActive ? 1.0 : 0.7,
          strokeStyle: "solid",
        });
        poly.setMap(map);
        window.kakao.maps.event.addListener(poly, "click", () => {
          setActiveRouteIdx(idx);
          drawPolylines(routes);
        });
        polyRefs.current.push(poly);
      }
    });
    if (!bounds.isEmpty()) map.setBounds(bounds);
  };

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
    if (mapObjRef.current) {
      markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
      markerRefs.current = [];
    }
    for (let i = 0; i < stops.length; i++) {
      const curS = stops[i];
      let km = 0,
        minutes = 0;
      if (i > 0) {
        const sec = sections?.[i - 1];
        km = (sec?.summary?.distance || 0) / 1000;
        minutes = Math.round((sec?.summary?.duration || 0) / 60);
        accMin += minutes;
      }
      const hh = Math.floor(accMin / 60)
        .toString()
        .padStart(2, "0");
      const mm = (accMin % 60).toString().padStart(2, "0");
      steps.push({
        idx: i + 1,
        name: curS.name,
        km,
        minutes,
        arrival: `${hh}:${mm}`,
      });
      if (
        mapObjRef.current &&
        typeof curS.lat === "number" &&
        typeof curS.lng === "number"
      ) {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(curS.lat, curS.lng),
          map: mapObjRef.current,
        });
        markerRefs.current.push(marker);
      }
      accMin +=
        Array.isArray(stays) && typeof stays[i] === "number" ? stays[i] : 0;
    }
    return steps;
  };

  const calculateRoute = async (dayIndex = activeDay) => {
    const d = days[dayIndex];
    if (!d || !d.startLocation || !d.endLocation) return;
    setIsCalculating(true);
    try {
      const start = d.startCoords?.lat
        ? { ...d.startCoords, name: d.startLocation }
        : await geocode(d.startLocation);
      const end = d.endCoords?.lat
        ? { ...d.endCoords, name: d.endLocation }
        : await geocode(d.endLocation);
      const mids = await Promise.all(
        (d.waypoints || []).map((w) =>
          w.lat ? Promise.resolve(w) : geocode(w.name).catch(() => null)
        )
      );
      const validMids = mids.filter(Boolean);

      const payload = {
        origin: { x: String(start.lng), y: String(start.lat) },
        destination: { x: String(end.lng), y: String(end.lat) },
        waypoints: validMids.map((m) => ({
          x: String(m.lng),
          y: String(m.lat),
        })),
        priority: d.priority === "SHORTEST" ? "DISTANCE" : "RECOMMEND",
        alternatives: true,
      };

      const r = await fetch("/api/kakao/driving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || !j.routes) {
        throw new Error("경로 API 요청 실패: " + (j?.msg || r.status));
      }

      const routes = j.routes || [];
      const legend = routes.map((rt, idx) => {
        const km = (rt.summary.distance / 1000).toFixed(1);
        const min = Math.round(rt.summary.duration / 60);
        const fare = rt.summary.fare.taxi;
        return {
          color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
          label: `${km}km · ${min}분 · ${fare.toLocaleString()}원`,
        };
      });
      setRouteLegend(legend);
      lastRoutesRef.current = routes;
      setActiveRouteIdx(-1);

      const stops = [start, ...validMids, end];
      lastStopsRef.current = stops;
      drawPolylines(routes);

      const sections = routes[0]?.sections || [];
      const stays = Array.isArray(d.stays)
        ? [...d.stays]
        : Array(stops.length).fill(0);
      const steps = recomputeTimelineWithStays({
        stops,
        sections,
        startTime: d.startTime,
        stays,
      });

      const summary = {
        distance: routes[0].summary.distance / 1000,
        duration: Math.round(routes[0].summary.duration / 60),
      };

      setDays((prev) => {
        const next = [...prev];
        next[dayIndex] = {
          ...next[dayIndex],
          timeline: steps,
          summary,
          lastRoutes: routes,
          stays,
          startCoords: { lat: start.lat, lng: start.lng },
          endCoords: { lat: end.lat, lng: end.lng },
          waypoints: validMids,
        };
        return next;
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateStay = (idx, minutes) => {
    setDays((prev) => {
      const next = [...prev];
      const d = { ...next[activeDay] };
      const stays = [...(d.stays || [])];
      stays[idx] = Math.max(0, parseInt(minutes || 0, 10));
      if (d.lastRoutes) {
        const route = d.lastRoutes[activeRouteIdx === -1 ? 0 : activeRouteIdx];
        const stops = lastStopsRef.current;
        const sections = route?.sections || [];
        d.timeline = recomputeTimelineWithStays({
          stops,
          sections,
          startTime: d.startTime,
          stays,
        });
      }
      d.stays = stays;
      next[activeDay] = d;
      return next;
    });
  };

  const addDay = () => {
    // 새 일차 추가 후 해당 탭 활성화
    setDays((prev) => [...prev, makeEmptyDay(prev.length)]);
    setActiveDay(days.length);
  };

  const removeDay = (idx) => {
    if (days.length <= 1) return;
    setDays((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, title: `${i + 1}일차` }))
    );
    setActiveDay((p) => Math.max(0, p - 1));
  };

  const duplicateDay = (idx) => {
    const src = days[idx];
    const copy = {
      ...src,
      id: `day-${Date.now()}`,
      title: `${days.length + 1}일차`,
      timeline: [],
      summary: null,
      lastRoutes: null,
    };
    setDays((prev) => [...prev, copy]);
    setActiveDay(days.length);
  };

  const saveToBackend = async () => {
    try {
      const payload = { name: "route-plan-" + Date.now(), days };
      const r = await fetch("/api/route-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok && j.id) setShareInfo({ id: j.id, shareUrl: j.shareUrl });
      else throw new Error("저장 실패");
    } catch (e) {
      console.error(e);
      alert("코스 저장 오류");
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-200 font-sans grid grid-cols-[1fr_450px] overflow-hidden">
      {/* Middle: Content Panel */}
      <main className="flex flex-col p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-shrink-0"
        >
          <h1 className="text-2xl font-bold text-white">경로 편집기</h1>
          <div className="flex items-center gap-2">
            {shareInfo && (
              <a
                href={shareInfo.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-400 underline"
              >
                공유 링크
              </a>
            )}
            <Button
              variant="outline"
              onClick={saveToBackend}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-700"
            >
              <Save className="w-4 h-4 mr-2" /> 저장 및 공유
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4 flex-shrink-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <PlaceSearchInput
              dark
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
              placeholder="출발지 (예: 서울역)"
            />
            <PlaceSearchInput
              dark
              value={cur.endLocation}
              onChange={(v) => updateCur({ endLocation: v, endCoords: null })}
              onSelect={(p) =>
                updateCur({
                  endLocation: p.name,
                  endCoords: { lat: p.lat, lng: p.lng },
                })
              }
              placeholder="도착지 (예: 강남역)"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSearchOpen(true)}
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-700"
              >
                <Search className="w-4 h-4 mr-2" /> 경유지
              </Button>
              <Button
                onClick={() => calculateRoute(activeDay)}
                disabled={
                  isCalculating || !cur.startLocation || !cur.endLocation
                }
                className="w-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              >
                {isCalculating ? "계산 중..." : "경로 계산"}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            {days.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(i)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeDay === i
                    ? "bg-indigo-500 text-white font-semibold"
                    : "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {d.title}
              </button>
            ))}
            <Button
              onClick={addDay}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:bg-slate-700 hover:text-indigo-400"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600"
            >
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 mb-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-400">우선순위</label>
                  <select
                    value={cur.priority}
                    onChange={(e) => updateCur({ priority: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="RECOMMEND">추천</option>
                    <option value="FAST">최단시간</option>
                    <option value="SHORTEST">최단거리</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-400">출발 시간</label>
                  <input
                    type="time"
                    value={cur.startTime}
                    onChange={(e) => updateCur({ startTime: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => duplicateDay(activeDay)}
                    className="text-slate-400 hover:text-indigo-400"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {days.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDay(activeDay)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {cur.summary && (
                <div className="text-sm text-slate-400 mb-3 px-1">
                  총{" "}
                  <span className="font-semibold text-indigo-400">
                    {cur.summary.distance?.toFixed?.(1) || 0} km
                  </span>{" "}
                  · 약{" "}
                  <span className="font-semibold text-indigo-400">
                    {cur.summary.duration || 0} 분
                  </span>{" "}
                  예상
                </div>
              )}
              <ol className="space-y-3">
                {(cur.timeline || []).map((s, idx) => (
                  <li
                    key={`${cur.id}-${s.idx}`}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/30 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 mt-0.5 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center font-bold text-xs flex-shrink-0">
                      {s.idx}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 truncate">
                        {s.name}
                      </div>
                      {s.idx > 1 && (
                        <div className="text-slate-400 text-xs mt-1 flex items-center gap-3">
                          <span>
                            <Car size={12} className="inline mr-1" />{" "}
                            {s.km.toFixed(1)} km · {s.minutes} 분
                          </span>
                          <span>
                            <Clock size={12} className="inline mr-1" /> 도착{" "}
                            {s.arrival}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <label className="whitespace-nowrap">체류(분)</label>
                      <input
                        type="number"
                        min="0"
                        value={cur.stays?.[idx] ?? 0}
                        onChange={(e) => updateStay(idx, e.target.value)}
                        className="w-16 bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <aside className="p-4 bg-slate-900/50 border-l border-slate-800">
        <div className="relative w-full h-full">
          {routeLegend.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 left-3 z-10 bg-slate-800/70 backdrop-blur rounded-lg border border-slate-700 shadow-lg px-3 py-2 text-xs text-slate-300"
            >
              <div className="font-semibold mb-1 text-white">경로 옵션</div>
              <div className="flex flex-col gap-1">
                {routeLegend.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveRouteIdx(idx);
                      if (lastRoutesRef.current)
                        drawPolylines(lastRoutesRef.current);
                    }}
                    className={`flex items-center gap-2 p-1 rounded-md transition-colors ${
                      activeRouteIdx === idx ||
                      (activeRouteIdx === -1 && idx === 0)
                        ? "font-semibold text-white bg-indigo-500/20"
                        : "hover:bg-slate-700"
                    }`}
                  >
                    <span
                      style={{ background: it.color }}
                      className="inline-block w-3 h-3 rounded-full border border-black/20"
                    />
                    <span>{it.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          <div
            ref={mapElRef}
            className="w-full h-full rounded-2xl border border-slate-700 bg-slate-800"
          />
        </div>
      </aside>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h3 className="font-semibold text-white">경유지 검색/추가</h3>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <PlaceSearchInput
                  dark
                  autoFocus
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
                <p className="text-xs text-slate-500">
                  목록에서 항목을 선택하면 현재 활성화된 일차의 경유지로
                  추가됩니다.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
