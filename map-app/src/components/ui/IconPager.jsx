import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function IconPager({
  currentPage = 1,
  totalPages = 1,
  onChange,
  className = "",
  ariaPrev = "이전",
  ariaNext = "다음",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handlePrev = () => {
    if (canPrev && onChange) onChange(currentPage - 1);
  };
  const handleNext = () => {
    if (canNext && onChange) onChange(currentPage + 1);
  };

  return (
    <div className={`flex items-center justify-center gap-4 py-4 ${className}`}>
      <button
        onClick={handlePrev}
        disabled={!canPrev}
        className="flex items-center justify-center w-10 h-10 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
        aria-label={ariaPrev}
        title={ariaPrev}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={handleNext}
        disabled={!canNext}
        className="flex items-center justify-center w-10 h-10 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
        aria-label={ariaNext}
        title={ariaNext}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
