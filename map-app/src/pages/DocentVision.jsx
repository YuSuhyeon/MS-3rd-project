import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Papa from "papaparse";

// Re‑use your existing docent UI pieces
// (same props shape you already use in DocentMantine: LocationMap + POIDetails)
// See DocentMantine.jsx for reference on how these props are wired.
// We follow the same shape so the visuals/UX stay consistent.
import LocationMap from "components/docent/LocationMap";
import POIDetails from "components/docent/POIDetails";

/**
 * mobile 관련 훅
 */
import useIsMobile from "./useIsMobile";

/**
 * DocentVision.jsx
 * - Paste / drag & drop / capture a photo
 * - Send to Azure Custom Vision Object Detection
 * - Map top tag → canonical POI (63스퀘어 / 남산서울타워 / 롯데월드타워)
 * - Lookup RAG text from CSV (public/final_visit_seoul.csv)
 * - Show photo + description card + place pin on the map
 *
 * ENV (project root .env)
 *   REACT_APP_CV_URL = https://<prediction-endpoint>/customvision/v3.0/Prediction/<PROJECT-ID>/detect/iterations/<Iteration>/image
 *   REACT_APP_CV_KEY = <Prediction-Key>
 */

const CV_URL = process.env.REACT_APP_CV_URL;
const CV_KEY = process.env.REACT_APP_CV_KEY;

// tag aliases coming from your CV model → canonical names that match CSV "name_ko"
const TAG_ALIASES = {
  "63스퀘어": "63스퀘어",
  "63빌딩": "63스퀘어",
  63: "63스퀘어",
  남산타워: "남산서울타워",
  남산서울타워: "남산서울타워",
  N서울타워: "남산서울타워",
  롯데타워: "롯데월드타워",
  롯데월드타워: "롯데월드타워",
  LWT: "롯데월드타워",
};

function prettyProb(p = 0) {
  return (p * 100).toFixed(1) + "%";
}

