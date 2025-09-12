import React, { useMemo, useState } from "react";

export default function StayDatesModal({ open, title, days, start, onClose, onApply, thumbnailUrl }) {
  const [selected, setSelected] = useState(() => days.map(() => false));
  const fmtMd = (d) => {
    const m = String((d.getMonth() + 1)).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${m}.${dd}`;
  };
  const dayDates = useMemo(() => {
    if (!start) return [];
    return days.map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [days, start]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-bold text-center mb-1">숙박하실 날짜를 선택해주세요.</div>
        <div className="text-slate-500 text-xs text-center mb-3">숙소 선택에서 요일은 별개 체크 선택이 가능합니다.</div>
        <div className="text-xl font-extrabold text-center mb-4">{title || '숙소'}</div>
        <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
          {dayDates.map((d, i) => (
            <button
              key={i}
              className={`px-3 py-2 rounded-2xl border ${selected[i] ? 'bg-violet-600 text-white border-violet-600' : 'bg-white'}`}
              onClick={() => setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
            >
              {fmtMd(d)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button className="px-3 py-2 rounded-xl border" onClick={() => setSelected(days.map(() => true))}>전체 선택</button>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={onClose}>취소</button>
            <button className="px-3 py-2 rounded-xl bg-black text-white" onClick={() => onApply(selected)}>완료</button>
          </div>
        </div>
      </div>
    </div>
  );
}

