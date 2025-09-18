import React, { useEffect } from "react";
import { X, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {object} props.course
 * @param {string} [props.course.code]
 * @param {string} [props.course.title]
 * @param {Array<{name: string, lat?: number, lng?: number}>} [props.course.stops]
 * @param {Function} props.onClose
 */
export default function CoursePreviewModal({ open, course, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const stops = Array.isArray(course?.stops) ? course.stops : [];

  const haversineKm = (a, b) => {
    if (!a?.lat || !b?.lat) return 0;
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  const legs = stops.map((_, i) => {
    if (i === stops.length - 1) return null;
    const km = haversineKm(stops[i], stops[i + 1]);
    const minutes = Math.max(5, Math.round((km / 40) * 60)); // 평균 속도 40km/h 기준
    return { km, minutes };
  }).filter(Boolean);

  const totalDistance = legs.reduce((sum, leg) => sum + leg.km, 0);

  return (
    <AnimatePresence>
      {open && course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-800/80 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between p-5 border-b border-slate-700">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-indigo-400">코스 미리보기</p>
                <h2 className="text-xl font-bold text-white truncate pr-4" title={course.title}>
                  {course.title || `코스 ${course.code}`}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  총 {stops.length}개 장소 · 예상 거리 {totalDistance.toFixed(1)} km
                </p>
              </div>
              <button
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={onClose}
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <main className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
              <ol className="relative border-l-2 border-slate-700">
                {stops.map((stop, i) => (
                  <li key={`${course.code}-${i}`} className="mb-4 ml-8">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full -left-4 border-4 border-slate-800 text-slate-300 font-semibold text-sm">
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-slate-100">{stop.name}</h3>
                      {i < stops.length - 1 && legs[i] && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                          <Car className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{legs[i].km.toFixed(1)} km</span>
                          <span className="text-slate-600">·</span>
                          <span>약 {legs[i].minutes}분 이동</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </main>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}