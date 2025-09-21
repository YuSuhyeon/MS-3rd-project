import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

export default function DirectionsMantine() {
  const location = useLocation();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState([]); // [{name}]
  const [isCalculating, setIsCalculating] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null); // { distance, duration }

  // kakao map refs
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const lastRoutesRef = useRef(null);
  const lastStopsRef = useRef([]); // [{name,lat,lng}]
  const [activeRouteIdx, setActiveRouteIdx] = useState(-1);
  const [routeLegend, setRouteLegend] = useState([]);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const ROUTE_COLORS = ["#2563eb", "#7c3aed", "#059669"];

  // load kakao maps
  useEffect(() => {
    const ensureKakao = () =>
      new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(resolve);
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

  // preset from router state
  useEffect(() => {
    try {
      let preset = (location.state && location.state.presetCourse) || null;
      if (preset && Array.isArray(preset.stops) && preset.stops.length >= 2) {
        setStartLocation(preset.stops[0].name || "");
        setEndLocation(preset.stops[preset.stops.length - 1].name || "");
        setWaypoints(
          preset.stops.slice(1, -1).map((s) => ({ name: s.name || "" }))
        );
      }
    } catch {}
  }, [location.state]);

  // helpers
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

  const geocode = (name, opts = {}) =>
    new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error("empty"));
        return;
      }
      const ps = new window.kakao.maps.services.Places();
      const options = {};
      if (opts.center && opts.center.lat && opts.center.lng) {
        options.location = new window.kakao.maps.LatLng(
          opts.center.lat,
          opts.center.lng
        );
        if (typeof opts.radius === "number") options.radius = opts.radius;
      }
      ps.keywordSearch(
        name,
        (data, status) => {
          if (status === window.kakao.maps.services.Status.OK && data[0]) {
            resolve({
              lat: parseFloat(data[0].y),
              lng: parseFloat(data[0].x),
              name: data[0].place_name || name,
            });
          } else {
            reject(new Error("not_found"));
          }
        },
        options
      );
    });

  const clearMap = () => {
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
  };

  const buildPathFromRoute = (route) => {
    const path = [];
    // Prefer Kakao vertexes
    (route?.sections || []).forEach((sec) => {
      const roads = sec?.roads || [];
      roads.forEach((r) => {
        const v = r?.vertexes || [];
        for (let i = 0; i < v.length; i += 2) {
          const lat = v[i + 1];
          const lng = v[i];
          if (typeof lat === "number" && typeof lng === "number")
            path.push(new window.kakao.maps.LatLng(lat, lng));
        }
      });
    });
    if (path.length) return path;
    // Fallback: sections.path ([[x,y], ...]) e.g., from Naver backend
    (route?.sections || []).forEach((sec) => {
      const sp = sec?.path || [];
      for (let i = 0; i < sp.length; i++) {
        const item = sp[i];
        if (
          Array.isArray(item) &&
          item.length >= 2 &&
          typeof item[0] === "number" &&
          typeof item[1] === "number"
        ) {
          const lng = item[0];
          const lat = item[1];
          path.push(new window.kakao.maps.LatLng(lat, lng));
        }
      }
    });
    if (path.length) return path;
    // Last-resort: straight lines between known stops
    const stops = lastStopsRef.current || [];
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (
        a &&
        b &&
        typeof a.lat === "number" &&
        typeof a.lng === "number" &&
        typeof b.lat === "number" &&
        typeof b.lng === "number"
      ) {
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
    const colors = ROUTE_COLORS;
    const bounds = new window.kakao.maps.LatLngBounds();
    const list = (routes || []).slice(0, 3);
    list.forEach((route, idx) => {
      const path = buildPathFromRoute(route);
      if (!path || !path.length) return;
      const isActive =
        activeRouteIdx === -1 ? idx === 0 : idx === activeRouteIdx;
      if (showOnlyActive && !isActive) return;
      const poly = new window.kakao.maps.Polyline({
        path,
        strokeWeight: isActive ? 5 : 3,
        strokeColor: colors[idx % colors.length],
        strokeOpacity: isActive ? 1.0 : 0.6,
        strokeStyle: "solid",
      });
      poly.setMap(map);
      window.kakao.maps.event.addListener(poly, "click", () => {
        setActiveRouteIdx(idx);
        if (lastRoutesRef.current) drawPolylines(lastRoutesRef.current);
      });
      polyRefs.current.push(poly);
      path.forEach((ll) => bounds.extend(ll));
    });
    if (!bounds.isEmpty()) map.setBounds(bounds);
  };

  const tryNaverFallback = async (stops) => {
    try {
      const payload = {
        origin: { x: String(stops[0].lng), y: String(stops[0].lat) },
        destination: {
          x: String(stops[stops.length - 1].lng),
          y: String(stops[stops.length - 1].lat),
        },
        waypoints: stops
          .slice(1, -1)
          .map((m) => ({ x: String(m.lng), y: String(m.lat) })),
      };
      const r = await fetch("/api/naver/walking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok && j?.routes?.length) return j.routes;
    } catch (e) {
      console.warn("naver fallback failed", e);
    }
    return null;
  };

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) return;
    setIsCalculating(true);
    try {
      // 1) Geocode all
      const start = await geocode(startLocation);
      const end = await geocode(endLocation);
      const mids = [];
      for (const w of waypoints) {
        if (!w?.name) continue;
        try {
          const p = await geocode(w.name);
          mids.push(p);
        } catch {}
      }
      const stops = [start, ...mids, end];
      lastStopsRef.current = stops;

      // 2) Call Kakao multi-route
      const payload = {
        origin: { x: String(start.lng), y: String(start.lat) },
        destination: { x: String(end.lng), y: String(end.lat) },
        waypoints: mids
          .slice(0, 10)
          .map((m) => ({ x: String(m.lng), y: String(m.lat) })),
        priority: "RECOMMEND",
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

      // 3) Legend (unified style)
      const legend = (j.routes || []).slice(0, 3).map((rt, idx) => {
        const p = rt?.__priority;
        const base =
          p === "DISTANCE" ? "최단거리" : p === "FAST" ? "빠른길" : "추천";
        const km =
          rt?.summary && typeof rt.summary.distance === "number"
            ? rt.summary.distance / 1000
            : 0;
        const min =
          rt?.summary && typeof rt.summary.duration === "number"
            ? Math.round(rt.summary.duration / 60)
            : 0;
        const label = base + (km ? ` · ${km.toFixed(1)}km · ${min}분` : "");
        return { color: ROUTE_COLORS[idx % ROUTE_COLORS.length], label };
      });
      setRouteLegend(legend);
      lastRoutesRef.current = j.routes;
      setActiveRouteIdx(-1);

      // 4) If any of the first 3 routes has empty path, try fallbacks
      const anyEmpty = (j.routes || [])
        .slice(0, 3)
        .some((rt) => (buildPathFromRoute(rt) || []).length === 0);
      if (anyEmpty) {
        // 4-1) Re-geocode with region bias (average center)
        let center = null;
        try {
          const all = stops.filter(
            (s) => typeof s.lat === "number" && typeof s.lng === "number"
          );
          if (all.length) {
            const avg = all.reduce(
              (acc, s) => ({ lat: acc.lat + s.lat, lng: acc.lng + s.lng }),
              { lat: 0, lng: 0 }
            );
            center = { lat: avg.lat / all.length, lng: avg.lng / all.length };
          }
        } catch {}
        if (center) {
          try {
            const s2 = await geocode(startLocation, { center, radius: 20000 });
            const e2 = await geocode(endLocation, { center, radius: 20000 });
            const m2 = [];
            for (const w of waypoints) {
              if (!w?.name) continue;
              try {
                m2.push(await geocode(w.name, { center, radius: 20000 }));
              } catch {}
            }
            lastStopsRef.current = [s2, ...m2, e2];
            const payload2 = {
              origin: { x: String(s2.lng), y: String(s2.lat) },
              destination: { x: String(e2.lng), y: String(e2.lat) },
              waypoints: m2
                .slice(0, 10)
                .map((m) => ({ x: String(m.lng), y: String(m.lat) })),
              priority: "RECOMMEND",
              multi: true,
            };
            const r2 = await fetch("/api/kakao-waypoints", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload2),
            });
            const j2 = await r2.json();
            if (r2.ok && j2?.routes?.length) {
              lastRoutesRef.current = j2.routes;
            }
          } catch (e) {
            console.warn("re-geocode retry failed", e);
          }
        }
        // 4-2) If still empty, call Naver walking fallback
        const stillEmpty = (lastRoutesRef.current || [])
          .slice(0, 3)
          .every((rt) => (buildPathFromRoute(rt) || []).length === 0);
        if (stillEmpty) {
          const naverRoutes = await tryNaverFallback(lastStopsRef.current);
          if (naverRoutes && naverRoutes.length) {
            lastRoutesRef.current = naverRoutes;
          }
        }
      }

      // 5) Draw and build timeline
      const routesToUse = lastRoutesRef.current || j.routes;
      drawPolylines(routesToUse);

      const route0 = routesToUse?.[0] || null;
      const sections = Array.isArray(route0?.sections) ? route0.sections : [];
      const steps = [];
      for (let i = 0; i < lastStopsRef.current.length; i++) {
        const cur = lastStopsRef.current[i];
        let km = 0,
          minutes = 0;
        if (i > 0 && sections[i - 1]?.summary) {
          const dist = sections[i - 1].summary.distance || 0;
          const dur = sections[i - 1].summary.duration || 0;
          km = dist / 1000;
          minutes = Math.round(dur / 60);
        } else if (i > 0) {
          // estimate from straight line
          const prev = lastStopsRef.current[i - 1];
          if (prev && cur) {
            const kmEst = haversine(prev, cur);
            km = kmEst;
            minutes = Math.round((kmEst / 4.5) * 60);
          }
        }
        steps.push({ idx: i + 1, name: cur.name, km, minutes });
      }
      setTimeline(steps);
      const totalKm = route0?.summary?.distance
        ? route0.summary.distance / 1000
        : steps.reduce((s, x) => s + (x.idx > 1 ? x.km : 0), 0);
      const totalMin = route0?.summary?.duration
        ? Math.round(route0.summary.duration / 60)
        : steps.reduce((s, x) => s + (x.idx > 1 ? x.minutes : 0), 0);
      setSummary({ distance: totalKm, duration: totalMin });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>경로 탐색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-slate-500 mb-1">출발지</div>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="예) 서울역"
                />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">도착지</div>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="예) 남산타워"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={calculateRoute}
                  disabled={isCalculating || !startLocation || !endLocation}
                  className="bg-indigo-600 text-white w-full"
                >
                  {isCalculating ? "계산 중..." : "경로 계산"}
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">경유지</div>
              <div className="space-y-2">
                {waypoints.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="flex-1 border rounded px-3 py-2"
                      value={w.name}
                      onChange={(e) => {
                        const next = [...waypoints];
                        next[i] = { ...next[i], name: e.target.value };
                        setWaypoints(next);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setWaypoints(waypoints.filter((_, idx) => idx !== i))
                      }
                    >
                      삭제
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setWaypoints([...waypoints, { name: "" }])}
                >
                  경유지 추가
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-4 pt-2">
              <div className="relative w-full h-80 lg:col-span-3">
                {routeLegend && routeLegend.length > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur rounded-lg border shadow px-3 py-2 text-xs text-slate-700">
                    <div className="font-semibold mb-1">경로 우선순위</div>
                    <div className="flex gap-3 items-center">
                      {routeLegend.map((it, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveRouteIdx(idx);
                            if (lastRoutesRef.current)
                              drawPolylines(lastRoutesRef.current);
                          }}
                          className={`flex items-center gap-1 ${
                            activeRouteIdx === idx ? "font-semibold" : ""
                          }`}
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
                          onChange={(e) => {
                            setShowOnlyActive(e.target.checked);
                            if (lastRoutesRef.current)
                              drawPolylines(lastRoutesRef.current);
                          }}
                        />
                        <span>선택 경로만 표시</span>
                      </label>
                    </div>
                  </div>
                )}
                <div
                  ref={mapElRef}
                  className="w-full h-full rounded-2xl border"
                />
              </div>

              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>이동 타임라인</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summary && (
                      <div className="text-sm text-slate-600 mb-2">
                        총 {summary.distance?.toFixed?.(1) || 0} km ·{" "}
                        {summary.duration || 0} 분
                      </div>
                    )}
                    <ol className="space-y-2 text-sm">
                      {timeline.map((s) => (
                        <li
                          key={s.idx}
                          className="p-2 rounded-xl border bg-white flex items-start gap-3"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center font-bold text-slate-700">
                            {s.idx}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {s.name}
                            </div>
                            {s.idx > 1 && (
                              <div className="text-slate-500">
                                약 {s.km.toFixed(1)} km · {s.minutes} 분
                              </div>
                            )}
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
    </div>
  );
}
