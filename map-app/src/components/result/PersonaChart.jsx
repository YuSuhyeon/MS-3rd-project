import React from "react";

// Simple donut chart using SVG arcs
export default function PersonaChart({ scores = {}, size = 200, stroke = 22 }) {
  const labels = Object.keys(scores);
  const values = labels.map((k) => Math.max(0, Number(scores[k] || 0)));
  const sum = values.reduce((a, b) => a + b, 0) || 1;
  const norm = values.map((v) => v / sum);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2} ${size / 2})`}>
        {/* base circle */}
        <circle r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {norm.map((p, i) => {
          const dash = p * circumference;
          const dashArray = `${dash} ${circumference - dash}`;
          const rot = (offset / circumference) * 360 - 90; // start at top
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
        <text textAnchor="middle" dominantBaseline="central" fontWeight="800" fontSize="18" fill="#111827">
          {topLabel(labels, values)}
        </text>
      </g>
      {/* Legend */}
      <g transform={`translate(10 ${size - 10})`}>
        {labels.map((l, i) => (
          <g key={l} transform={`translate(${i * (size / 3)} 0)`}>
            <rect width="10" height="10" fill={colors[i % colors.length]} rx="2" />
            <text x="14" y="9" fontSize="12" fill="#374151">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function topLabel(labels, values) {
  if (!labels.length) return "-";
  let idx = 0;
  for (let i = 1; i < labels.length; i++) if (values[i] > values[idx]) idx = i;
  return labels[idx];
}
