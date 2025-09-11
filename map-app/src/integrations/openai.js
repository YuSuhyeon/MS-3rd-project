export async function getOpenAIMenuAnswer(menuName, lang = "ko") {
  const endpoint =
    process.env.REACT_APP_AZURE_OPENAI_ENDPOINT +
    "/openai/deployments/" +
    process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT +
    "/chat/completions?api-version=" +
    process.env.REACT_APP_AZURE_OPENAI_API_VERSION;
  const key = process.env.REACT_APP_AZURE_OPENAI_KEY;

  const langMap = {
    ko: "한국어",
    en: "영어",
    ja: "일본어",
    "zh-Hans": "중국어",
  };

  const prompt = `메뉴명: ${menuName}\n설명: 해당 메뉴에 대한 정보를 알려주세요. 답변은 ${
    langMap[lang] || "한국어"
  }로 해주세요.`;

  const body = {
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.7,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
