import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

export default function CourseTimelineCard({ course, index = 0, onSelect }) {
  const stops = Array.isArray(course?.stops) ? course.stops : [];
  const colors = ["from-indigo-500 to-sky-500", "from-fuchsia-500 to-pink-500", "from-emerald-500 to-teal-500"];
  const grad = colors[index % colors.length];

  const haversineKm = (a, b) => {
    if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') return 0;
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  const legs = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const km = haversineKm(a, b);
    const minutes = Math.max(1, Math.round((km / 4.5) * 60)); // 4.5km/h 기준 추정
    legs.push({ km, minutes });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.03 * index }}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base truncate whitespace-nowrap">
              {course?.title || `코스 ${course?.code || index + 1}`}
            </CardTitle>
            <span className={`text-xs font-semibold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${grad} whitespace-nowrap`}>
              추천 코스
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pl-16">
            {/* 세로 타임라인 라인 */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-orange-200" />
            <ol className="space-y-4">
              {stops.map((s, i) => (
                <React.Fragment key={`${course?.key || index}-${i}`}>
                  <li className="relative flex items-center min-h-[72px]"> {/* flex items-center 추가 */}
                    {/* 방문 순서 핀: 라인 정중앙 정렬 (수평/수직) */}
                    <div className={`absolute z-10 left-8 -translate-x-1/2 w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold text-orange-700 bg-white ring-2 ${i === 0 ? 'ring-orange-300' : 'ring-slate-300'} shadow`}>{i + 1}</div>
                    <div className="p-3 rounded-2xl border bg-white/95 backdrop-blur-sm ml-[4.5rem] flex-1"> {/* ml-spacing, flex-1 추가 */}
                      <div className="flex items-center gap-3">
                        {(() => {
                          const img = s?.thumbnail || s?.image || s?.img || s?.photo || s?.picture;
                          return img ? (
                            <img src={img} alt={s?.name || 'stop'} className="w-10 h-10 object-cover rounded-lg border" onError={(e)=>{e.currentTarget.style.display='none';}} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-500 text-xs font-semibold">
                              {s?.name?.slice(0, 2) || <MapPin className="w-4 h-4" />}
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate whitespace-nowrap">{s?.name || "장소"}</div>
                          {typeof s?.lat === "number" && typeof s?.lng === "number" && (
                            <div className="text-[11px] text-slate-500 whitespace-nowrap">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                  {i < stops.length - 1 && (
                    <li className="relative flex items-center py-1"> {/* flex items-center 추가 */}
                      {/* 점선 원 + 이동 정보: 라인 중앙에 정확히 정렬 */}
                      <div className="absolute z-0 left-8 -translate-x-1/2 w-7 h-7 rounded-full border-2 border-dashed border-orange-300 grid place-items-center text-orange-400 bg-white">+</div>
                      <div className="ml-[4.5rem] flex items-center gap-2 text-[12px] text-slate-600"> {/* ml-spacing 추가 */}
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                        <span className="whitespace-nowrap">{legs[i]?.km ? `${legs[i].km.toFixed(1)} km · 약 ${legs[i].minutes}분` : '이동'}</span>
                      </div>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ol>
          </div>

          <div className="pt-4">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full" onClick={onSelect}>
              경로 편집
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
