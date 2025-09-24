"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Globe,
  Star,
  Heart,
  Share2,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TourDetail = ({ tourId, onBack, onLikeToggle, isLiked = false }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // i18n.js에서 투어 데이터 가져오기
  const tourData = t(`tourDetail.data.${tourId}`, { returnObjects: true });
  const tourProduct = t(`tourDetail.products.${tourId}`, {
    returnObjects: true,
  });

  // 데이터가 객체인지 확인
  const isValidData =
    typeof tourData === "object" &&
    tourData !== null &&
    !Array.isArray(tourData);
  const isValidProduct =
    typeof tourProduct === "object" &&
    tourProduct !== null &&
    !Array.isArray(tourProduct);

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isValidData ? tourData.title : "Tour Detail",
          text: isValidData ? tourData.subtitle : "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isValidData || !isValidProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            투어 정보를 불러올 수 없습니다
          </h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">뒤로가기</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-white hover:text-purple-300 transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 transition-colors ${
                  isBookmarked
                    ? "text-yellow-400"
                    : "text-white hover:text-yellow-300"
                }`}
              >
                <Heart
                  size={20}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 투어 헤더 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">
                  {tourData.title}
                </h1>
                <p className="text-xl text-gray-300">{tourData.subtitle}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{tourData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{tourData.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{tourData.groupSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <span>{tourData.language}</span>
                  </div>
                </div>

                {/* 파트너십 정보 */}
                {tourData.partnership && (
                  <div className="flex flex-wrap gap-2">
                    {Object.values(tourData.partnership).map(
                      (partner, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                        >
                          {partner}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 탭 네비게이션 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-purple-500/30"
            >
              <div className="flex border-b border-gray-700">
                {[
                  { key: "overview", label: "개요" },
                  { key: "itinerary", label: "일정" },
                  { key: "details", label: "상세정보" },
                  { key: "inclusions", label: "포함사항" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.key
                        ? "text-purple-300 border-b-2 border-purple-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          투어 소개
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {tourProduct.description}
                        </p>
                      </div>

                      {tourData.specialFeatures && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">
                            특별 기능
                          </h4>
                          <ul className="space-y-2">
                            {tourData.specialFeatures.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 text-gray-300"
                              >
                                <CheckCircle
                                  size={16}
                                  className="text-green-400 mt-0.5 flex-shrink-0"
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "itinerary" && tourData.itinerary && (
                    <motion.div
                      key="itinerary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        일정표
                      </h3>
                      <div className="space-y-4">
                        {tourData.itinerary.map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                          >
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-sm font-bold text-purple-300">
                                {item.time}
                              </div>
                              {item.duration && (
                                <div className="text-xs text-gray-500">
                                  {item.duration}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">
                                {item.location}
                              </h4>
                              <p className="text-gray-300 text-sm mt-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "details" && tourData.detailSections && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        상세 정보
                      </h3>
                      {tourData.detailSections.map((section, index) => (
                        <div key={index} className="space-y-4">
                          <button
                            onClick={() => toggleSection(`detail-${index}`)}
                            className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors"
                          >
                            <h4 className="text-lg font-semibold text-white text-left">
                              {section.title}
                            </h4>
                            {expandedSections[`detail-${index}`] ? (
                              <ChevronUp
                                size={20}
                                className="text-purple-300"
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                                className="text-purple-300"
                              />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedSections[`detail-${index}`] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                                  <p className="text-gray-300 leading-relaxed">
                                    {section.text}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "inclusions" && (
                    <motion.div
                      key="inclusions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          포함사항
                        </h3>
                        {tourData.inclusions && (
                          <ul className="space-y-2">
                            {tourData.inclusions.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 text-gray-300"
                              >
                                <CheckCircle
                                  size={16}
                                  className="text-green-400 mt-0.5 flex-shrink-0"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {tourData.exclusions && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">
                            불포함사항
                          </h4>
                          <ul className="space-y-2">
                            {tourData.exclusions.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 text-gray-300"
                              >
                                <XCircle
                                  size={16}
                                  className="text-red-400 mt-0.5 flex-shrink-0"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 예약 카드 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 sticky top-24"
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    ₩{tourData.price || "150,000"}
                  </div>
                  <div className="text-sm text-gray-400">1인당</div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => onLikeToggle && onLikeToggle(tourId)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      isLiked
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                    }`}
                  >
                    <Heart
                      size={16}
                      className="inline mr-2"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    {isLiked ? "좋아요 취소" : "좋아요"}
                  </button>

                  <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200">
                    <Calendar size={16} className="inline mr-2" />
                    예약하기
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  무료 취소 가능 (투어 시작 24시간 전까지)
                </div>
              </div>
            </motion.div>

            {/* 리뷰 섹션 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-white">4.8</span>
                  <span className="text-gray-400">(127 리뷰)</span>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-6">
                        {rating}
                      </span>
                      <Star
                        size={12}
                        className="text-yellow-400 fill-current"
                      />
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              rating === 5
                                ? 85
                                : rating === 4
                                ? 10
                                : rating === 3
                                ? 3
                                : rating === 2
                                ? 1
                                : 1
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {rating === 5
                          ? 85
                          : rating === 4
                          ? 10
                          : rating === 3
                          ? 3
                          : rating === 2
                          ? 1
                          : 1}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
