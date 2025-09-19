// integrations/tmapLoader.js

let tmapSdkPromise = null;

const ensureTmap = () => {
  if (!tmapSdkPromise) {
    tmapSdkPromise = new Promise((resolve, reject) => {
      // index.html을 통해 스크립트가 로드되므로, window.Tmapv2가 생길 때까지 기다리기만 하면 됨
      if (window.Tmapv2 && window.Tmapv2.Map) {
        return resolve(window.Tmapv2);
      }

      const maxRetries = 50; // 최대 5초 대기
      let retries = 0;
      const interval = setInterval(() => {
        if (window.Tmapv2 && window.Tmapv2.Map) {
          clearInterval(interval);
          resolve(window.Tmapv2);
        } else {
          retries++;
          if (retries > maxRetries) {
            clearInterval(interval);
            tmapSdkPromise = null;
            reject(
              new Error(
                "TMap SDK를 로드하지 못했습니다. index.html의 appKey 설정 및 네트워크를 확인해주세요."
              )
            );
          }
        }
      }, 100);
    });
  }
  return tmapSdkPromise;
};

export default ensureTmap;
