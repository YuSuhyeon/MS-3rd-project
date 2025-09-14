import React, { useState } from "react";

export default function StaySelectorPanel({ days, tripStart, onOpenStayDates }) {
  const hotels = [
    { name: '코리아나호텔' },
    { name: '서울신라호텔' },
    { name: 'Grand Hyatt Seoul' },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <input className="border rounded px-3 py-2 flex-1" placeholder="숙소명을 입력하세요" />
          <button className="border rounded px-3 py-2">추천 숙소</button>
        </div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {hotels.map((h, idx) => (
            <div key={idx} className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{h.name}</div>
                <div className="text-xs text-slate-500 truncate">대한민국 서울특별시</div>
              </div>
              <button className="px-3 py-2 rounded-lg border" onClick={() => onOpenStayDates(h)}>예약하기</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-slate-500 mb-1">일차별 숙소 요약</div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {days.map((d, i) => (
            <div key={d.id} className="border rounded-xl p-2 flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white grid place-items-center text-xs font-bold">{i+1}</div>
              <div className="flex-1 truncate">{d.endLocation || '미정'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

