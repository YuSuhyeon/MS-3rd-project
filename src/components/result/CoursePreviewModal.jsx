import React, { useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

/**
 * @param {object} props
 * @param {boolean} props.open 
 * @param {object} props.course
 * @param {string} props.course.code
 * @param {string} props.course.title
 * @param {Array<object>} props.course.stops
 * @param {string} props.course.stops.name
 * @param {number} props.course.stops.lat
 * @param {number} props.course.stops.lng
 * @param {Function} props.onClose
 */
export default function CoursePreview({ open, course, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !course) {
    return null;
  }

  const stops = Array.isArray(course?.stops) ? course.stops : [];
  
  const startPoint = stops[0]?.name || '';
  const endPoint = stops.length > 1 ? stops[stops.length - 1]?.name : '';
  const displayTitle = startPoint && endPoint 
    ? `${startPoint} → ${endPoint}` 
    : (course.title || `코스 ${course.code}`);

  const haversineKm = (a, b) => {
    if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') return 0;
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  const legs = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const km = haversineKm(a, b);
    const minutes = Math.max(1, Math.round((km / 4.5) * 60));
    legs.push({ km, minutes });
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between p-5 border-b border-slate-200">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">코드 {course.code}</p>
            <h2 className="text-xl font-bold text-slate-800 truncate pr-4">{displayTitle}</h2>
          </div>
          <button 
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" 
            onClick={onClose} 
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="p-6 max-h-[70vh] overflow-y-auto">
          <ol className="relative border-l-2 border-orange-200">
            {stops.map((stop, i) => (
              <React.Fragment key={`${course.code}-${i}`}>
                <li className="mb-6 ml-10">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 border-2 border-orange-300 text-orange-600 font-bold">
                    {i + 1}
                  </span>
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg grid place-items-center ${i === 0 ? 'bg-orange-50' : 'bg-slate-100'}`}>
                        <span className={`font-bold ${i === 0 ? 'text-orange-500' : 'text-slate-600'}`}>
                          {i + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{stop.name}</p>
                        {typeof stop.lat === 'number' && typeof stop.lng === 'number' && (
                          <p className="text-xs text-slate-500">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>

                {i < stops.length - 1 && legs[i] && (
                  <li className="mb-6 ml-10">
                    <div className="flex items-center gap-2 text-sm text-slate-600 pt-1">
                      <ArrowRight className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">
                        {legs[i].km.toFixed(1)} km
                        <span className="text-slate-400 mx-1.5">·</span>
                        약 {legs[i].minutes}분
                      </span>
                    </div>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </main>
      </div>
    </div>
  );
}