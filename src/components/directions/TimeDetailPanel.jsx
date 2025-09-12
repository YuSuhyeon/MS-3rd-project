import React from "react";

export default function TimeDetailPanel({ days, onChangeDayTime, onDone }) {
  const totalMinutes = days.reduce((acc, d) => {
    const toMin = (hhmm) => {
      const [h, m] = String(hhmm || "0:0").split(":");
      return parseInt(h || 0, 10) * 60 + parseInt(m || 0, 10);
    };
    const s = toMin(d.startTime || "09:00");
    const e = toMin(d.endTime || "22:00");
    return acc + Math.max(0, e - s);
  }, 0);
  const sumHours = Math.floor(totalMinutes / 60);
  const sumMin = totalMinutes % 60;
  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="text-sm text-slate-600 mb-2">
        여행시간 상세설정 <span className="font-semibold">총 {sumHours}시간 {String(sumMin).padStart(2, "0")}분</span>
      </div>
      <div className="space-y-2">
        {days.map((d, i) => (
          <div key={d.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {i + 1}일차
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-slate-500">시작시간</div>
              <input
                type="time"
                value={d.startTime || "09:00"}
                onChange={(e) => onChangeDayTime(i, { startTime: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <span className="mx-1">→</span>
              <div className="text-slate-500">종료시간</div>
              <input
                type="time"
                value={d.endTime || "22:00"}
                onChange={(e) => onChangeDayTime(i, { endTime: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right">
        <button onClick={onDone} className="px-4 py-2 rounded-lg bg-black text-white">시간 설정 완료</button>
      </div>
    </div>
  );
}

