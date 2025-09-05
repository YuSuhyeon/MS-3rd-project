import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Calendar, MapPin, DollarSign, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function ItineraryHeader({ itinerary, onRegenerate, isGenerating }) {
  const totalCost = itinerary?.days?.reduce((total, day) => total + day.activities.reduce((d, a) => d + (a.cost_estimate || 0), 0), 0) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">{itinerary.itinerary_name || "나의 여행 일정"}</CardTitle>
              <div className="flex items-center gap-4 text-orange-100">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{itinerary.destination || "목적지"}</span></div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{itinerary.total_days || 0}일 여행</span></div>
              </div>
            </div>
            <Button variant="ghost" onClick={onRegenerate} disabled={isGenerating} className="bg-white/20 hover:bg-white/30 text-white">
              {isGenerating ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />생성 중...</>) : (<><Sparkles className="w-4 h-4 mr-2" />새 일정 생성</>)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 text-white border-white/30 rounded-md px-3 py-1 inline-flex items-center"><DollarSign className="w-3 h-3 mr-1" />예상 총 비용: {totalCost.toLocaleString()}원</div>
            {itinerary.travel_style && (
              <div className="bg-white/20 text-white border-white/30 rounded-md px-3 py-1 inline-flex items-center">여행 스타일: {itinerary.travel_style}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
