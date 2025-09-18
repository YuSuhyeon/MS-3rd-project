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
            className={`w-full text-left p-3 rounded-lg border ${
              selectedPOI?.id === poi.id
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white"
            } hover:bg-gray-50`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900">{poi.name}</div>
              {nears.has(poi._raw?.poi_id || poi.id) && (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  근처
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
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
  // 정확한 아이템 높이 계산:
  // p-3 (12px top/bottom) + 텍스트 높이 + space-y-2 (8px gap) = 약 80px
  const itemHeight = 72;
  const maxHeight = maxRows > 0 ? maxRows * itemHeight : 0;
  const nears = new Set((nearbyPOIs || []).map((n) => n.poi_id || n.id));

  return (
    <div className="p-0 pb-2" style={undefined}>
      <div className="space-y-2">
        {(pois || []).map((poi) => (
          <button
            key={poi.id || poi.name}
            onClick={() => onSelectPOI?.(poi)}
            className={`w-full text-left p-3 rounded-lg border ${
              selectedPOI?.id === poi.id
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white"
            } hover:bg-gray-50`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900">{poi.name}</div>
              {nears.has(poi._raw?.poi_id || poi.id) && (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  근처
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {poi.address || ""}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
