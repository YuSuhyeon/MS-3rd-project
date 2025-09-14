const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Keep this file syntax-simple to avoid startup failures.
// If this file throws, CRA dev server will not listen on :3000.

module.exports = function (app) {
  const KAKAO_NAV_TARGET = "https://apis-navi.kakaomobility.com";

  // Attach Kakao auth header if present
  const injectKakaoAuth = (proxyReq) => {
    const key =
      process.env.KAKAO_REST_API_KEY || process.env.REACT_APP_KAKAO_API_KEY;
    if (key) {
      proxyReq.setHeader("Authorization", `KakaoAK ${key}`);
    }
  };

  // Kakao waypoints proxy (POST)
  app.use(
    "/api/kakao-waypoints",
    createProxyMiddleware({
      target: KAKAO_NAV_TARGET,
      changeOrigin: true,
      pathRewrite: { "^/api/kakao-waypoints": "/v1/waypoints/directions" },
      onProxyReq: (proxyReq, req) => {
        injectKakaoAuth(proxyReq);
        if (req.body) {
          const body = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(body));
          proxyReq.write(body);
        }
      },
    })
  );

  // -------- Local CSV -> JSON helper endpoints --------
  let cache = { mtime: 0, items: [] };
  const publicDir = path.resolve(__dirname, "../public");

  function pick(o, keys) {
    for (const k of keys) {
      const v = o[k];
      if (v != null && String(v).trim() !== "") return v;
    }
    return null;
  }

  function normalizeRow(row, idx, src) {
    const name =
      pick(row, ["name", "Name", "title", "name_ko"]) || `place-${src}-${idx}`;
    const lat = parseFloat(
      pick(row, ["lat", "LAT", "Lat", "latitude", "Latitude", "Y", "y"])
    );
    const lng = parseFloat(
      pick(row, [
        "lon",
        "LON",
        "Lon",
        "lng",
        "LNG",
        "Longitude",
        "longitude",
        "X",
        "x",
      ])
    );
    if (!isFinite(lat) || !isFinite(lng)) return null;
    const addr =
      pick(row, ["address", "addr", "road_address", "address_ko"]) || "";
    const cat = pick(row, ["category", "cat", "category_ko"]) || "";
    const desc = String(
      pick(row, ["desc", "description", "rag_seed_text_ko"]) || ""
    );
    return {
      id: `${src}-${idx}`,
      name: String(name),
      lat,
      lng,
      addr: String(addr),
      category: String(cat),
      desc,
    };
  }

  function parseCsv(filePath, srcLabel) {
    try {
      const stat = fs.statSync(filePath);
      const text = fs.readFileSync(filePath, "utf8");
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = Array.isArray(parsed.data) ? parsed.data : [];
      const out = [];
      rows.forEach((r, i) => {
        const n = normalizeRow(r, i, srcLabel);
        if (n) out.push(n);
      });
      return { items: out, mtime: stat.mtimeMs };
    } catch {
      return { items: [], mtime: 0 };
    }
  }

  function loadAll() {
    try {
      const seoulDataDir = path.join(publicDir, "seoul_data");
      const filesToLoad = [
        "seoul_관광지.csv",
        "seoul_레포츠.csv",
        "seoul_문화시설.csv",
        "seoul_쇼핑.csv",
        "seoul_숙박.csv",
        "seoul_음식점.csv",
        "seoul_행사_공연_축제.csv",
      ];
      const candidates = filesToLoad.map((fname) => ({
        file: path.join(seoulDataDir, fname),
        label: fname,
      }));

      const aggregated = [];
      let maxMtime = cache.mtime;
      for (const c of candidates) {
        if (fs.existsSync(c.file)) {
          const { items, mtime } = parseCsv(c.file, c.label);
          if (items.length) aggregated.push(...items);
          if (mtime > maxMtime) maxMtime = mtime;
        }
      }
      if (aggregated.length) {
        cache = { mtime: maxMtime, items: aggregated };
        return aggregated;
      }
      return cache.items || [];
    } catch {
      return cache.items || [];
    }
  }

  app.get("/api/seoul-data", (req, res) => {
    const all = loadAll();
    const q = String(req.query.q || "")
      .trim()
      .toLowerCase();
    const limited = q
      ? all
          .filter(
            (x) =>
              (x.name || "").toLowerCase().includes(q) ||
              (x.addr || "").toLowerCase().includes(q)
          )
          .slice(0, 50)
      : all.slice(0, 500);
    res.json({ count: all.length, items: limited });
  });

  // -------- Simple persona route builder (heuristic) --------
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  }

  function extractCategory(item) {
    const text = `${item.name || ""} ${item.addr || ""} ${
      item.category || ""
    } ${item.desc || ""}`.toLowerCase();
    const has = (...keys) => keys.some((k) => text.includes(k));
    if (has("박물관", "미술관", "전시", "heritage", "문화")) return "culture";
    if (has("맛집", "음식", "식당", "food", "restaurant", "카페", "미식"))
      return "food";
    if (has("공원", "자연", "산", "강", "호수", "숲", "휴양", "걷기"))
      return "nature";
    if (has("쇼핑", "시장", "백화점", "shopping", "market")) return "shopping";
    if (has("체험", "모험", "액티비티", "레저")) return "adventure";
    if (has("스파", "호텔", "리조트", "프리미엄", "럭셔리")) return "luxury";
    return "general";
  }

  function scoreByPersona(persona, item) {
    const name = `${item.name || ""} ${item.addr || ""} ${
      item.category || ""
    } ${item.desc || ""}`.toLowerCase();
    const any = (...keys) => keys.some((k) => name.includes(k));
    const cat = extractCategory(item);
    let base = 0;
    switch (persona) {
      case "미식가":
        base =
          (cat === "food" ? 4 : 0) +
          (any("맛집", "전통", "한옥", "음식") ? 1 : 0);
        break;
      case "문화 체험가":
        base = (cat === "culture" ? 4 : 0) + (any("전통", "한옥") ? 1 : 0);
        break;
      case "자연 힐링러":
        base =
          (cat === "nature" ? 4 : 0) + (any("산책", "휴양", "힐링") ? 1 : 0);
        break;
      case "액티브 모험가":
        base = (cat === "adventure" ? 4 : 0) + (any("야외", "체험") ? 1 : 0);
        break;
      case "럭셔리 트래블러":
        base = (cat === "luxury" ? 4 : 0) + (any("프리미엄", "럭셔리") ? 1 : 0);
        break;
      default:
        base = any("명소", "관광", "추천") ? 1 : 0;
    }
    return base;
  }

  function buildRoute({
    persona = "문화 체험가",
    maxStops = 6,
    maxLegKm = 20,
    origin = null,
    preferDiversity = true,
  }) {
    const all = loadAll();
    if (all.length === 0) return [];
    const enriched = all.map((it) => ({
      ...it,
      derived_category: extractCategory(it),
      _score: scoreByPersona(persona, it),
    }));
    const top = enriched.filter((x) => x._score > 0);
    const pool = top.length ? top : enriched;

    let seed = null;
    if (origin && isFinite(origin.lat) && isFinite(origin.lng)) {
      seed =
        pool
          .map((x) => ({
            x,
            d: haversine(origin.lat, origin.lng, x.lat, x.lng),
          }))
          .sort((a, b) => a.d - b.d)[0]?.x || null;
    }
    if (!seed) {
      const topN = pool.sort((a, b) => b._score - a._score).slice(0, 50);
      const avgLat =
        topN.reduce((s, x) => s + x.lat, 0) / Math.max(1, topN.length);
      const avgLng =
        topN.reduce((s, x) => s + x.lng, 0) / Math.max(1, topN.length);
      seed =
        topN.sort(
          (a, b) =>
            haversine(avgLat, avgLng, a.lat, a.lng) -
            haversine(avgLat, avgLng, b.lat, b.lng)
        )[0] || pool[0];
    }

    const route = [];
    const used = new Set();
    let current = seed;
    if (!current) return [];
    route.push(current);
    used.add(current.id);

    while (route.length < maxStops) {
      const candidates = pool
        .filter((x) => !used.has(x.id))
        .map((x) => ({
          x,
          d: haversine(current.lat, current.lng, x.lat, x.lng),
        }));
      const within = candidates.filter((c) => c.d <= maxLegKm);
      const diversityPenalty = (cat) => {
        if (!preferDiversity) return 0;
        const lastCat = route.length
          ? route[route.length - 1].derived_category
          : null;
        return lastCat && cat === lastCat ? 1.5 : 0;
      };
      const best = (within.length ? within : candidates)
        .map((c) => ({
          ...c,
          score:
            c.x._score -
            diversityPenalty(c.x.derived_category) -
            c.d / Math.max(1, maxLegKm),
        }))
        .sort((a, b) => b.score - a.score)[0];
      const next = best ? best.x : null;
      if (!next) break;
      route.push(next);
      used.add(next.id);
      current = next;
    }

    return route.map((p, idx) => {
      const prev = idx > 0 ? route[idx - 1] : null;
      const km = prev ? haversine(prev.lat, prev.lng, p.lat, p.lng) : 0;
      const avgUrbanSpeedKmH = 20;
      const minutes = Math.round((km / avgUrbanSpeedKmH) * 60);
      return { ...p, approx_leg_km: km, approx_leg_minutes: minutes };
    });
  }

  app.post("/api/persona/route", (req, res) => {
    try {
      const body = req.body || {};
      const persona = String(
        body.persona_type || body.persona || "문화 체험가"
      );
      const maxStops = Math.max(3, Math.min(8, Number(body.maxStops || 6)));
      const maxLegKm = Math.max(3, Math.min(30, Number(body.maxLegKm || 20)));
      const origin =
        body.origin && isFinite(body.origin.lat) && isFinite(body.origin.lng)
          ? body.origin
          : null;
      const preferDiversity = body.preferDiversity !== false;
      const route = buildRoute({
        persona,
        maxStops,
        maxLegKm,
        origin,
        preferDiversity,
      });
      res.json({ count: route.length, items: route });
    } catch (e) {
      res.status(500).json({ error: "route_build_failed" });
    }
  });

  // Simple translator passthrough if keys provided, else echo
  app.get("/api/translate", async (req, res) => {
    try {
      const key =
        process.env.AZURE_TRANSLATOR_KEY ||
        process.env.REACT_APP_AZURE_TRANSLATOR_KEY;
      const region =
        process.env.AZURE_TRANSLATOR_REGION ||
        process.env.REACT_APP_AZURE_TRANSLATOR_REGION;
      const endpoint =
        process.env.AZURE_TRANSLATOR_ENDPOINT ||
        process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT ||
        "https://api.cognitive.microsofttranslator.com";
      const to = String(req.query.to || "en");
      const texts = Array.isArray(req.query.text)
        ? req.query.text
        : req.query.text
        ? [req.query.text]
        : [];
      if (!key || !region || texts.length === 0) {
        return res.json({ texts });
      }
      const url = `${endpoint}/translate?api-version=3.0&to=${encodeURIComponent(
        to
      )}`;
      const body = texts.map((t) => ({ Text: String(t || "") }));
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok)
        return res
          .status(500)
          .json({ error: j?.error?.message || "translator error" });
      const out = j.map((x) => x?.translations?.[0]?.text || "");
      res.json({ texts: out });
    } catch (e) {
      res.status(500).json({ error: "translate_failed" });
    }
  });

  // Proxy to Python persona API (run model/app.py on port 5001)
  app.use(
    "/api/persona",
    createProxyMiddleware({
      target: "http://127.0.0.1:5001",
      changeOrigin: true,
      pathRewrite: { "^/api/persona": "/api/persona" },
    })
  );

  app.use(
    "/api/vision",
    createProxyMiddleware({
      target: "http://127.0.0.1:5001",
      changeOrigin: true,
      pathRewrite: { "^/api/vision": "/api/vision" },
    })
  );

  app.use(
    "/api/spotify",
    createProxyMiddleware({
      target: "http://127.0.0.1:5001",
      changeOrigin: true,
      pathRewrite: { "^/api/spotify": "/api/spotify" },
    })
  );
};
