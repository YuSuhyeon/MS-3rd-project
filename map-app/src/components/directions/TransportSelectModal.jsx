import React from "react";

export default function TransportSelectModal({ open, onClose, onChooseMode, onGenerate }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-bold mb-1">이동수단 선택</div>
        <div className="text-slate-500 text-sm mb-3">여행 시 이용하실 이동수단을 선택해주세요.</div>
        <div className="text-slate-600 text-sm mb-3">버스나 지하철, 기차 등을 이용</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="border rounded-xl p-4 text-left hover:bg-slate-50" onClick={() => onChooseMode('TRANSIT')}>
            <div className="font-semibold">대중교통</div>
            <div className="text-xs text-slate-500">버스/지하철</div>
          </button>
          <button className="border rounded-xl p-4 text-left hover:bg-slate-50" onClick={() => onChooseMode('CAR')}>
            <div className="font-semibold">승용차</div>
            <div className="text-xs text-slate-500">차량 이동</div>
          </button>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="px-3 py-2 rounded-lg border" onClick={onClose}>닫기</button>
          <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white" onClick={onGenerate}>일정생성</button>
        </div>
      </div>
    </div>
  );
}

