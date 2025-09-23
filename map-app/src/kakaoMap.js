// Kakao Maps SDK 로더 (중복 로딩 방지)
export function ensureKakaoMaps(appkey) {
  if (typeof window === "undefined")
    return Promise.reject(new Error("no-window"));
  if (window.kakao && window.kakao.maps) {
    return new Promise((resolve) => window.kakao.maps.load(resolve));
  }
  if (window.__kakaoMapsLoading) return window.__kakaoMapsLoading;
  const key =
    appkey ||
    process.env.REACT_APP_KAKAO_API_KEY ||
    window.REACT_APP_KAKAO_API_KEY;
  if (!key)
    return Promise.reject(
      new Error("Kakao API key missing (REACT_APP_KAKAO_API_KEY)")
    );
  const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
    key
  )}&autoload=false&libraries=services`;
  window.__kakaoMapsLoading = new Promise((resolve, reject) => {
    const exist = document.querySelector(
      'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]'
    );
    if (exist) {
      // If script exists but Kakao not available yet, re-inject to avoid stale/error state
      try {
        if (exist.parentNode) exist.parentNode.removeChild(exist);
      } catch {}
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = (e) => {
      // Allow future retries
      try {
        delete window.__kakaoMapsLoading;
      } catch {}
      reject(e);
    };
    document.head.appendChild(script);
  });
  return window.__kakaoMapsLoading;
}

// Kakao 지도 생성 함수
export function createKakaoMap({
  containerId,
  KAKAO_JS_KEY,
  center,
  level = 2,
  onMapReady,
}) {
  console.log("createKakaoMap 호출됨");
  console.log("KAKAO_JS_KEY:", KAKAO_JS_KEY ? "설정됨" : "없음");
  console.log("containerId:", containerId);
  console.log("center:", center);

  function initMap() {
    console.log("initMap 호출됨");
    console.log("window.kakao:", window.kakao);
    console.log("window.kakao.maps:", window.kakao?.maps);

    const container = document.getElementById(containerId);
    console.log(`컨테이너 찾기 시도: id="${containerId}"`, container);

    if (!container) {
      console.warn(
        `[createKakaoMap] Container not found for id="${containerId}". Skipping init.`
      );
      return;
    }

    try {
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
      console.log("카카오 지도 생성 성공:", map);
      if (onMapReady) onMapReady(map);
    } catch (error) {
      console.error("카카오 지도 생성 실패:", error);
    }
  }

  // ensureKakaoMaps 함수 사용
  ensureKakaoMaps(KAKAO_JS_KEY)
    .then(() => {
      console.log("카카오 맵스 로드 성공, initMap 호출");
      initMap();
    })
    .catch((error) => {
      console.error("카카오 맵스 로드 실패:", error);
      console.error("API 키:", KAKAO_JS_KEY ? "설정됨" : "없음");

      // 대안: 직접 스크립트 로딩 시도
      console.log("대안 스크립트 로딩 시도");
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        console.log("대안 스크립트 로드 완료");
        if (window.kakao?.maps) {
          window.kakao.maps.load(initMap);
        }
      };
      script.onerror = (error) => {
        console.error("대안 스크립트 로드도 실패:", error);
      };
      document.head.appendChild(script);
    });
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
