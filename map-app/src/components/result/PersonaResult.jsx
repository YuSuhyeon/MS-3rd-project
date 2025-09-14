import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonaResult({ analysisResult }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="w-6 h-6" />① 당신은 {analysisResult.persona_type}입니다</CardTitle>
          </CardHeader>
          <CardContent><p className="text-blue-100 text-lg leading-relaxed">{analysisResult.persona_description}</p></CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-white shadow-xl h-full">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-gray-900"><Lightbulb className="w-6 h-6 text-yellow-500" />② AI가 이렇게 분석한 이유</CardTitle></CardHeader>
          <CardContent><p className="text-gray-700 text-lg leading-relaxed">{analysisResult.analysis_reason}</p></CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

