"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Bookmark, Eye } from "lucide-react";
import { tourDetailData } from "../utils/mockTourData";

const TourCard = ({ item, onDetailClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryInfo = (category) => {
    switch (category) {
      case "location":
        return {
          emoji: "📍",
          label: "촬영지",
          gradient: "from-purple-500 to-pink-500",
        };
      case "goods":
        return {
          emoji: "🛍️",
          label: "굿즈",
          gradient: "from-pink-500 to-fuchsia-500",
        };
      case "experience":
        return {
          emoji: "🎭",
          label: "체험",
          gradient: "from-indigo-500 to-purple-500",
        };
      case "food":
        return {
          emoji: "🍜",
          label: "먹방",
          gradient: "from-orange-500 to-pink-500",
        };
      default:
        return {
          emoji: "🎵",
          label: "기타",
          gradient: "from-gray-500 to-gray-600",
        };
    }
  };

  const categoryInfo = getCategoryInfo(item.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl group"
    >
      {/* 이미지 섹션 */}
      <div className="relative overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 카테고리 뱃지 */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryInfo.gradient} backdrop-blur-sm`}
          >
            {categoryInfo.emoji} {categoryInfo.label}
          </span>
        </div>

        {/* 북마크 버튼 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isBookmarked
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* 파트너십 & 평점 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm font-medium">
              {item.partnership}
            </span>
            <div className="flex items-center gap-1 text-white text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{item.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="p-6">
        {/* K-pop 그룹과 리뷰 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {item.kpopGroup}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">리뷰 {item.reviews}개</span>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* 위치 정보 */}
        {item.location && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>
        )}

        {/* 비즈니스 성과 메트릭 */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">ROI</div>
            <div className="text-sm font-bold text-green-600">{item.roi}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">신규고객</div>
            <div className="text-sm font-bold text-blue-600">
              {item.newCustomers}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">브랜드가치</div>
            <div className="text-sm font-bold text-purple-600">
              {item.brandValue}
            </div>
          </div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 가격과 액션 버튼 */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {item.price}
          </span>

          <div className="flex items-center gap-2">
            {/* 좋아요 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isLiked
                  ? "bg-red-50 text-red-500 shadow-md"
                  : "hover:bg-gray-50 text-gray-400"
              }`}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>

            {/* 자세히 보기 버튼 */}
            <button
              onClick={() => onDetailClick(item)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
              aria-label={`${item.title} 상세보기`}
            >
              <Eye className="w-4 h-4" />
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
