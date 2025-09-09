import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import { Plus, Search, X, Save, Trash2, Copy, Calendar } from "lucide-react";
import "../styles/directions.css";
import DateRangeModal from "components/directions/DateRangeModal";
export default function DirectionsMyro() {
  const location = useLocation();
  const makeEmptyDay = (idx = 0) => ({
    id: `day-${idx + 1}`,
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
  const [dateOpen, setDateOpen] = useState(false);
  const [tripCity, setTripCity] = useState("서울");
  const [tripStart, setTripStart] = useState(null); // Date or null
  const [tripEnd, setTripEnd] = useState(null);
  const addDays = (d, n) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const koDow = (i) => ["일", "월", "화", "수", "목", "금", "토"][i] || "";
  const fmtDate = (d) =>
    !d
      ? ""
      : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}.${String(d.getDate()).padStart(2, "0")}(${koDow(d.getDay())})`;
  // Kakao Map
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const markerRefs = useRef([]);
  const panelRef = useRef(null);
  const dayRefs = useRef([]);
  useEffect(() => {
    const ensureKakao = () =>
      new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) return resolve();
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
  // Router preset
  useEffect(() => {
    try {
      const preset = location.state && location.state.presetCourse;
      if (preset && Array.isArray(preset.stops) && preset.stops.length >= 2) {
        setDays((prev) => {
          const next = [...prev];
          const d0 = { ...next[0] };
          d0.startLocation = preset.stops[0].name || "";
          d0.endLocation = preset.stops[preset.stops.length - 1].name || "";
          d0.waypoints = preset.stops
            .slice(1, -1)
            .map((s) => ({ name: s.name || "" }));
          next[0] = d0;
          return next;
        });
      }
    } catch {}
  }, [location.state]);
  // Load/save draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("routePlanDraft");
      if (raw) {
        const j = JSON.parse(raw);
        if (Array.isArray(j.days) && j.days.length) {
          setDays(j.days);
          setActiveDay(j.activeDay || 0);
        }
        if (j.tripStart) setTripStart(new Date(j.tripStart));
        if (j.tripEnd) setTripEnd(new Date(j.tripEnd));
        if (j.tripCity) setTripCity(j.tripCity);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "routePlanDraft",
        JSON.stringify({ days, activeDay, tripStart, tripEnd, tripCity })
      );
    } catch {}
  }, [days, activeDay, tripStart, tripEnd, tripCity]);
  const cur = days[activeDay] || makeEmptyDay(activeDay);
  const updateCur = (patch) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDay] = { ...next[activeDay], ...patch };
      return next;
    });
  };
  const scrollToDay = (i) => {
    setActiveDay(i);
    try {
      const el = dayRefs.current[i];
      const panel = panelRef.current;
      if (el && panel) {
        // ensure element is within the panel viewport
        el.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    } catch {}
  };
  const geocode = (name) =>
    new Promise((resolve, reject) => {
      if (!name) return reject(new Error("empty"));
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(name, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          resolve({
            lat: parseFloat(data[0].y),
            lng: parseFloat(data[0].x),
            name,
          });
        } else reject(new Error("not_found"));
      });
    });
  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
    markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
    markerRefs.current = [];
  };
  const drawPolylines = (routes) => {
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
  const recomputeTimelineWithStays = ({
    stops,
    sections,
    startTime,
    stays,
  }) => {
    const steps = [];
    const toMin = (hhmm) => {
      const [h, m] = String(hhmm || "0:0").split(":");
      return parseInt(h || 0, 10) * 60 + parseInt(m || 0, 10);
    };
    let acc = toMin(startTime || "09:00");
    const map = mapObjRef.current;
    if (map) {
      markerRefs.current.forEach((m) => m.setMap && m.setMap(null));
      markerRefs.current = [];
    }
    for (let i = 0; i < stops.length; i++) {
      const curS = stops[i];
      let km = 0,
        minutes = 0,
        roadName = "";
      if (i > 0 && sections && sections[i - 1] && sections[i - 1].summary) {
        const sec = sections[i - 1];
        km = (sec.summary.distance || 0) / 1000;
        minutes = Math.round((sec.summary.duration || 0) / 60);
        const r0 = (sec.roads || []).find((r) => r && (r.name || r.road_name));
        roadName = (r0 && (r0.name || r0.road_name)) || "";
      }
      if (i > 0) acc += minutes;
      const hh = String(Math.floor(acc / 60)).padStart(2, "0");
      const mm = String(acc % 60).padStart(2, "0");
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
      acc += i < stops.length - 1 ? stay : 0;
    }
    return steps;
  };
  const calculateRoute = async (dayIndex = activeDay) => {
    const d = days[dayIndex];
    if (!d || !d.startLocation || !d.endLocation) return;
    setIsCalculating(true);
    try {
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
        if (w && typeof w.lat === "number" && typeof w.lng === "number")
          mids.push({ name: w.name, lat: w.lat, lng: w.lng });
        else if (w && w.name) {
          try {
            mids.push(await geocode(w.name));
          } catch {}
        }
      }
      const payload = {
        origin: { x: String(start.lng), y: String(start.lat) },
        destination: { x: String(end.lng), y: String(end.lat) },
        waypoints: mids.map((m) => ({ x: String(m.lng), y: String(m.lat) })),
        priority: d.priority || "RECOMMEND",
      };
      const r = await fetch("/api/kakao-waypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || !j.routes) {
        alert("경로 요청 실패");
        return;
      }
      const route = (j.routes && j.routes[0]) || null;
      drawPolylines(j.routes);
      const stops = [start, ...mids, end];
      const sections =
        route && Array.isArray(route.sections) ? route.sections : [];
      const stays = Array.isArray(d.stays) ? [...d.stays] : [];
      while (stays.length < stops.length) stays.push(0);
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
      setDays((prev) => {
        const next = [...prev];
        next[dayIndex] = {
          ...next[dayIndex],
          timeline: steps,
          summary: { distance: totalKm, duration: totalMin },
          lastRoutes: j.routes,
          stays,
          startCoords: { lat: start.lat, lng: start.lng },
          endCoords: { lat: end.lat, lng: end.lng },
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
        .map((d, i2) => ({
          ...d,
          id: `day-${i2 + 1}`,
          title: `${i2 + 1}일차`,
        }));
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
      if (r.ok && j.id) setShareInfo({ id: j.id, shareUrl: j.shareUrl });
      else alert("백엔드 저장 실패");
    } catch (e) {
      console.error(e);
      alert("백엔드 오류");
    }
  };
  return (
    <div className="directions-wrapper">
      {/* Left rail */}
      <aside className="directions-leftbar">
        <div className="directions-actionbar">
          <button className="leftbar-primary">전체일정</button>
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
        <div className="day-nav">
          {days.map((d, i) => (
            <button
              key={d.id}
              className={`day-nav-btn ${i === activeDay ? "active" : ""}`}
              onClick={() => scrollToDay(i)}
            >
              {i + 1}일차
            </button>
          ))}
        </div>
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
      {/* Middle panel */}
      <main className="directions-panel" ref={panelRef}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="font-extrabold text-lg text-slate-800">
              {tripCity}
            </div>
            <button
              className="text-slate-600 text-sm inline-flex items-center gap-1 border rounded-full px-3 py-1 hover:bg-slate-50"
              onClick={() => setDateOpen(true)}
            >
              <Calendar className="w-4 h-4" />
              {tripStart && tripEnd
                ? `${tripStart.getFullYear()}.${String(
                    tripStart.getMonth() + 1
                  ).padStart(2, "0")}.${String(tripStart.getDate()).padStart(
                    2,
                    "0"
                  )} - ${tripEnd.getFullYear()}.${String(
                    tripEnd.getMonth() + 1
                  ).padStart(2, "0")}.${String(tripEnd.getDate()).padStart(
                    2,
                    "0"
                  )}`
                : "여행 기간 선택"}
            </button>
          </div>
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
        <div className="day-columns">
          {days.map((d, i) => (
            <div key={d.id} ref={(el) => (dayRefs.current[i] = el)}>
              <Card
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
                    {tripStart && (
                      <span className="text-slate-500 text-xs ml-1">
                        {fmtDate(addDays(tripStart, i))}
                      </span>
                    )}
                    <span className="text-slate-500 text-xs mr-1">시작</span>
                    <input
                      type="time"
                      value={d.startTime}
                      onChange={(e) =>
                        setDays((prev) => {
                          const next = [...prev];
                          next[i] = { ...next[i], startTime: e.target.value };
                          return next;
                        })
                      }
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
                      약 {d.summary?.distance?.toFixed?.(1) || 0} km ·{" "}
                      {d.summary?.duration || 0} 분
                    </div>
                  )}
                  <ol className="space-y-2 text-sm">
                    {(d.timeline || []).map((s, idx) => (
                      <React.Fragment key={`${d.id}-${s.idx}-${idx}`}>
                        {s.idx > 1 && (
                          <div className="travel-chip">
                            이동 시간 {s.minutes}분
                          </div>
                        )}
                        <li className="p-2 rounded-xl border bg-white flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full ${
                              [
                                "bg-red-500",
                                "bg-amber-500",
                                "bg-violet-500",
                                "bg-sky-600",
                              ][i % 4]
                            } text-white grid place-items-center font-bold text-[11px]`}
                          >
                            {s.idx}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {s.name}
                            </div>
                            <div className="text-slate-500 text-xs">
                              도착 {s.arrival}
                              {typeof s.km === "number"
                                ? ` · 약 ${s.km.toFixed(1)} km`
                                : ""}
                              {s.minutes ? ` · ${s.minutes} 분` : ""}
                              {s.roadName ? ` · ${s.roadName}` : ""}
                            </div>
                          </div>
                          {i === activeDay && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <label className="whitespace-nowrap">
                                체류(분)
                              </label>
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
                      </React.Fragment>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
      {/* Map */}
      <section className="directions-mapbox p-4">
        <div ref={mapElRef} className="w-full h-full rounded-2xl border" />
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
                value=""
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
                목록에서 항목을 선택하면 경유지에 추가됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Date range modal */}
      <DateRangeModal
        open={dateOpen}
        start={tripStart}
        end={tripEnd}
        onClose={() => setDateOpen(false)}
        onApply={(s, e) => {
          setTripStart(s);
          setTripEnd(e);
          setDateOpen(false);
          // Adjust days count to match range length
          try {
            const msPerDay = 24 * 60 * 60 * 1000;
            const len = Math.min(
              10,
              Math.floor(
                (e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0)) / msPerDay
              ) + 1
            );
            setDays((prev) => {
              let next = [...prev];
              if (len > next.length) {
                for (let i = next.length; i < len; i++)
                  next.push(makeEmptyDay(i));
              } else if (len < next.length) {
                next = next.slice(0, len);
              }
              // label update
              for (let i = 0; i < next.length; i++) {
                next[i] = { ...next[i], title: `${i + 1}일차` };
              }
              return next;
            });
          } catch {}
        }}
      />
    </div>
  );
}
