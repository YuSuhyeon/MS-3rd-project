const AZURE_TRANSLATOR_KEY = process.env.REACT_APP_AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_ENDPOINT = process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT; // e.g., https://api.cognitive.microsofttranslator.com
const AZURE_TRANSLATOR_REGION = process.env.REACT_APP_AZURE_TRANSLATOR_REGION;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function translateText(input, to = 'ko') {
  if (to === 'ko' || !input) return input;
  if (!AZURE_TRANSLATOR_KEY || !AZURE_TRANSLATOR_ENDPOINT || !AZURE_TRANSLATOR_REGION) return input;

  if (Array.isArray(input)) {
    if (!input.length) return input;
    const results = [];
    for (const group of chunk(input, 80)) {
      const body = group.map((t) => ({ Text: t || '' }));
      const r = await fetch(`${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${to}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || 'translator error');
      results.push(...data.map((x) => x?.translations?.[0]?.text || ''));
    }
    return results;
  } else if (typeof input === 'string') {
    const [result] = await translateText([input], to);
    return result || input;
  }
  return input;
}
