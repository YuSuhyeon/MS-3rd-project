import React from "react";
import { motion } from "framer-motion";

/**
 * A stylish, dark-themed progress indicator designed to show step-based progress.
 * It features a clean layout with descriptive text and a smooth gradient animation.
 */
export default function ProgressIndicator({ currentStep, totalSteps }) {
  // Calculate progress percentage, ensuring no division by zero.
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    // The main container provides spacing.
    <div className="w-full mb-8">
      {/* 
        This top section provides context. Instead of a generic label, it has a
        descriptive title on the left and a clear step counter on the right.
        The text color is subtle to not overpower the main question.
      */}
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