import React, { useEffect, useState } from "react";

export default function PlaceSelectorPanel({
  activeDay,
  days,
  onAddPlace,
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchList = async (keyword = "") => {
    try {
      setLoading(true);
      const url = keyword ? `/api/seoul-data?q=${encodeURIComponent(keyword)}` : "/api/seoul-data";
      const r = await fetch(url);
      const j = await r.json();
      if (j && Array.isArray(j.items)) setItems(j.items.slice(0, 50));
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { fetchList(""); }, []);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="장소명을 입력하세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchList(q)}
          />
          <button className="border rounded px-3 py-2" onClick={() => fetchList(q)}>검색</button>
        </div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {loading && <div className="text-sm text-slate-500">불러오는 중…</div>}
          {!loading && items.map((it, idx) => (
            <div key={`${it.id || idx}`} className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{it.name}</div>
                <div className="text-xs text-slate-500 truncate">{it.addr || ''}</div>
              </div>
              <button
                className="px-3 py-2 rounded-lg border"
                onClick={() => onAddPlace(activeDay, it)}
              >
                추가
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-slate-500 mb-1">선택된 장소 (현재 {activeDay + 1}일차)</div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {((days[activeDay] && days[activeDay].waypoints) || []).map((w, i) => (
            <div key={`${days[activeDay].id}-sel-${i}`} className="border rounded-xl p-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white grid place-items-center text-xs font-bold">{i+1}</div>
              <div className="flex-1 truncate text-sm">{w.name}</div>
            </div>
          ))}
          {(!days[activeDay] || (days[activeDay].waypoints || []).length === 0) && (
            <div className="text-xs text-slate-500">아직 선택된 장소가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

