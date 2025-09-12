import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function RecentRoutes({ routes, onLoadRoute }) {
  if (routes.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          최근 경로
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence>
            {routes.map((route) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => onLoadRoute(route)}
                  className="w-full justify-start text-left p-3 h-auto hover:bg-blue-50"
                >
                  <div>
                    <div className="flex items-center gap-1 font-medium text-sm">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {route.name}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(route.timestamp), "MM/dd HH:mm")}
                    </p>
                    {route.waypoints.length > 0 && (
                      <p className="text-xs text-purple-600 mt-1">
                        경유지 {route.waypoints.length}개
                      </p>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
