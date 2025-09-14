import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lightweight Kakao Places autocomplete input.
 * Props:
 *  - value: string (controlled input value)
 *  - onChange: (text: string) => void (optional, for free typing)
 *  - onSelect: (place: { name, lat, lng, address, roadAddress, id }) => void
 *  - placeholder: string
 *  - className: string
 */
export default function PlaceSearchInput({
  value = "",
  onChange,
  onSelect,
  placeholder = "장소를 입력하세요",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Detect kakao availability
  const kakaoReady = typeof window !== "undefined" && !!(window.kakao && window.kakao.maps && window.kakao.maps.services);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (q) => {
    if (!kakaoReady || !q || q.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      setLoading(false);
      if (status === window.kakao.maps.services.Status.OK && Array.isArray(data)) {
        const mapped = data.slice(0, 10).map((d) => ({
          id: d.id || d.place_id || `${d.x},${d.y}`,
          name: d.place_name || d.placeName || q,
          address: d.address_name || "",
          roadAddress: d.road_address_name || "",
          lat: parseFloat(d.y),
          lng: parseFloat(d.x),
        }));
        setResults(mapped);
        setOpen(true);
        setActiveIdx(mapped.length ? 0 : -1);
      } else {
        setResults([]);
        setOpen(true);
        setActiveIdx(-1);
      }
    });
  };

  const onInputChange = (e) => {
    const q = e.target.value;
    onChange && onChange(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 250);
  };

  const handleSelect = (item) => {
    onSelect && onSelect(item);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => (p + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < results.length) handleSelect(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        value={value}
        onChange={onInputChange}
        onFocus={() => value && value.length >= 1 && search(value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-80 overflow-auto">
          {loading && (
            <div className="p-3 text-sm text-slate-500">검색 중…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-3 text-sm text-slate-500">검색 결과가 없습니다</div>
          )}
          {!loading && results.map((item, idx) => (
            <button
              type="button"
              key={item.id || idx}
              onClick={() => handleSelect(item)}
              className={`block w-full text-left px-3 py-2 hover:bg-indigo-50 ${idx === activeIdx ? "bg-indigo-50" : ""}`}
            >
              <div className="font-medium text-slate-900 truncate">{item.name}</div>
              {(item.roadAddress || item.address) && (
                <div className="text-xs text-slate-500 truncate">{item.roadAddress || item.address}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

