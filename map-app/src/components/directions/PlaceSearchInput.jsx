import React, { useEffect, useRef, useState } from "react";
import { ensureKakaoMaps } from "../../kakaoMap";

export default function PlaceSearchInput({
  value = "",
  onChange,
  onSelect,
  placeholder = "장소를 입력하세요",
  className = "",
  appearance = "light",
  inputClassName = "",
  dropdownClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const lastQueryRef = useRef("");
  // Support uncontrolled usage when onChange is not provided
  const isControlled = typeof onChange === "function";
  const [innerValue, setInnerValue] = useState(value || "");
  useEffect(() => {
    if (!isControlled) setInnerValue(value || "");
  }, [value, isControlled]);

  // Kakao SDK 로딩 보장
  useEffect(() => {
    let mounted = true;
    const key =
      process.env.REACT_APP_KAKAO_API_KEY || window.REACT_APP_KAKAO_API_KEY;
    ensureKakaoMaps(key)
      .then(() => {
        if (!mounted) return;
        setReady(true);
        if (lastQueryRef.current) {
          search(lastQueryRef.current);
        }
      })
      .catch((e) => console.error("Kakao SDK load failed", e));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (q) => {
    lastQueryRef.current = q;
    const kakaoAvailable =
      typeof window !== "undefined" &&
      !!(window.kakao && window.kakao.maps && window.kakao.maps.services);
    if (!kakaoAvailable || !q || q.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      setLoading(false);
      if (
        status === window.kakao.maps.services.Status.OK &&
        Array.isArray(data)
      ) {
        const mapped = data.slice(0, 10).map((d) => ({
          id: d.id || d.place_id || `${d.x},${d.y}`,
          name: d.place_name || d.placeName || q,
          address: d.address_name || "",
          roadAddress: d.road_address_name || "",
          lat: parseFloat(d.y),
          lng: parseFloat(d.x),
          category: d.category_name || d.category_group_name || "",
          categoryGroupCode: d.category_group_code || "",
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
    if (isControlled) {
      onChange && onChange(q);
    } else {
      setInnerValue(q);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 250);
  };

  const handleSelect = (item) => {
    if (!isControlled) {
      setInnerValue(item?.name || "");
    }
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
      if (activeIdx >= 0 && activeIdx < results.length)
        handleSelect(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputBaseClass =
    appearance === "dark"
      ? "w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-purple-400/70 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
      : "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const dropdownBaseClass =
    appearance === "dark"
      ? "absolute z-50 mt-1 w-full max-h-80 overflow-auto rounded-lg border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur"
      : "absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-80 overflow-auto";

  const optionBaseClass =
    appearance === "dark"
      ? "w-full text-left px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800/70"
      : "w-full text-left px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50";

  const optionActiveClass =
    appearance === "dark" ? "bg-slate-800/80" : "bg-indigo-50";

  const optionTitleClass =
    appearance === "dark"
      ? "font-semibold text-slate-100 truncate"
      : "font-medium text-slate-900 truncate";

  const optionSubtitleClass =
    appearance === "dark"
      ? "text-xs text-slate-300 truncate"
      : "text-xs text-slate-500 truncate";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        value={isControlled ? value : innerValue}
        onChange={onInputChange}
        onFocus={() => {
          const v = isControlled ? value : innerValue;
          if (v && v.length >= 1) search(v);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`${inputBaseClass} ${inputClassName}`.trim()}
      />
      {open && (
        <div className={`${dropdownBaseClass} ${dropdownClassName}`.trim()}>
          {loading && (
            <div className="p-3 text-sm text-slate-500">검색 중…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-3 text-sm text-slate-500">
              검색 결과가 없습니다
            </div>
          )}
          {!loading &&
            results.map((item, idx) => (
              <button
                type="button"
                key={item.id || idx}
                onClick={() => handleSelect(item)}
                className={`${optionBaseClass} ${
                  idx === activeIdx ? optionActiveClass : ""
                }`}
              >
                <div className={optionTitleClass}>{item.name}</div>
                {(item.roadAddress || item.address) && (
                  <div className={optionSubtitleClass}>
                    {item.roadAddress || item.address}
                  </div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
