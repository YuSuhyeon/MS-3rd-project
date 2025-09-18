import React from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Plus, X, GripVertical, MapPin } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

export default function WaypointList({ waypoints, onAdd, onRemove, onUpdate, onReorder }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">경유지</label>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={waypoints.length >= 5}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          추가 ({waypoints.length}/5)
        </Button>
      </div>

      <Reorder.Group axis="y" values={waypoints} onReorder={onReorder} className="space-y-3">
        <AnimatePresence>
          {waypoints.map((waypoint, index) => (
            <Reorder.Item key={waypoint.id} value={waypoint}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <div className="flex-1">
                  <Input
                    placeholder={`경유지 ${index + 1}`}
                    value={waypoint.location}
                    onChange={(e) => onUpdate(waypoint.id, e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(waypoint.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {waypoints.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">경유지를 추가해보세요</p>
        </div>
      )}
    </div>
  );
}
