import React, { useState, useEffect, useRef } from "react";
import { Route } from "Entities/Route";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Navigation } from "lucide-react";
import { motion } from "framer-motion";

import MapContainer from "components/directions/MapContainer";
import WaypointList from "components/directions/WaypointList";
import RecentRoutes from "components/directions/RecentRoutes";

export default function DirectionsMantine() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [lodging, setLodging] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState([]);

  // Place picker modal
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeTarget, setPlaceTarget] = useState(null); // 'start' | 'end' | 'wp' | 'lodging'
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const categories = ['전체','관광지','레포츠','문화시설','쇼핑','숙박','음식점','행사_공연_축제'];
  const [placeCategory, setPlaceCategory] = useState('전체');

  // Stepper (MYRO-like) skeleton
  const [currentStep, setCurrentStep] = useState(1); // 1: 날짜, 2: 장소, 3: 숙소
  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const saved = localStorage.getItem('recentRoutes');
    if (saved) setRecentRoutes(JSON.parse(saved));
  }, []);

  const saveRouteToRecent = (info) => {
    const newRoute = {
      id: Date.now(),
      name: `${info.start} → ${info.end}`,
      start: info.start,
      end: info.end,
      waypoints: info.waypoints,
      timestamp: new Date().toISOString()
    };
    const updated = [newRoute, ...recentRoutes.filter(r => r.name !== newRoute.name)].slice(0, 5);
    setRecentRoutes(updated);
    localStorage.setItem('recentRoutes', JSON.stringify(updated));
  };

  const addWaypoint = () => {
    if (waypoints.length < 5) setWaypoints([...waypoints, { id: Date.now(), location: "" }]);
  };

  // simple seoul-data search
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!placeOpen) return;
      try {
        const url = placeQuery ? `/api/seoul-data?q=${encodeURIComponent(placeQuery)}` : '/api/seoul-data';
        const r = await fetch(url);
        const j = await r.json();
        setPlaceResults(j.items || []);
      } catch (e) {
        setPlaceResults([]);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [placeQuery, placeOpen]);
  const removeWaypoint = (id) => setWaypoints(waypoints.filter(wp => wp.id !== id));
  const updateWaypoint = (id, location) => setWaypoints(waypoints.map(wp => wp.id === id ? { ...wp, location } : wp));

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) return;
    // Business rules validation
    const isAirport = (name) => /(공항|인천국제공항|김포국제공항|airport)/i.test(String(name||''));
    if (!isAirport(startLocation)) { alert('규칙: 첫 날 출발지는 공항이어야 합니다. (예: 인천국제공항)'); return; }
    if (!isAirport(endLocation)) { alert('규칙: 마지막 날 도착지는 공항이어야 합니다. (예: 김포국제공항)'); return; }
    const allNames = [startLocation, ...waypoints.map(w=>w.location), endLocation, lodging].filter(Boolean).join(' ');
    const hasRestaurant = /(맛집|식당|카페|restaurant|food)/i.test(allNames);
    if (!hasRestaurant) { alert('규칙: 일일 일정에는 최소 1개의 식당이 포함되어야 합니다.'); return; }
    setIsCalculating(true);
    try {
      const mockRouteData = { distance: 25.6, duration: 45, coordinates: [] };
      setRouteData(mockRouteData);
      saveRouteToRecent({ start: startLocation, end: endLocation, waypoints: waypoints.map(w => w.location).filter(Boolean).concat(lodging?['[숙소] '+lodging]:[]) });
      await Route.create({
        route_name: `${startLocation} → ${endLocation}`,
        start_location: { name: startLocation },
        end_location: { name: endLocation },
        waypoints: waypoints.map((wp, i) => ({ name: wp.location, order: i })).filter(wp => wp.name),
        total_distance: mockRouteData.distance,
        total_duration: mockRouteData.duration,
        route_data: mockRouteData
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const loadRecentRoute = (route) => {
    setStartLocation(route.start);
    setEndLocation(route.end);
    setWaypoints(route.waypoints.map((location, index) => ({ id: Date.now() + index, location })));
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">경로 편집</h1>
              <div className="text-xs text-gray-500">Step {currentStep} • 날짜 → 장소 → 숙소</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={()=> setDateOpen(true)}>여행 기간 선택</Button>
            <Button onClick={calculateRoute} disabled={!startLocation || !endLocation || isCalculating} className="bg-gradient-to-r from-blue-500 to-indigo-600">
              {isCalculating ? "계산 중..." : "경로 탐색"}
            </Button>
          </div>
        </div>
      </div>

      {/* Date range modal (간단 버전) */}
      {dateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[520px] p-6">
            <h3 className="text-lg font-bold mb-4">여행 기간을 선택해주세요</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">시작일</label>
                <input type="date" className="mt-1 w-full border rounded p-2" value={dateRange.start} onChange={(e)=> setDateRange(r=>({...r,start:e.target.value}))} />
              </div>
              <div>
                <label className="text-sm text-gray-600">종료일</label>
                <input type="date" className="mt-1 w-full border rounded p-2" value={dateRange.end} onChange={(e)=> setDateRange(r=>({...r,end:e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=> setDateOpen(false)}>취소</Button>
              <Button onClick={()=> { setDateOpen(false); setCurrentStep(2); }}>선택</Button>
            </div>
          </div>
        </div>
      )}

      {placeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[680px] p-6">
            <h3 className="text-lg font-bold mb-2">장소 선택</h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`px-2 py-1 rounded border text-sm ${placeCategory===cat?'bg-blue-600 text-white border-blue-600':'bg-white hover:bg-gray-50'}`}
                  onClick={()=> setPlaceCategory(cat)}
                >{cat}</button>
              ))}
            </div>
            <input
              type="text"
              placeholder="장소를 검색하세요 (예: 인천국제공항, 명동)"
              className="w-full border rounded p-2 mb-3"
              value={placeQuery}
              onChange={(e)=> setPlaceQuery(e.target.value)}
            />
            <div className="max-h-80 overflow-y-auto border rounded">
              {placeResults.filter(p => placeCategory==='전체' || String(p.category||'').includes(placeCategory)).map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b"
                  onClick={() => {
                    if (placeTarget === 'start') setStartLocation(p.name);
                    else if (placeTarget === 'end') setEndLocation(p.name);
                    else if (placeTarget === 'lodging') setLodging(p.name);
                    else if (placeTarget === 'wp') setWaypoints(w=>[...w, { id: Date.now(), location: p.name }]);
                    setPlaceOpen(false);
                    setPlaceQuery('');
                    setPlaceResults([]);
                  }}
                >
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.addr}</div>
                </button>
              ))}
              {placeResults.length === 0 && (
                <div className="text-sm text-gray-500 p-4">검색 결과가 없습니다.</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={()=> setPlaceOpen(false)}>닫기</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">경로 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">출발지</label>
                  <div className="flex gap-2">
                    <Input placeholder="출발지를 입력하세요" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} />
                    <Button variant="outline" onClick={()=> { setPlaceTarget('start'); setPlaceOpen(true); }}>찾기</Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={()=> setStartLocation('인천국제공항')}>인천국제공항</Button>
                    <Button size="sm" variant="outline" onClick={()=> setStartLocation('김포국제공항')}>김포국제공항</Button>
                  </div>
                </div>
                <WaypointList waypoints={waypoints} onAdd={()=> { setPlaceTarget('wp'); setPlaceOpen(true); }} onRemove={removeWaypoint} onUpdate={updateWaypoint} />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">도착지</label>
                  <div className="flex gap-2">
                    <Input placeholder="도착지를 입력하세요" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} />
                    <Button variant="outline" onClick={()=> { setPlaceTarget('end'); setPlaceOpen(true); }}>찾기</Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={()=> setEndLocation('인천국제공항')}>인천국제공항</Button>
                    <Button size="sm" variant="outline" onClick={()=> setEndLocation('김포국제공항')}>김포국제공항</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">숙소(마지막)</label>
                  <div className="flex gap-2">
                    <Input placeholder="숙소를 입력하세요" value={lodging} onChange={(e) => setLodging(e.target.value)} />
                    <Button variant="outline" onClick={()=> { setPlaceTarget('lodging'); setPlaceOpen(true); }}>찾기</Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">규칙: 숙소는 일정의 마지막에 배치됩니다.</div>
                </div>
                {dateRange.start && dateRange.end && (
                  <div className="text-xs text-gray-600">여행기간: {dateRange.start} ~ {dateRange.end}</div>
                )}
              </CardContent>
            </Card>

            <RecentRoutes routes={recentRoutes} onLoadRoute={loadRecentRoute} />
          </div>
        </div>
        <div className="flex-1">
          <MapContainer startLocation={startLocation} endLocation={endLocation} waypoints={waypoints} routeData={routeData} onLocationSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}
