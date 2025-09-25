const AZURE_TRANSLATOR_KEY = process.env.REACT_APP_AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_ENDPOINT =
  process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT; // e.g., https://api.cognitive.microsofttranslator.com
const AZURE_TRANSLATOR_REGION = process.env.REACT_APP_AZURE_TRANSLATOR_REGION;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function translateText(input, to = "ko") {
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
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "translator error");
      results.push(...data.map((x) => x?.translations?.[0]?.text || ""));
    }
    return results;
  } else if (typeof input === "string") {
    const [result] = await translateText([input], to);
    return result || input;
  }
  return input;
}



// 영어 원본을 한국어로 번역하는 함수 (VisionOCR 데이터 번역 시 사용)
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

// 언어 감지 함수
export async function detectLanguage(input) {
  if (!input || typeof input !== "string" || !input.trim()) {
    return null;
  }
  
  if (
    !AZURE_TRANSLATOR_KEY ||
    !AZURE_TRANSLATOR_ENDPOINT ||
    !AZURE_TRANSLATOR_REGION
  ) {
    console.warn("Translator API credentials not configured");
    return null;
  }

  try {

    console.log("--- 디버깅: detectLanguage 함수에서 사용하는 환경 변수 ---");
    console.log("KEY:", process.env.REACT_APP_AZURE_TRANSLATOR_KEY);
    console.log("REGION:", process.env.REACT_APP_AZURE_TRANSLATOR_REGION);
    console.log("---------------------------------------------------------");

    const response = await fetch(
      `${AZURE_TRANSLATOR_ENDPOINT}/detect?api-version=3.0`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: input }]),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0 && data[0].language) {
      return {
        language: data[0].language,
        score: data[0].score,
        isTranslationSupported: data[0].isTranslationSupported
      };
    }
    return null;
  } catch (error) {
    console.error("Language detection error:", error);
    return null;
  }
}

// 언어 코드를 한국어 이름으로 변환
export function getLanguageName(languageCode) {
  const languageNames = {
    'ko': '한국어',
    'en': '영어',
    'ja': '일본어',
    'zh-Hans': '중국어(간체)',
    'zh-Hant': '중국어(번체)',
    'es': '스페인어',
    'fr': '프랑스어',
    'de': '독일어',
    'ru': '러시아어',
    'ar': '아랍어',
    'th': '태국어',
    'vi': '베트남어',
    'hi': '힌디어',
    'pt': '포르투갈어',
    'it': '이탈리아어'
  };
  return languageNames[languageCode] || languageCode;
}