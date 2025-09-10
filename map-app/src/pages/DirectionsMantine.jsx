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

  useEffect(() => {
    try {
      const preset = location.state && location.state.presetCourse;
      if (preset && Array.isArray(preset.stops) && preset.stops.length >= 2) {
        setStartLocation(preset.stops[0].name || "");
        setEndLocation(preset.stops[preset.stops.length - 1].name || "");
        setWaypoints(
          preset.stops.slice(1, -1).map((s) => ({ name: s.name || "" }))
        );
      }
    } catch {}
  }, [location.state]);

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
          resolve({
            lat: parseFloat(data[0].y),
            lng: parseFloat(data[0].x),
            name,
          });
        } else {
          reject(new Error("not_found"));
        }
      });
    });

  const drawPolylines = (routes) => {
    const map = mapObjRef.current;
    if (!map) return;
    // clear
    polyRefs.current.forEach((p) => p.setMap(null));
    polyRefs.current = [];
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

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) return;
    setIsCalculating(true);
    try {
      // geocode all
      const start = await geocode(startLocation);
      const end = await geocode(endLocation);
      const mids = [];
      for (const w of waypoints) {
        try {
          const p = await geocode(w.name);
          mids.push(p);
        } catch {}
      }

      const payload = {
        origin: { x: String(start.lng), y: String(start.lat) },
        destination: { x: String(end.lng), y: String(end.lat) },
        waypoints: mids.map((m) => ({ x: String(m.lng), y: String(m.lat) })),
        priority: "RECOMMEND",
      };
      const r = await fetch("/api/kakao-waypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || !j.routes) {
        alert("��� ��� ����");
        return;
      }
      drawPolylines(j.routes);

      // Build timeline (�̸� ����)
      const stops = [start, ...mids, end];
      const steps = [];
      for (let i = 0; i < stops.length; i++) {
        const cur = stops[i];
        const prev = i > 0 ? stops[i - 1] : null;
        let km = 0,
          minutes = 0;
        if (prev) {
          km = haversine(prev, cur);
          minutes = Math.round((km / 20) * 60);
        }
        steps.push({
          idx: i + 1,
          name: cur.name,
          approx_km: km,
          approx_min: minutes,
        });
      }
      setTimeline(steps);
      const totalKm = steps.reduce(
        (s, x) => s + (x.idx > 1 ? x.approx_km : 0),
        0
      );
      const totalMin = steps.reduce(
        (s, x) => s + (x.idx > 1 ? x.approx_min : 0),
        0
      );
      setSummary({ distance: totalKm, duration: totalMin });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>��� ����</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-slate-500 mb-1">���</div>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="��: ��õ��������"
                />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">����</div>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="��: ������������"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={calculateRoute}
                  disabled={isCalculating || !startLocation || !endLocation}
                  className="bg-indigo-600 text-white w-full"
                >
                  {isCalculating ? "��� ��..." : "��� ���"}
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">������</div>
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
                      ����
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setWaypoints([...waypoints, { name: "" }])}
                >
                  ������ �߰�
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-4 pt-2">
              <div className="lg:col-span-3">
                <div
                  ref={mapElRef}
                  className="w-full h-80 rounded-2xl border"
                />
              </div>
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>�̵� Ÿ�Ӷ���</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summary && (
                      <div className="text-sm text-slate-600 mb-2">
                        �� {summary.distance.toFixed(1)} km ��{" "}
                        {summary.duration} ��
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
                                �� {s.approx_km.toFixed(1)} km �� {s.approx_min}{" "}
                                ��
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