export default function DocentVision() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [poi, setPoi] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // RAG dataset
  const [csvRows, setCsvRows] = useState([]);

  // Load your CSV (place at public/final_visit_seoul.csv)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          process.env.PUBLIC_URL + "/final_visit_seoul.csv"
        );
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        setCsvRows(parsed.data || []);
      } catch (e) {
        console.error("CSV load error", e);
      }
    })();
  }, []);

  // Build a quick index by kor name for O(1) lookup
  const csvIndexByName = useMemo(() => {
    const m = new Map();
    csvRows.forEach((r) => {
      const key = String(r.name_ko || "").trim();
      if (key) m.set(key, r);
    });
    return m;
  }, [csvRows]);

  // Uploader helpers (paste + drag/drop)
  const dropRef = useRef(null);

  const handlePickedFile = useCallback((f) => {
    setFile(f);
    setPreviewURL(URL.createObjectURL(f));
    setPredictions([]);
    setPoi(null);
    setError("");
  }, []);
  useEffect(() => {
    function onPaste(e) {
      const item = Array.from(e.clipboardData?.items || []).find((i) =>
        i.type?.startsWith("image/")
      );
      if (item) {
        const f = item.getAsFile();
        if (f) handlePickedFile(f);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handlePickedFile]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const stop = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e) => {
      stop(e);
      const f = e.dataTransfer?.files?.[0];
      if (f) handlePickedFile(f);
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((t) =>
      el.addEventListener(t, stop)
    );
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((t) =>
        el.removeEventListener(t, stop)
      );
      el.removeEventListener("drop", onDrop);
    };
  }, [handlePickedFile]);

  // 1) Call Custom Vision
  const detect = useCallback(async () => {
    if (!file) return null;
    if (!CV_URL || !CV_KEY) {
      setError("Custom Vision 설정(.env)이 없습니다");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const resp = await fetch(CV_URL, {
        method: "POST",
        headers: {
          "Prediction-Key": CV_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: buf,
      });
      if (!resp.ok) throw new Error(`Prediction ${resp.status}`);
      const js = await resp.json();
      const list = (js.predictions || [])
        .map((p) => ({
          ...p,
          _area: (p.boundingBox?.width || 0) * (p.boundingBox?.height || 0),
          _ar:
            (p.boundingBox?.height || 0) / (p.boundingBox?.width || 0 || 1e-6),
        }))
        .filter((p) => (p.probability || 0) >= 0.55)
        .filter((p) => p._area >= 0.02 && p._ar >= 1.8); // simple FP guard
      list.sort((a, b) => (b.probability || 0) - (a.probability || 0));
      const best = list[0] || null;
      setPredictions(list);
      return best;
    } catch (e) {
      console.error(e);
      setError(String(e?.message || e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [file]);

  // 2) Map tag → CSV row
  const resolveFromCSV = useCallback(
    (tagName) => {
      if (!tagName) return null;
      const canon = TAG_ALIASES[tagName] || tagName;
      const row = csvIndexByName.get(canon);
      if (!row) return null;
      const lat = parseFloat(row.lat),
        lon = parseFloat(row.lon);
      return {
        id: row.poi_id || canon,
        name: row.name_ko || canon,
        address: row.address_ko || "",
        homepage: row.homepage || row.source || "",
        tel: row.tel || "",
        opening: row.opening || "",
        holiday: row.holiday || "",
        description: row.rag_seed_text_ko || "",
        location: !isNaN(lat) && !isNaN(lon) ? { lat, lng: lon } : null,
        _raw: row,
      };
    },
    [csvIndexByName]
  );

  // 3) Run pipeline
  const run = useCallback(async () => {
    const best = await detect();
    if (!best) return;
    const data = resolveFromCSV(best.tagName);
    if (!data) {
      setError(
        `CSV에서 [${best.tagName}] 매핑 실패 (TAG_ALIASES/CSV 이름 확인)`
      );
      return;
    }
    setPoi(data);
  }, [detect, resolveFromCSV]);

  const pois = useMemo(() => (poi && poi.location ? [poi] : []), [poi]);

  if (isMobile) {
    // mobile layout
    return (
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* Left: Uploader + Predictions + POI Card */}
        <section className="space-y-4">
          <div
            ref={dropRef}
            className="rounded-2xl border border-dashed border-gray-300 p-4 bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">사진 업로드 / 붙여넣기</div>
                <div className="text-xs text-gray-500">
                  파일을 드래그‑앤‑드롭하거나 붙여넣기(Ctrl/⌘+V), 또는 아래
                  버튼으로 촬영/선택
                </div>
              </div>
              <label className="inline-flex items-center px-3 py-2 rounded-lg border bg-gray-50 cursor-pointer text-sm">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handlePickedFile(e.target.files[0])
                  }
                />
                파일 선택/촬영
              </label>
            </div>
            {previewURL && (
              <img
                src={previewURL}
                alt="preview"
                className="mt-3 rounded-xl max-h-80 object-contain w-full"
              />
            )}
            <button
              onClick={run}
              disabled={!file || loading}
              className="mt-3 w-full rounded-xl bg-black text-white py-2 disabled:opacity-50"
            >
              {loading ? "인식 중…" : "인식 + CSV 설명 붙이기"}
            </button>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>

          {/* Predictions list */}
          {predictions?.length > 0 && (
            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold mb-2">예측 결과</div>
              <ul className="text-sm text-gray-700 space-y-1 max-h-40 overflow-auto">
                {predictions.map((p, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{p.tagName}</span>
                    <span className="tabular-nums">
                      {prettyProb(p.probability)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* POI details card (existing component) */}
          <div className="rounded-2xl border bg-white">
            <POIDetails
              poi={poi || null}
              userLocation={null}
              onPlayTTS={() => {
                /* optional TTS hook */
              }}
              isDocentActive={false}
            />
          </div>
        </section>

        {/* Right: Map */}
        <section
          className="rounded-2xl overflow-hidden border bg-white"
          style={{ minHeight: 520 }}
        >
          <LocationMap
            userLocation={null}
            pois={pois}
            selectedPOI={poi}
            onSelectPOI={(p) => setPoi(p)}
          />
        </section>
      </div>
    );
  } else {
    // desktop 용 UI
    return (
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* Left: Uploader + Predictions + POI Card */}
        <section className="space-y-4">
          <div
            ref={dropRef}
            className="rounded-2xl border border-dashed border-gray-300 p-4 bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">사진 업로드 / 붙여넣기</div>
                <div className="text-xs text-gray-500">
                  파일을 드래그‑앤‑드롭하거나 붙여넣기(Ctrl/⌘+V), 또는 아래
                  버튼으로 촬영/선택
                </div>
              </div>
              <label className="inline-flex items-center px-3 py-2 rounded-lg border bg-gray-50 cursor-pointer text-sm">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handlePickedFile(e.target.files[0])
                  }
                />
                파일 선택/촬영
              </label>
            </div>
            {previewURL && (
              <img
                src={previewURL}
                alt="preview"
                className="mt-3 rounded-xl max-h-80 object-contain w-full"
              />
            )}
            <button
              onClick={run}
              disabled={!file || loading}
              className="mt-3 w-full rounded-xl bg-black text-white py-2 disabled:opacity-50"
            >
              {loading ? "인식 중…" : "인식 + CSV 설명 붙이기"}
            </button>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>

          {/* Predictions list */}
          {predictions?.length > 0 && (
            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold mb-2">예측 결과</div>
              <ul className="text-sm text-gray-700 space-y-1 max-h-40 overflow-auto">
                {predictions.map((p, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{p.tagName}</span>
                    <span className="tabular-nums">
                      {prettyProb(p.probability)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* POI details card (existing component) */}
          <div className="rounded-2xl border bg-white">
            <POIDetails
              poi={poi || null}
              userLocation={null}
              onPlayTTS={() => {
                /* optional TTS hook */
              }}
              isDocentActive={false}
            />
          </div>
        </section>

        {/* Right: Map */}
        <section
          className="rounded-2xl overflow-hidden border bg-white"
          style={{ minHeight: 520 }}
        >
          <LocationMap
            userLocation={null}
            pois={pois}
            selectedPOI={poi}
            onSelectPOI={(p) => setPoi(p)}
          />
        </section>
      </div>
    );
  }
}
