// components/ui/pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

const pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 표시할 페이지 번호들 계산
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {/* 이전 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {/* 페이지 번호들 */}
      {showPageNumbers && (
        <div className="flex space-x-1">
          {/* 첫 페이지 표시 */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 rounded-lg text-sm font-semibold transition-all bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                  ...
                </span>
              )}
            </>
          )}

          {/* 보이는 페이지들 */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                currentPage === page
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}

          {/* 마지막 페이지 표시 */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="w-8 h-8 flex items-center justify-center text-gray-500">
                  ...
                </span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="w-8 h-8 rounded-lg text-sm font-semibold transition-all bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* 다음 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default pagination;
