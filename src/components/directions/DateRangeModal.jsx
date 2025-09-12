import React, { useMemo, useState } from "react";

function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function monthKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month - 1, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month - 1, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatHuman(d) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function DateRangeModal({ open, start, end, onClose, onApply }) {
  const today = useMemo(() => new Date(), []);
  const initial = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const [cursor, setCursor] = useState(initial);
  const [tempStart, setTempStart] = useState(start || null);
  const [tempEnd, setTempEnd] = useState(end || null);

  if (!open) return null;

  const left = cursor;
  const right = addMonths(cursor, 1);

  const onPick = (date) => {
    if (!date) return;
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (date < tempStart) {
        setTempEnd(tempStart);
        setTempStart(date);
      } else setTempEnd(date);
    }
  };

  const isSame = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const inRange = (d) => {
    if (!tempStart || !tempEnd || !d) return false;
    const ds = d.setHours(0,0,0,0); const s = tempStart.setHours(0,0,0,0); const e = tempEnd.setHours(0,0,0,0);
    return ds > s && ds < e;
  };

  const renderMonth = (dt) => {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const cells = buildMonthMatrix(y, m);
    return (
      <div className="calendar" key={monthKey(dt)}>
        <div className="cal-header">{`${y}년 ${m}월`}</div>
        <div className="grid">
          {["일","월","화","수","목","금","토"].map((d) => (
            <div className="cell dow" key={d}>{d}</div>
          ))}
          {cells.map((d, idx) => {
            const disabled = !d;
            const selected = (d && (isSame(d, tempStart) || isSame(d, tempEnd)));
            const ranged = d && inRange(new Date(d));
            const cls = `cell day${disabled ? " disabled" : ""}${selected ? " selected" : ""}${ranged ? " in-range" : ""}`;
            return (
              <div key={idx} className={cls} onClick={() => !disabled && onPick(new Date(d))}>
                {d ? d.getDate() : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="date-modal-backdrop" onClick={onClose}>
      <div className="date-modal" onClick={(e) => e.stopPropagation()}>
        <div className="head">여행 기간이 어떻게 되시나요?</div>
        <div className="sub">여행 일자는 최대 10일까지 설정 가능합니다.</div>
        <div className="body">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, padding:'0 8px'}}>
            <button onClick={() => setCursor(addMonths(cursor, -1))} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>{"<"}</button>
            <div style={{color:'#475569', fontSize:14}}>{formatHuman(tempStart)} {tempStart ? '~' : ''} {formatHuman(tempEnd)}</div>
            <button onClick={() => setCursor(addMonths(cursor, 1))} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>{">"}</button>
          </div>
          <div className="cal-wrap">
            {renderMonth(left)}
            {renderMonth(right)}
          </div>
        </div>
        <div className="foot">
          <button className="apply" onClick={() => tempStart && tempEnd && onApply(tempStart, tempEnd)} disabled={!tempStart || !tempEnd}>
            선택
          </button>
        </div>
      </div>
    </div>
  );
}

