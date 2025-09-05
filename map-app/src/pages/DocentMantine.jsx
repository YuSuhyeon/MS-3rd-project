import React, { useState, useEffect, useRef, useMemo } from "react";
import { POI } from "Entities/POI";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { Navigation, VolumeX } from "lucide-react";
import { translateText } from "integrations/translator";
import { speakText, stopTTS } from "integrations/tts";
import Papa from 'papaparse';

import POIList from "components/docent/POIList";
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";
import DocentChatbot from "components/docent/DocentChatbot";

const UI = {
  ko: { title: 'AI 도슨트', subtitle: '실시간 위치 기반 가이드', aiDocent: 'AI 도슨트', stopVoice: '음성 중지', current: '현재 위치', directions: '길찾기' },
  en: { title: 'AI Docent', subtitle: 'Real-time location guide', aiDocent: 'AI Docent', stopVoice: 'Stop voice', current: 'Current location', directions: 'Directions' },
  ja: { title: 'AI ドーセント', subtitle: 'リアルタイム位置ガイド', aiDocent: 'AI ドーセント', stopVoice: '音声停止', current: '現在地', directions: '経路検索' },
  zh: { title: 'AI 讲解', subtitle: '实时位置导览', aiDocent: 'AI 讲解', stopVoice: '停止语音', current: '当前位置', directions: '路线' },
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DocentMantine() {
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isDocentActive, setIsDocentActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [csvData, setCsvData] = useState([]);
  const [selectedLang, setSelectedLang] = useState('ko');
  const [translatedDesc, setTranslatedDesc] = useState('');

  const ui = UI[selectedLang] || UI.ko;

  const watchId = useRef(null);
  const poisRef = useRef([]);
  useEffect(() => { poisRef.current = pois; }, [pois]);

  // Load CSV (from public)
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/final_visit_seoul.csv')
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, { header: true, skipEmptyLines: true, complete: (r) => setCsvData(r.data) });
      })
      .catch((e) => console.error('CSV load error', e));
  }, []);

  // Build POIs from CSV with per-language name/address
  const csvPois = useMemo(() => {
    const base = (csvData || []).map((row) => {
      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lon);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        id: row.poi_id || `${row.name_ko}-${lat}-${lng}`,
        name_ko: row.name_ko || '장소',
        address_ko: row.address_ko || '',
        description_ko: row.rag_seed_text_ko || '',
        location: { lat, lng },
        _raw: row,
      };
    }).filter(Boolean);
    return base;
  }, [csvData]);

  // Translation caches for name/address
  const [nameTr, setNameTr] = useState({});
  const [addrTr, setAddrTr] = useState({});
  useEffect(() => {
    (async () => {
      if (!csvPois.length) return;
      if (selectedLang === 'ko') { setNameTr({}); setAddrTr({}); return; }
      const names = csvPois.map(c => c.name_ko);
      const addrs = csvPois.map(c => c.address_ko);
      try {
        const [nOut, aOut] = await Promise.all([
          translateText(names, selectedLang),
          translateText(addrs, selectedLang)
        ]);
        const nMap = {}, aMap = {};
        csvPois.forEach((c, i) => { nMap[c.id] = nOut[i] || c.name_ko; aMap[c.id] = aOut[i] || c.address_ko; });
        setNameTr(nMap); setAddrTr(aMap);
      } catch (e) { setNameTr({}); setAddrTr({}); }
    })();
  }, [csvPois, selectedLang]);

  // Effective POIs with translated fields
  const listData = useMemo(() => {
    if (!csvPois.length) return (pois || []).map(p => ({ id: p.id, name: p.name, address: '', description: p.description, location: p.location }));
    return csvPois.map(c => ({ id: c.id, name: selectedLang === 'ko' ? c.name_ko : nameTr[c.id] || c.name_ko, address: selectedLang === 'ko' ? c.address_ko : addrTr[c.id] || c.address_ko, description: c.description_ko, location: c.location }));
  }, [csvPois, pois, selectedLang, nameTr, addrTr]);

  // Load POIs (fallback) if CSV empty
  useEffect(() => {
    if (csvPois.length) return;
    (async () => { try { const data = await POI.list(); setPOIs(data); } catch (e) { console.error(e); } })();
  }, [csvPois.length]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => { setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
        (err) => { console.error('위치 추적 오류:', err); },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    }
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  // Translate selected description
  useEffect(() => {
    (async () => {
      if (!selectedPOI) { setTranslatedDesc(''); return; }
      const text = selectedPOI.description || '';
      if (!text) { setTranslatedDesc(''); return; }
      if (selectedLang === 'ko') { setTranslatedDesc(text); return; }
      try { const out = await translateText(text, selectedLang); setTranslatedDesc(out); } catch { setTranslatedDesc(text); }
    })();
  }, [selectedPOI, selectedLang]);

  // Auto play TTS
  useEffect(() => {
    (async () => {
      if (isDocentActive && selectedPOI && translatedDesc) { setIsPlaying(true); try { await speakText(translatedDesc, selectedLang); } finally { setIsPlaying(false); } }
    })();
  }, [isDocentActive, selectedPOI, translatedDesc, selectedLang]);

  const nearbyCsvCards = useMemo(() => {
    if (!userLocation || !csvData.length) return [];
    return csvData.filter(card => {
      const lat = parseFloat(card.lat), lon = parseFloat(card.lon);
      if (isNaN(lat) || isNaN(lon)) return false;
      return getDistance(userLocation.lat, userLocation.lng, lat, lon) <= 0.05;
    });
  }, [userLocation, csvData]);

  const stopAllTTS = () => { stopTTS(); setIsPlaying(false); };

  return (
    <div className="h-screen bg-gray-50">
      <DocentChatbot selectedLang={selectedLang} />
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ui.title}</h1>
              <p className="text-xs text-gray-500">{ui.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文(简体)</option>
            </select>
            <div className="flex items-center gap-2">
              <Switch checked={isDocentActive} onCheckedChange={(v) => { if (!v) stopAllTTS(); setIsDocentActive(v); }} />
              <span className="text-sm font-medium">{ui.aiDocent}</span>
            </div>
            {isPlaying && (
              <Button variant="outline" size="sm" onClick={stopAllTTS} className="text-red-600 hover:text-red-700">
                <VolumeX className="w-4 h-4 mr-1" />
                {ui.stopVoice}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-80 bg-white border-r border-gray-200">
          <POIList
            pois={listData}
            selectedPOI={selectedPOI}
            nearbyPOIs={nearbyCsvCards}
            userLocation={userLocation}
            onSelectPOI={(poi) => setSelectedPOI(poi)}
            isDocentActive={isDocentActive}
            isPlaying={isPlaying}
          />
        </div>
        <div className="flex-1">
          <LocationMap
            userLocation={userLocation}
            pois={listData}
            selectedPOI={selectedPOI}
            onSelectPOI={setSelectedPOI}
          />
        </div>
        <div className="w-80 bg-white border-l border-gray-200">
          <POIDetails
            poi={selectedPOI ? { ...selectedPOI, description: translatedDesc } : null}
            userLocation={userLocation}
            onPlayTTS={() => speakText(translatedDesc, selectedLang)}
            isDocentActive={isDocentActive}
          />
        </div>
      </div>
    </div>
  );
}
