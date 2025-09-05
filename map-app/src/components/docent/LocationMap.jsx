import React, { useEffect, useRef } from 'react';
import { createKakaoMap, addKakaoMarkers, showKakaoInfoWindow, drawCircle } from '../../kakaoMap';

export default function LocationMap({ userLocation, pois, selectedPOI, onSelectPOI }) {
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const infoWindowRef = useRef(null);
  const circleRef = useRef(null);

  const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_API_KEY;
  const MARKER_IMG = process.env.PUBLIC_URL + '/img/card_blue.png';

  // Init map once, then update markers when POIs change
  useEffect(() => {
    if (!KAKAO_JS_KEY) {
      console.warn('Kakao API key is missing. Set REACT_APP_KAKAO_API_KEY in .env');
    }
    createKakaoMap({
      containerId: 'docent-map',
      KAKAO_JS_KEY,
      center: userLocation || { lat: 37.5665, lng: 126.9780 },
      level: 4,
      onMapReady: (map) => {
        mapRef.current = map;

        // Map click to update userLocation circle and clear selection
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
          const latlng = mouseEvent.latLng;
          const center = { lat: latlng.getLat(), lng: latlng.getLng() };
          if (circleRef.current) circleRef.current.setMap(null);
          circleRef.current = drawCircle({ map, center, radius: 50 });
          if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
          onSelectPOI && onSelectPOI(null);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render/update markers when POIs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    if (!Array.isArray(pois) || pois.length === 0) return;

    const data = pois.map(p => ({ poi_id: p.id, lat: p.location?.lat, lon: p.location?.lng, name: p.name, address: p.address }));
    const { markers } = addKakaoMarkers({
      map,
      data,
      markerImg: MARKER_IMG,
      onClick: (row, marker) => {
        if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
        const sel = pois.find(p => p.id === row.poi_id) || { name: row.name, address: row.address, location: { lat: parseFloat(row.lat), lng: parseFloat(row.lon) } };
        onSelectPOI && onSelectPOI(sel);
        const content = `<div style="padding:8px;max-width:260px;font-size:13px;line-height:1.4">
          <div style="font-weight:700;margin-bottom:4px">${row.name || ''}</div>
          <div style="color:#555;margin-bottom:8px">${row.address || ''}</div>
          <button id="_dir_btn" style="padding:6px 10px;border:1px solid #bbb;border-radius:6px;background:#fff;cursor:pointer">길찾기</button>
        </div>`;
        infoWindowRef.current = showKakaoInfoWindow({ map, marker, contentHtml: content });
        setTimeout(() => {
          const btn = document.getElementById('_dir_btn');
          if (btn) {
            btn.onclick = () => {
              const sName = '내 위치';
              const eName = row.name || '도착지';
              window.open(`https://map.kakao.com/?sName=${encodeURIComponent(sName)}&eName=${encodeURIComponent(eName)}`, '_blank');
            };
          }
        }, 50);
      }
    });
    markers.forEach((m, key) => markersRef.current.set(key, m));
  }, [pois]);

  // Keep circle at user location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (circleRef.current) circleRef.current.setMap(null);
    circleRef.current = drawCircle({ map, center: userLocation, radius: 50 });
    map.setCenter(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
  }, [userLocation]);

  // Focus selected POI
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPOI) return;
    const lat = selectedPOI.location?.lat;
    const lng = selectedPOI.location?.lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      const pos = new window.kakao.maps.LatLng(lat, lng);
      map.setCenter(pos);
    }
  }, [selectedPOI]);

  return <div id="docent-map" className="w-full h-full" />;
}
