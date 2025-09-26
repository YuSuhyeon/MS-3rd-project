import React from "react";
import { Badge } from "components/ui/badge";

export default function POIList({
  pois,
  selectedPOI,
  nearbyPOIs,
  userLocation,
  onSelectPOI,
  maxRows = 0,
}) {
  // 정확한 아이템 높이 계산:
  // p-3 (12px top/bottom) + 텍스트 높이 + space-y-2 (8px gap) = 약 80px
  const itemHeight = 72;
  const maxHeight = maxRows > 0 ? maxRows * itemHeight : 0;
  const nears = new Set((nearbyPOIs || []).map((n) => n.poi_id || n.id));

  return (
    <div
      className="p-0"
      style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
    >
      <div className="space-y-2">
        {(pois || []).map((poi) => (
          <button
            key={poi.id || poi.name}
            onClick={() => onSelectPOI?.(poi)}
            className={`w-full text-left p-3 rounded-xl border backdrop-blur-sm transition-transform hover:-translate-y-0.5 shadow hover:shadow-purple-500/10 ${
              selectedPOI?.id === poi.id
                ? "border-purple-400 bg-black/50"
                : "border-purple-500/20 bg-black/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-100">{poi.name}</div>
              {nears.has(poi._raw?.poi_id || poi.id) && (
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                  근처
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {poi.address || ""}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function POIListJH({
  pois,
  selectedPOI,
  nearbyPOIs,
  userLocation,
  onSelectPOI,
  maxRows = 0,
}) {
  // 모바일용 아이템 높이 계산 (더 작게):
  // p-2 (8px top/bottom) + 텍스트 높이 + space-y-1 (4px gap) = 약 60px
  const itemHeight = 60;
  const maxHeight = maxRows > 0 ? maxRows * itemHeight : 0;
  const nears = new Set((nearbyPOIs || []).map((n) => n.poi_id || n.id));

  return (
    <div className="p-0 pb-2" style={undefined}>
      <div className="space-y-1">
        {(pois || []).map((poi) => (
          <button
            key={poi.id || poi.name}
            onClick={() => onSelectPOI?.(poi)}
            className={`w-full text-left p-2 rounded-lg border backdrop-blur-sm transition-transform hover:-translate-y-0.5 shadow hover:shadow-purple-500/10 ${
              selectedPOI?.id === poi.id
                ? "border-purple-400 bg-black/50"
                : "border-purple-500/20 bg-black/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-100 text-sm">
                {poi.name}
              </div>
              {nears.has(poi._raw?.poi_id || poi.id) && (
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">
                  근처
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {poi.address || ""}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
