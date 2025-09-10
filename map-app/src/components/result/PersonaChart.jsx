import React from "react";

export default function PersonaChart({ scores = {}, size = 200, stroke = 22, maxLegend = 4 }) {
  const labels = Object.keys(scores || {});
  const values = labels.map((k) => Math.max(0, Number(scores[k] || 0)));
  const sum = values.reduce((a, b) => a + b, 0) || 1;
  const norm = values.map((v) => v / sum);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

  const entries = labels
    .map((l, i) => ({ label: l, value: values[i], percent: Math.round((values[i] / sum) * 100), color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);

  // 중앙 라벨
  const top = entries[0]?.label || "-";

  // 도넛 조각 누적 회전 오프셋
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full overflow-hidden">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <g transform={`translate(${size / 2} ${size / 2})`}>
          <circle r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
          {norm.map((p, i) => {
            const dash = p * circumference;
            const dashArray = `${dash} ${circumference - dash}`;
            const rot = (offset / circumference) * 360 - 90;
            const color = colors[i % colors.length];
            offset += dash;
            return (
              <g key={labels[i]} transform={`rotate(${rot})`}>
                <circle
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={stroke}
                  strokeDasharray={dashArray}
                  strokeLinecap="butt"
                />
              </g>
            );
          })}
          <text textAnchor="middle" dominantBaseline="central" fontWeight="800" fontSize="16" fill="#111827">
            {top}
          </text>
        </g>
      </svg>
      <div className="w-full sm:min-w-[160px] space-y-2 min-w-0">
        {entries.slice(0, maxLegend).map((e) => (
          <div key={e.label} className="flex items-center justify-between gap-3 text-sm w-full">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: e.color }} />
              <span className="text-slate-800 truncate" title={e.label}>{e.label}</span>
            </div>
            <span className="text-slate-500 tabular-nums">{e.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}