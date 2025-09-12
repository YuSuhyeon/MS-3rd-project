// Lightweight loader for T Map JS SDK v2
// Usage: await ensureTmap()

export function ensureTmap(appKeyOverride) {
  return new Promise((resolve, reject) => {
    const isReady = () => (typeof window !== 'undefined' && window.Tmapv2 && typeof window.Tmapv2.Map === 'function' && typeof window.Tmapv2.LatLng === 'function');
    if (isReady()) return resolve(window.Tmapv2);

    // Try multiple sources for appKey
    const key =
      appKeyOverride ||
      (typeof process !== 'undefined' && process.env && process.env.REACT_APP_TMAP_APP_KEY) ||
      (typeof document !== 'undefined' && document.querySelector('meta[name="tmap-app-key"]')?.content) ||
      (typeof window !== 'undefined' && window.REACT_APP_TMAP_APP_KEY) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('REACT_APP_TMAP_APP_KEY'));

    if (!key) {
      console.warn('REACT_APP_TMAP_APP_KEY 가 설정되어 있지 않습니다. T Map 로드를 건너뜁니다.');
      resolve(null);
      return;
    }

    // Avoid duplicate script tags
    const existing = document.querySelector('script[data-tmap="jsv2"]');
    const onReady = () => {
      // Poll until constructors become available (covers cached/instant load cases)
      const t0 = Date.now();
      const timer = setInterval(() => {
        if (isReady()) {
          clearInterval(timer);
          resolve(window.Tmapv2);
        } else if (Date.now() - t0 > 15000) {
          clearInterval(timer);
          console.warn('Tmap script loaded but API not ready; proceeding without Tmapv2');
          resolve(null);
        }
      }, 50);
    };
    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener('error', () => reject(new Error('Tmap script failed to load')));
      // If script tag already loaded, try readiness polling immediately
      if (existing.readyState === 'complete' || existing.getAttribute('data-loaded') === '1') onReady();
      return;
    }
    // 동적 로드는 T Map 내부의 document.write 사용으로 브라우저 오류를 유발합니다.
    // 반드시 public/index.html에 파서-삽입 방식으로 아래 스크립트를 추가하세요:
    // <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=YOUR_WEB_APP_KEY"></script>
    console.warn('T Map SDK script tag not found. Please add it to public/index.html as a static <script> with your Web AppKey.');
    resolve(null);
  });
}
