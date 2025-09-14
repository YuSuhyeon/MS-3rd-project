import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import TMapContainer from "components/directions/TMapContainer";
import { ensureTmap } from "integrations/tmapLoader";
import {
  Plus,
  Search,
  X,
  Save,
  Trash2,
  Copy,
  Car,
  Clock,
  GripVertical,
  Map,
  PersonStanding, // 'Walking' 대신 'PersonStanding' 아이콘을 사용
  Train,
} from "lucide-react";
import { Reorder, motion, AnimatePresence } from "framer-motion";

export default function DirectionsMantineImproved() {
  const location = useLocation();

  // --- STATE AND LOGIC ---
  const makeEmptyDay = (idx = 0) => ({
    id: `day-${Date.now()}-${idx}`,
    title: `${idx + 1}일차`,
    startLocation: "",
    startCoords: null,
    endLocation: "",
    endCoords: null,
    waypoints: [],
    priority: "RECOMMEND",
    startTime: "09:00",
    stays: [],
    timeline: [],
    summary: null,
    lastRoutes: null,
  });
  const [days, setDays] = useState([makeEmptyDay(0)]);
  const [activeDay, setActiveDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);
  const [mapProvider, setMapProvider] = useState("KAKAO");
  const [routeMode, setRouteMode] = useState("CAR");
  const presetAppliedRef = useRef(false);
  const [tmapReady, setTmapReady] = useState(false);
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const markerRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    if (mapProvider !== "TMAP") {
      setTmapReady(false);
      return;
    }
    const overrideKey =
      process.env.REACT_APP_TMAP_APP_KEY || window.REACT_APP_TMAP_APP_KEY;
    ensureTmap(overrideKey)
      .then((api) => {
        if (!cancelled) setTmapReady(!!(api && api.Map));
      })
      .catch(() => {
        if (!cancelled) setTmapReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mapProvider]);

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

  // 맵 스위칭할 때, 안전하게 맵 재생성
  useEffect(() => {
    if (mapProvider !== "KAKAO") return;
    const init = async () => {
      const ensureKakao = () =>
        new Promise((resolve) => {
          if (window.kakao && window.kakao.maps) {
            resolve();
            return;
          }
          const appkey =
            process.env.REACT_APP_KAKAO_API_KEY ||
            window.REACT_APP_KAKAO_API_KEY;
          const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = () => window.kakao.maps.load(resolve);
          document.head.appendChild(s);
        });
      await ensureKakao();
      if (mapElRef.current) {
        try {
          clearMap();
        } catch {}
        mapObjRef.current = null;
        const center = new window.kakao.maps.LatLng(37.5665, 126.978);
        mapObjRef.current = new window.kakao.maps.Map(mapElRef.current, {
          center,
          level: 7,
        });
      }
    };
    init();
  }, [mapProvider]);

  useEffect(() => {
    try {
      let preset = location.state?.presetCourse || null;
      if (!preset) {
        const raw = sessionStorage.getItem("routePreset");
        if (raw) preset = JSON.parse(raw);
      }
      if (preset?.stops?.length >= 2) {
        setDays((prev) => {
          const next = [...prev];
          const d0 = { ...next[0] };
          const first = preset.stops[0];
          const last = preset.stops[preset.stops.length - 1];
          d0.startLocation = first?.name || "";
          d0.endLocation = last?.name || "";
          d0.startCoords =
            first?.lat && first?.lng
              ? { lat: first.lat, lng: first.lng }
              : null;
          d0.endCoords =
            last?.lat && last?.lng ? { lat: last.lat, lng: last.lng } : null;
          d0.waypoints = preset.stops
            .slice(1, -1)
            .map((s) => ({ name: s?.name || "", lat: s?.lat, lng: s?.lng }));
          next[0] = d0;
          return next;
        });
        presetAppliedRef.current = true;
        sessionStorage.removeItem("routePreset");
      }
    } catch {}
  }, [location.state]);

  useEffect(() => {
    if (
      presetAppliedRef.current ||
      location.state?.presetCourse ||
      sessionStorage.getItem("routePreset")
    )
      return;
    try {
      const raw = localStorage.getItem("routePlanDraft");
      if (raw) {
        const j = JSON.parse(raw);
        if (j?.days?.length) {
          setDays(j.days);
          setActiveDay(j.activeDay || 0);
        }
      }
    } catch {}
  }, [location.state]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "routePlanDraft",
        JSON.stringify({ days, activeDay })
      );
    } catch {}
  }, [days, activeDay]);

  const cur = days[activeDay] || makeEmptyDay(activeDay);

  const updateCur = (patch) =>
    setDays((prev) =>
      prev.map((day, i) => (i === activeDay ? { ...day, ...patch } : day))
    );

  const geocode = (name) =>
    new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error("empty"));
        return;
      }
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(name, (data, status) =>
        status === window.kakao.maps.services.Status.OK && data[0]
          ? resolve({
              lat: parseFloat(data[0].y),
              lng: parseFloat(data[0].x),
              name,
            })
          : reject(new Error("not_found"))
      );
    });

  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = [];
  };

  const drawPolylines = (routes) => {
    if (mapProvider !== "KAKAO" && tmapReady) return;
    const map = mapObjRef.current;
    if (!map) return;
    clearMap();
    if (!routes?.length) return;
    const colors = ["#60a5fa", "#a78bfa", "#34d399"];
    const bounds = new window.kakao.maps.LatLngBounds();
    routes.slice(0, 3).forEach((route, idx) => {
      const path = [];
      (route.sections || []).forEach((sec) =>
        (sec.roads || []).forEach((r) => {
          for (let i = 0; i < (r.vertexes || []).length; i += 2) {
            const ll = new window.kakao.maps.LatLng(
              r.vertexes[i + 1],
              r.vertexes[i]
            );
            path.push(ll);
            bounds.extend(ll);
          }
        })
      );
      if (path.length) {
        const poly = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 5,
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

  useEffect(() => {
    if (mapProvider === "KAKAO" || !tmapReady)
      cur?.lastRoutes ? drawPolylines(cur.lastRoutes) : clearMap();
    else clearMap();
  }, [activeDay, mapProvider, cur.lastRoutes, tmapReady]);

  const tmapStops = useMemo(() => {
    const stops = [];
    if (cur.startCoords)
      stops.push({ ...cur.startCoords, name: cur.startLocation });
    (cur.waypoints || []).forEach((w) => {
      if (w.lat && w.lng) stops.push(w);
    });
    if (cur.endCoords) stops.push({ ...cur.endCoords, name: cur.endLocation });
    return stops;
  }, [
    cur.startCoords,
    cur.endCoords,
    cur.waypoints,
    cur.startLocation,
    cur.endLocation,
  ]);

  const tmapPath = useMemo(() => {
    const path = [];
    if (!cur.lastRoutes?.length) return path;
    (cur.lastRoutes[0].sections || []).forEach((sec) =>
      (sec.roads || []).forEach((r) => {
        for (let i = 0; i < (r.vertexes || []).length; i += 2)
          path.push({ lat: r.vertexes[i + 1], lng: r.vertexes[i] });
      })
    );
    return path;
  }, [cur.lastRoutes]);

  const recomputeTimelineWithStays = ({
    stops,
    sections,
    startTime,
    stays,
  }) => {
    const steps = [];
    let accMin =
      parseInt(String(startTime).split(":")[0] || "0") * 60 +
      parseInt(String(startTime).split(":")[1] || "0");
    for (let i = 0; i < stops.length; i++) {
      let km = 0,
        minutes = 0;
      if (i > 0) {
        const sec = sections[i - 1];
        if (sec?.summary) {
          km = sec.summary.distance / 1000;
          minutes = Math.round(sec.summary.duration / 60);
        }
        accMin += minutes;
      }
      const hh = String(Math.floor(accMin / 60)).padStart(2, "0");
      const mm = String(accMin % 60).padStart(2, "0");
      steps.push({
        idx: i + 1,
        name: stops[i].name,
        km,
        minutes,
        arrival: `${hh}:${mm}`,
      });
      if (i < stops.length - 1) accMin += stays[i] || 0;
    }
    return steps;
  };

  const calculateRoute = async () => {
    if (!cur.startLocation || !cur.endLocation) return;
    setIsCalculating(true);
    try {
      const start = cur.startCoords || (await geocode(cur.startLocation));
      const end = cur.endCoords || (await geocode(cur.endLocation));
      const mids = await Promise.all(
        (cur.waypoints || []).map((w) =>
          w.lat ? Promise.resolve(w) : geocode(w.name).catch(() => null)
        )
      );
      const validMids = mids.filter(Boolean);
      let res;
      if (mapProvider === "TMAP") {
        const api = routeMode === "TRANSIT" ? "tmap/transit" : "tmap/route";
        res = await fetch(`/api/${api}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: {
              x: String(start.lng),
              y: String(start.lat),
              name: cur.startLocation,
            },
            destination: {
              x: String(end.lng),
              y: String(end.lat),
              name: cur.endLocation,
            },
            waypoints: validMids.map((m) => ({
              x: String(m.lng),
              y: String(m.lat),
            })),
            mode: routeMode,
            priority: cur.priority,
          }),
        });
      } else {
        res = await fetch("/api/kakao-waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { x: String(start.lng), y: String(start.lat) },
            destination: { x: String(end.lng), y: String(end.lat) },
            waypoints: validMids.map((m) => ({
              x: String(m.lng),
              y: String(m.lat),
            })),
            priority: cur.priority,
          }),
        });
      }
      const j = await res.json();
      if (!res.ok || !j.routes) throw new Error("경로 API 요청 실패");
      const stops = [
        { ...start, name: cur.startLocation },
        ...validMids,
        { ...end, name: cur.endLocation },
      ];
      const stays = Array.from(
        { length: stops.length },
        (_, i) => cur.stays?.[i] || 0
      );
      const timeline = recomputeTimelineWithStays({
        stops,
        sections: j.routes[0]?.sections || [],
        startTime: cur.startTime,
        stays,
      });
      const summary = {
        distance: j.routes[0].summary.distance / 1000,
        duration: Math.round(j.routes[0].summary.duration / 60),
      };
      updateCur({
        timeline,
        summary,
        lastRoutes: j.routes,
        stays,
        startCoords: start,
        endCoords: end,
        waypoints: validMids,
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateStay = (idx, minutes) => {
    const stays = [...cur.stays];
    stays[idx] = Math.max(0, parseInt(minutes) || 0);
    if (cur.lastRoutes) {
      const stops = [
        { ...cur.startCoords, name: cur.startLocation },
        ...(cur.waypoints || []),
        { ...cur.endCoords, name: cur.endLocation },
      ];
      const timeline = recomputeTimelineWithStays({
        stops,
        sections: cur.lastRoutes[0]?.sections || [],
        startTime: cur.startTime,
        stays,
      });
      updateCur({ stays, timeline });
    } else {
      updateCur({ stays });
    }
  };

  const addDay = () => {
    setDays((p) => [...p, makeEmptyDay(p.length)]);
    setActiveDay(days.length);
  };
  const removeDay = (idx) => {
    if (days.length <= 1) return;
    setDays((p) =>
      p
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, title: `${i + 1}일차` }))
    );
    setActiveDay((p) => Math.max(0, p - 1));
  };
  const duplicateDay = (idx) => {
    setDays((p) => [
      ...p,
      {
        ...p[idx],
        id: `day-${Date.now()}`,
        title: `${p.length + 1}일차`,
        timeline: [],
        summary: null,
        lastRoutes: null,
      },
    ]);
    setActiveDay(days.length);
  };
  const saveToBackend = async () => {
    /* ... (Same as before) ... */
  };

  const allStopsForReorder = useMemo(
    () => [
      {
        id: "start",
        name: cur.startLocation,
        type: "start",
        lat: cur.startCoords?.lat,
        lng: cur.startCoords?.lng,
      },
      ...(cur.waypoints || []).map((w, i) => ({
        id: `wp-${i}`,
        name: w.name,
        type: "wp",
        lat: w.lat,
        lng: w.lng,
      })),
      {
        id: "end",
        name: cur.endLocation,
        type: "end",
        lat: cur.endCoords?.lat,
        lng: cur.endCoords?.lng,
      },
    ],
    [
      cur.startLocation,
      cur.endLocation,
      cur.waypoints,
      cur.startCoords,
      cur.endCoords,
    ]
  );

  const handleReorder = (newOrder) => {
    if (newOrder.length < 2) return;
    const first = newOrder[0];
    const last = newOrder[newOrder.length - 1];
    const mids = newOrder.slice(1, -1);
    updateCur({
      startLocation: first?.name || "",
      startCoords:
        first?.lat && first?.lng ? { lat: first.lat, lng: first.lng } : null,
      endLocation: last?.name || "",
      endCoords:
        last?.lat && last?.lng ? { lat: last.lat, lng: last.lng } : null,
      waypoints: mids.map((m) => ({
        name: m?.name || "",
        lat: m?.lat,
        lng: m?.lng,
      })),
    });
  };

  const SegmentedControl = ({ value, options, onChange }) => (
    <div className="flex items-center gap-1 bg-slate-700/50 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative flex-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            value === opt.value
              ? "text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {value === opt.value && (
            <motion.div
              layoutId={`active-segment-${options[0].value}`}
              className="absolute inset-0 bg-slate-600 rounded-md"
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {opt.icon}
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-200 font-sans grid grid-cols-[450px_1fr] overflow-hidden">
      <aside className="p-4 flex flex-col gap-4 bg-slate-900/50 border-r border-slate-800 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-shrink-0"
        >
          <h1 className="text-xl font-bold text-white">경로 플래너</h1>
          <Button
            variant="outline"
            onClick={saveToBackend}
            className="bg-slate-700/50 border-slate-600 hover:bg-slate-700"
          >
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </motion.div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {days.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveDay(i)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeDay === i
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {d.title}
            </button>
          ))}
          <Button
            onClick={addDay}
            size="icon"
            variant="ghost"
            className="text-slate-400 hover:bg-slate-700 hover:text-indigo-400"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          <motion.div
            layout
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3"
          >
            <PlaceSearchInput
              dark
              value={cur.startLocation}
              onSelect={(p) =>
                updateCur({
                  startLocation: p.name,
                  startCoords: { lat: p.lat, lng: p.lng },
                })
              }
              placeholder="출발지"
            />
            <PlaceSearchInput
              dark
              value={cur.endLocation}
              onSelect={(p) =>
                updateCur({
                  endLocation: p.name,
                  endCoords: { lat: p.lat, lng: p.lng },
                })
              }
              placeholder="도착지"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSearchOpen(true)}
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-700"
              >
                <Search className="w-4 h-4 mr-2" />
                경유지 추가
              </Button>
              <Button
                onClick={calculateRoute}
                disabled={
                  isCalculating || !cur.startLocation || !cur.endLocation
                }
                className="w-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              >
                {isCalculating ? "계산 중..." : "경로 계산"}
              </Button>
            </div>
          </motion.div>

          <motion.div
            layout
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-4"
          >
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                지도/교통
              </label>
              <SegmentedControl
                value={mapProvider}
                onChange={setMapProvider}
                options={[
                  {
                    value: "KAKAO",
                    label: "카카오맵",
                    icon: <Map size={14} />,
                  },
                  { value: "TMAP", label: "TMAP", icon: <Map size={14} /> },
                ]}
              />
            </div>
            <div>
              <SegmentedControl
                value={routeMode}
                onChange={setRouteMode}
                options={[
                  { value: "CAR", label: "자동차", icon: <Car size={14} /> },
                  {
                    value: "PEDESTRIAN",
                    label: "도보",
                    icon: <PersonStanding size={14} />,
                  },
                  {
                    value: "TRANSIT",
                    label: "대중교통",
                    icon: <Train size={14} />,
                  },
                ]}
              />
            </div>
          </motion.div>

          <motion.div
            layout
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4"
          >
            <h3 className="text-sm font-semibold text-white mb-2">
              전체 경로 순서
            </h3>
            <Reorder.Group
              axis="y"
              values={allStopsForReorder}
              onReorder={handleReorder}
              className="space-y-2"
            >
              {allStopsForReorder.map((s) => (
                <Reorder.Item
                  key={s.id}
                  value={s}
                  className="p-2 rounded-lg bg-slate-700/50 flex items-center gap-2 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-slate-500" />
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      s.type === "start"
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                        : s.type === "end"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-slate-600/50 border-slate-500 text-slate-300"
                    }`}
                  >
                    {s.type === "start"
                      ? "출발"
                      : s.type === "end"
                      ? "도착"
                      : "경유"}
                  </span>
                  <span className="text-sm text-slate-200 truncate flex-1">
                    {s.name || "(미지정)"}
                  </span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>

          <motion.div
            layout
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4"
          >
            <h3 className="text-sm font-semibold text-white mb-2">타임라인</h3>
            {cur.summary && (
              <div className="text-xs text-slate-400 mb-3">
                총{" "}
                <span className="font-semibold text-indigo-400">
                  {cur.summary.distance.toFixed(1)}km
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-indigo-400">
                  {cur.summary.duration}분
                </span>
              </div>
            )}
            <ol className="space-y-2 text-sm">
              {(cur.timeline || []).map((s, idx) => (
                <li key={s.idx} className="p-2 rounded-lg bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-600 text-white grid place-items-center font-bold text-xs flex-shrink-0">
                      {s.idx}
                    </div>
                    <div className="font-semibold text-slate-100 truncate flex-1">
                      {s.name}
                    </div>
                  </div>
                  {s.idx > 1 && (
                    <div className="text-slate-400 text-xs mt-1.5 pl-9 flex items-center gap-3">
                      <span>
                        <Car size={12} className="inline mr-1" />
                        {s.km.toFixed(1)}km·{s.minutes}분
                      </span>
                      <span>
                        <Clock size={12} className="inline mr-1" />
                        {s.arrival} 도착
                      </span>
                    </div>
                  )}
                  <div className="pl-9 mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <label className="whitespace-nowrap">체류(분)</label>
                    <input
                      type="number"
                      min="0"
                      value={cur.stays?.[idx] ?? 0}
                      onChange={(e) => updateStay(idx, e.target.value)}
                      className="w-20 bg-slate-600/50 border border-slate-500 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </aside>

      <main className="p-4 relative">
        {mapProvider === "TMAP" && tmapReady ? (
          <div className="w-full h-full rounded-2xl border border-slate-700 overflow-hidden">
            <TMapContainer stops={tmapStops} path={tmapPath} />
          </div>
        ) : (
          <>
            {mapProvider === "TMAP" && !tmapReady && (
              <div className="absolute z-10 top-6 left-6 text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full border border-rose-500/30">
                TMap SDK 로딩 실패. 카카오맵으로 표시합니다.
              </div>
            )}
            <div
              ref={mapElRef}
              className="w-full h-full rounded-2xl border border-slate-700 bg-slate-800"
            />
          </>
        )}
      </main>

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
