import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function RecommendationCard({ destination, index }) {
  const defaultImages = [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1578853286688-6e632c6c27b5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop"
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.1 }}>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
        <div className="relative h-48 overflow-hidden">
          <img src={destination.image_url || defaultImages[index]} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-gray-900 shadow-md"><Star className="w-3 h-3 mr-1 text-yellow-500" />AI 추천</Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><MapPin className="w-5 h-5 text-blue-500" />{destination.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4 leading-relaxed">{destination.description}</p>
          <div className="flex flex-wrap gap-2">
            {destination.activities?.map((activity, i) => (
              <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">{activity}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

