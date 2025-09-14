import React from "react";
import { motion } from "framer-motion";

export default function ProgressIndicator({ currentStep, totalSteps }) {
  const safeTotal = totalSteps > 0 ? totalSteps : 1;
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-600">진행률</span>
        <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: safeTotal }, (_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i <= currentStep 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600" 
                : "bg-gray-200"
            }`}
            animate={{ scale: i === currentStep ? 1.2 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}
