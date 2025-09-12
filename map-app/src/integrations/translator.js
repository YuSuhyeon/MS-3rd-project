const AZURE_TRANSLATOR_KEY = process.env.REACT_APP_AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_ENDPOINT =
  process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT; // e.g., https://api.cognitive.microsofttranslator.com
const AZURE_TRANSLATOR_REGION = process.env.REACT_APP_AZURE_TRANSLATOR_REGION;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// 언어별 번역 캐시: Map<lang, Map<original, translated>>
const translationCache = new Map();
function getLangCache(lang) {
  if (!translationCache.has(lang)) translationCache.set(lang, new Map());
  return translationCache.get(lang);
}

// 간단한 요청 속도 제한과 재시도 백오프
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 350; // 요청 간 최소 간격

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function requestTranslate(body, to) {
  const now = Date.now();
  const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - now);
  if (wait) await delay(wait);
  let attempt = 0;
  let backoff = 800; // 429 시 백오프 시작값
  while (true) {
    lastRequestAt = Date.now();
    const r = await fetch(
      `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${to}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await r.json().catch(() => ({}));
    if (r.ok) return data;
    if ((r.status === 429 || r.status === 503) && attempt < 3) {
      attempt += 1;
      await delay(backoff);
      backoff *= 2;
      continue;
    }
    throw new Error(data?.error?.message || `translator error: ${r.status}`);
  }
}

export async function translateText(input, to = "ko") {
  if (to === "ko" || !input) return input;
  if (
    !AZURE_TRANSLATOR_KEY ||
    !AZURE_TRANSLATOR_ENDPOINT ||
    !AZURE_TRANSLATOR_REGION
  )
    return input;

  if (Array.isArray(input)) {
    if (!input.length) return input;
    const langCache = getLangCache(to);
    const normalized = input.map((t) => (t || "").trim());
    const unknown = Array.from(
      new Set(normalized.filter((t) => t && !langCache.has(t)))
    );

    if (unknown.length) {
      for (const group of chunk(unknown, 80)) {
        const body = group.map((t) => ({ Text: t }));
        const data = await requestTranslate(body, to);
        data.forEach((x, idx) => {
          const src = group[idx];
          const dst = x?.translations?.[0]?.text || "";
          langCache.set(src, dst);
        });
      }
    }
    return normalized.map((t) => (t ? langCache.get(t) || t : ""));
  } else if (typeof input === "string") {
    const langCache = getLangCache(to);
    const key = (input || "").trim();
    if (langCache.has(key)) return langCache.get(key);
    const [result] = await translateText([key], to);
    return result || key;
  }
  return input;
}

// 영어 원본을 한국어로 번역하는 함수
export async function translateToKorean(input) {
  if (!input) return input;
  if (
    !AZURE_TRANSLATOR_KEY ||
    !AZURE_TRANSLATOR_ENDPOINT ||
    !AZURE_TRANSLATOR_REGION
  )
    return input;
  if (Array.isArray(input)) {
    if (!input.length) return input;
    const results = [];
    for (const group of chunk(input, 80)) {
      const body = group.map((t) => ({ Text: t || "" }));
      const r = await fetch(
        `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=ko`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
            "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "translator error");
      results.push(...data.map((x) => x?.translations?.[0]?.text || ""));
    }
    return results;
  } else if (typeof input === "string") {
    const [result] = await translateToKorean([input]);
    return result || input;
  }
  return input;
}

export async function translatePageContent(targetLanguage = "ko", roots) {
  // 한국어는 번역하지 않음 (i18n으로 처리)
  if (targetLanguage === "ko") {
    // 원문 복원만 수행
    const rootList = Array.isArray(roots) && roots.length ? roots : [document.body];
    const elements = [];
    function walk(node) {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || "").trim();
        if (text) elements.push({ node, type: "text", value: text });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.getAttribute && node.getAttribute("data-i18n-ignore") === "true")
          return;
        if (node.childNodes.length === 0) {
          const text = (node.textContent || "").trim();
          if (text) elements.push({ node, type: "element", value: text });
        }
        node.childNodes.forEach(walk);
      }
    }
    rootList.forEach(walk);
    
    elements.forEach((item) => {
      const el = item.type === "text" ? item.node.parentElement : item.node;
      if (!el || !el.getAttribute) return;
      const orig = el.getAttribute("data-i18n-orig");
      if (orig != null) {
        if (item.type === "text") item.node.textContent = orig;
        else item.node.textContent = orig;
      }
    });
    return elements.map((e) => e.value);
  }

  // 특정 루트들만 처리(없으면 body 전체)
  const rootList =
    Array.isArray(roots) && roots.length ? roots : [document.body];
  const elements = [];
  function walk(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").trim();
      if (text) elements.push({ node, type: "text", value: text });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.getAttribute && node.getAttribute("data-i18n-ignore") === "true")
        return;
      if (node.childNodes.length === 0) {
        const text = (node.textContent || "").trim();
        if (text) elements.push({ node, type: "element", value: text });
      }
      node.childNodes.forEach(walk);
    }
  }
  rootList.forEach(walk);

  // 번역할 텍스트만 추출
  const texts = elements.map((item) => item.value);
  // 번역 전 원문 저장
  elements.forEach((item) => {
    const el = item.type === "text" ? item.node.parentElement : item.node;
    if (el && el.setAttribute && !el.getAttribute("data-i18n-orig")) {
      el.setAttribute("data-i18n-orig", item.value);
    }
  });
  const translated = await translateText(texts, targetLanguage);

  // 번역 결과로 교체
  elements.forEach((item, i) => {
    if (item.type === "text") {
      item.node.textContent = translated[i];
    } else if (item.type === "element") {
      item.node.textContent = translated[i];
    }
  });
  return translated;
}

let mutationObserver = null;
let observerLanguage = "ko";
let debounceTimer = null;
let pendingRoots = null;

function scheduleTranslate(lang, roots) {
  // 한국어는 번역하지 않음 (i18n으로 처리)
  if (lang === "ko") return;
  
  if (!pendingRoots) pendingRoots = new Set();
  if (Array.isArray(roots)) roots.forEach((n) => pendingRoots.add(n));
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const targets = pendingRoots ? Array.from(pendingRoots) : undefined;
    pendingRoots = null;
    translatePageContent(lang, targets);
  }, 2000); // 디바운스 시간을 2초로 증가
}

export function startAutoTranslate(lang = "ko") {
  observerLanguage = lang;
  if (mutationObserver) return; // already started
  if (typeof MutationObserver === "undefined") return;
  mutationObserver = new MutationObserver((mutations) => {
    const roots = [];
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes &&
          m.addedNodes.forEach((n) => {
            const root = n.nodeType === Node.ELEMENT_NODE ? n : n.parentElement;
            if (root) roots.push(root);
          });
      } else if (
        m.type === "characterData" &&
        m.target?.nodeType === Node.TEXT_NODE
      ) {
        const root = m.target.parentElement;
        if (root) roots.push(root);
      }
    }
    if (roots.length) scheduleTranslate(observerLanguage, roots);
  });
  mutationObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

export function stopAutoTranslate() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingRoots = null;
}

export function setObserverLanguage(lang) {
  observerLanguage = lang;
  scheduleTranslate(observerLanguage);
}
