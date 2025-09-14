// Kakao 지도 생성 함수
export function createKakaoMap({
  containerId,
  KAKAO_JS_KEY,
  center,
  level = 2,
  onMapReady,
}) {
  const loadScript = () => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    }
  };

  function initMap() {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(
        `[createKakaoMap] Container not found for id="${containerId}". Skipping init.`
      );
      return;
    }

    const map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    if (onMapReady) onMapReady(map);
  }
  loadScript();
}

// Kakao 지도에 마커 생성 함수
export function addKakaoMarkers({ map, data, markerImg, onClick }) {
  const markers = new Map();
  data.forEach((row) => {
    const lat = parseFloat(row.lat),
      lon = parseFloat(row.lon);
    if (isNaN(lat) || isNaN(lon)) return;

    const image = markerImg
      ? new window.kakao.maps.MarkerImage(
          markerImg,
          new window.kakao.maps.Size(36, 36)
        )
      : undefined;
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lon),
      image,
      map,
    });
    markers.set(row.poi_id, marker);
    if (onClick) {
      window.kakao.maps.event.addListener(marker, "click", () =>
        onClick(row, marker)
      );
    }
  });
  return { markers };
}

// Kakao 지도에 인포윈도우 생성 및 표시 함수
export function showKakaoInfoWindow({
  map,
  marker,
  contentHtml,
  removable = true,
}) {
  const infoWindow = new window.kakao.maps.InfoWindow({
    content: contentHtml,
    removable,
  });
  infoWindow.open(map, marker);
  return infoWindow;
}

// 50m 반경 원(Circle) 표시/업데이트
export function drawCircle({
  map,
  center,
  radius = 50,
  strokeColor = "#3b82f6",
  fillColor = "rgba(59,130,246,0.15)",
}) {
  if (!window.kakao?.maps) return null;
  const circle = new window.kakao.maps.Circle({
    center: new window.kakao.maps.LatLng(center.lat, center.lng),
    radius,
    strokeWeight: 2,
    strokeColor,
    strokeOpacity: 0.9,
    strokeStyle: "solid",
    fillColor,
    fillOpacity: 0.5,
  });
  circle.setMap(map);
  return circle;
}
