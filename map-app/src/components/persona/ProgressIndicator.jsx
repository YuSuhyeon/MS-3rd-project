import React from "react";
import { motion } from "framer-motion";

export default function ProgressIndicator({ currentStep, totalSteps }) {
  const progressPercentage =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
        <span>Your Travel Style</span>
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
