import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, Group, Title, Button, Box, Stack, Paper, Text, ScrollArea, Alert, Divider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import PlaceSearchInput from "./components/directions/PlaceSearchInput";
import { createKakaoMap } from "./kakaoMap";

const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_API_KEY || process.env.REACT_APP_KAKAOMAP_JS_KEY;

export default function NaverDirections() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [origin, setOrigin] = useState(null); // {name,lat,lng}
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]); // [{id,name,lat,lng}]
  const [mode, setMode] = useState("WALK"); // WALK | TRANSIT | CAR
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null); // {distance, duration, fare?}
  const [routePath, setRoutePath] = useState(null); // [{lat,lng}, ...]

  const mapRef = useRef(null);
  const overlaysRef = useRef({ markers: [], polyline: null });

  // Init Kakao map
  useEffect(() => {
    if (!KAKAO_JS_KEY) return;
    const id = "naver-dir-map";
    const container = document.createElement("div");
    container.id = id;
    container.style.width = "100%";
    container.style.height = "100%";
    const holder = document.getElementById("naver-dir-holder");
    if (holder && holder.childElementCount === 0) holder.appendChild(container);
    createKakaoMap({
      containerId: id,
      KAKAO_JS_KEY,
      center: { lat: 37.5665, lng: 126.978 },
      level: 5,
      onMapReady: (map) => {
        mapRef.current = map;
      },
    });
    return () => {
      overlaysRef.current.markers.forEach((m) => m.setMap && m.setMap(null));
      overlaysRef.current.markers = [];
      overlaysRef.current.polyline?.setMap(null);
      overlaysRef.current.polyline = null;
    };
  }, []);

  // Update markers and fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;
    overlaysRef.current.markers.forEach((m) => m.setMap && m.setMap(null));
    overlaysRef.current.markers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    const add = (p, color = "#2563eb") => {
      if (!p) return;
      const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
      const marker = new window.kakao.maps.Marker({ position: pos });
      marker.setMap(map);
      overlaysRef.current.markers.push(marker);
      bounds.extend(pos);
    };

    add(origin, "#16a34a");
    waypoints.forEach((w) => add(w, "#7c3aed"));
    add(destination, "#ef4444");
    if (!bounds.isEmpty() && !routePath) map.setBounds(bounds);
  }, [origin, destination, waypoints, routePath]);

  // Draw polyline when routePath changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;
    overlaysRef.current.polyline?.setMap(null);
    if (routePath && routePath.length) {
      const linePath = routePath.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng));
      const poly = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 6,
        strokeColor: mode === "WALK" ? "#198754" : "#0ea5e9",
        strokeOpacity: 0.85,
        strokeStyle: mode === "WALK" ? "shortdash" : "solid",
      });
      poly.setMap(map);
      overlaysRef.current.polyline = poly;
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      map.setBounds(bounds);
    }
  }, [routePath, mode]);

  const toNaverPayload = useCallback(() => {
    if (!origin || !destination) return null;
    const originXY = { x: String(origin.lng), y: String(origin.lat) };
    const destXY = { x: String(destination.lng), y: String(destination.lat) };
    const wps = waypoints.map((w) => ({ x: String(w.lng), y: String(w.lat) }));
    return { origin: originXY, destination: destXY, waypoints: wps };
  }, [origin, destination, waypoints]);

  const handleFindRoute = useCallback(async () => {
    if (!origin || !destination) {
      setError("출발지와 도착지를 모두 설정해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "CAR") {
        // Keep Kakao for CAR for now
        const payload = {
          origin: { x: String(origin.lng), y: String(origin.lat) },
          destination: { x: String(destination.lng), y: String(destination.lat) },
          waypoints: waypoints.map((w) => ({ x: String(w.lng), y: String(w.lat) })),
          priority: "RECOMMEND",
        };
        const r = await fetch("/api/kakao-waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await r.json();
        if (!r.ok || !j.routes || !j.routes[0]) throw new Error(j.result_msg || "경로 검색 실패");
        const route = j.routes[0];
        const path = [];
        (route.sections || []).forEach((s) => (s.roads || []).forEach((rd) => {
          const v = rd.vertexes || [];
          for (let i = 0; i < v.length; i += 2) path.push({ lat: v[i + 1], lng: v[i] });
        }));
        setRoutePath(path);
        setSummary(route.summary || null);
        return;
      }

      const base = toNaverPayload();
      const url = mode === "WALK" ? "/api/naver/walking" : "/api/naver/transit";
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(base) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Naver API 오류");
      const route = j?.routes?.[0];
      if (!route) throw new Error("유효한 경로가 없습니다.");
      const flat = [];
      (route.sections || []).forEach((sec) => {
        const p = sec.path || [];
        for (let i = 0; i < p.length; i++) {
          const [x, y] = p[i];
          flat.push({ lat: y, lng: x });
        }
      });
      if (!flat.length) throw new Error("경로 좌표가 비어 있습니다.");
      setRoutePath(flat);
      setSummary(route.summary || null);
    } catch (e) {
      // Fallback: straight lines + estimated duration
      try {
        const pts = [origin, ...waypoints, destination];
        const dist = (a, b) => {
          const R = 6371, toRad = (d) => (d * Math.PI) / 180;
          const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
          const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
          return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
        };
        const path = pts.map((p) => ({ lat: p.lat, lng: p.lng }));
        let totalKm = 0;
        for (let i = 0; i < pts.length - 1; i++) totalKm += dist(pts[i], pts[i + 1]);
        const speed = mode === "WALK" ? 4.5 : 25; // km/h
        setRoutePath(path);
        setSummary({ distance: Math.round(totalKm * 1000), duration: Math.round((totalKm / speed) * 3600) });
        setError(`API 오류로 단순 경로를 표시했습니다: ${e.message}`);
      } catch (ee) {
        setError(e.message || "경로 계산 실패");
      }
    } finally {
      setLoading(false);
    }
  }, [origin, destination, waypoints, mode, toNaverPayload]);

  const clearAll = () => {
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setRoutePath(null);
    setSummary(null);
    setError("");
  };

  return (
    <Group align="flex-start" gap="lg" wrap={isMobile ? "wrap" : "nowrap"}>
      <Box id="naver-dir-holder" style={{ height: isMobile ? 420 : "calc(100vh - 40px)", flex: 1, minWidth: 0, borderRadius: 12, background: "#f6f7fb", position: "relative" }} />
      <Box style={{ width: isMobile ? "100%" : 420, height: isMobile ? "auto" : "calc(100vh - 40px)" }}>
        <ScrollArea style={{ height: "100%" }} p="xs">
          <Stack>
            {error && (
              <Alert color="red" title="알림" withCloseButton onClose={() => setError("")} my="sm">{error}</Alert>
            )}

            <Card withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={4}>길찾기</Title>
                <Button variant="subtle" size="xs" onClick={clearAll} disabled={!origin && !destination && waypoints.length === 0}>경로 초기화</Button>
              </Group>
              <Stack>
                <PlaceSearchInput
                  label="출발지"
                  placeholder="장소, 주소 검색"
                  value={origin?.name || ""}
                  onChange={()=>{}}
                  onSelect={(p)=> setOrigin({ name: p.name, lat: p.lat, lng: p.lng })}
                  className=""
                />
                <PlaceSearchInput
                  label="경유지 추가"
                  placeholder="경유지 검색 후 선택"
                  value={""}
                  onChange={()=>{}}
                  onSelect={(p)=> setWaypoints((wps)=> [...wps, { id: `wp-${Date.now()}`, name: p.name, lat: p.lat, lng: p.lng }])}
                />
                {waypoints.length > 0 && (
                  <Stack gap="xs">
                    {waypoints.map((wp, i)=> (
                      <Paper key={wp.id} withBorder p="xs" radius="sm">
                        <Group justify="space-between">
                          <Text size="sm"><b>{i+1}.</b> {wp.name}</Text>
                          <Button size="xs" variant="subtle" onClick={()=> setWaypoints((arr)=> arr.filter((w)=> w.id!==wp.id))}>삭제</Button>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
                <PlaceSearchInput
                  label="도착지"
                  placeholder="장소, 주소 검색"
                  value={destination?.name || ""}
                  onChange={()=>{}}
                  onSelect={(p)=> setDestination({ name: p.name, lat: p.lat, lng: p.lng })}
                />
              </Stack>
            </Card>

            <Card withBorder p="md" radius="md">
              <Title order={5} mb="sm">검색 옵션</Title>
              <Group grow>
                <Button variant={mode === "WALK" ? "filled" : "light"} onClick={()=> setMode("WALK")}>도보</Button>
                <Button variant={mode === "TRANSIT" ? "filled" : "light"} onClick={()=> setMode("TRANSIT")}>대중교통</Button>
                <Button variant={mode === "CAR" ? "filled" : "light"} onClick={()=> setMode("CAR")}>자동차</Button>
              </Group>
              {summary && (
                <Stack mt="md" gap="xs">
                  <Divider label="경로 요약" labelPosition="center" />
                  <Group justify="space-between"><Text>예상 시간:</Text><Text fw={700}>{summary.duration ? prettyTime(summary.duration) : "-"}</Text></Group>
                  <Group justify="space-between"><Text>총 거리:</Text><Text fw={700}>{summary.distance ? prettyMeters(summary.distance) : "-"}</Text></Group>
                  {summary.fare && (
                    <Group justify="space-between"><Text>예상 비용:</Text><Text fw={700}>{typeof summary.fare === "number" ? summary.fare.toLocaleString() : summary.fare?.total?.toLocaleString?.() || "-"}</Text></Group>
                  )}
                </Stack>
              )}
              <Button onClick={handleFindRoute} mt="lg" fullWidth loading={loading} disabled={!origin || !destination}>
                경로 검색하기
              </Button>
            </Card>
          </Stack>
        </ScrollArea>
      </Box>
    </Group>
  );
}

function prettyTime(sec){
  if (!sec && sec !== 0) return "-";
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
  return h>0 ? `${h}시간 ${m}분` : `${m}분`;
}
function prettyMeters(m){
  const v = Number(m)||0; return v>=1000 ? `${(v/1000).toFixed(1)} km` : `${Math.round(v)} m`;
}

