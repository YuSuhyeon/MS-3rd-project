import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Calendar,
  Users,
  Clock,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Award,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Bookmark,
  Play,
  Camera,
  Gift,
  X,
  Sparkles,
} from "lucide-react";

// NeonTheme 컴포넌트들을 import
import {
  BackgroundEffect,
  NeonCard,
  NeonButton,
  GradientText,
} from "../components/ui/NeonTheme";

import { tourDetailData } from "../utils/mockTourData";

//discount 홍보 팝업 컴포넌트
const OfferPopup = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 10, seconds: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      // 10:00부터 시작해서 현재까지 경과된 총 초
      let elapsedSeconds = 0;
      if (currentHour >= 10) {
        elapsedSeconds =
          (currentHour - 10) * 3600 + currentMinute * 60 + currentSecond;
      }

      // 전체 기간 (10:00 ~ 23:59:59 = 14시간 = 50400초)
      const totalSeconds = 14 * 60 * 60;

      // 남은 시간 계산 (최대 10분으로 제한)
      const maxTimerSeconds = 10 * 60; // 10분
      const remainingSeconds = Math.max(
        0,
        maxTimerSeconds - (elapsedSeconds % maxTimerSeconds)
      );

      // 진행률 계산 (10분 주기로 리셋)
      const cycleProgress =
        ((elapsedSeconds % maxTimerSeconds) / maxTimerSeconds) * 100;

      return {
        minutes: Math.floor(remainingSeconds / 60),
        seconds: remainingSeconds % 60,
        progress: cycleProgress,
      };
    };

    // 초기값 설정
    const initial = calculateTimeLeft();
    setTimeLeft({ minutes: initial.minutes, seconds: initial.seconds });
    setProgress(initial.progress);

    // 매초마다 업데이트
    const interval = setInterval(() => {
      const timeData = calculateTimeLeft();
      setTimeLeft({ minutes: timeData.minutes, seconds: timeData.seconds });
      setProgress(timeData.progress);

      // 시간이 끝나면 팝업 자동 닫기 (sessionStorage 저장 안함)
      if (timeData.minutes === 0 && timeData.seconds === 0) {
        onClose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  // 프로그레스에 따른 색상 계산
  const getProgressColor = (progress) => {
    if (progress < 30) return "from-red-500 to-red-600";
    if (progress < 60) return "from-red-500 to-orange-500";
    if (progress < 90) return "from-orange-500 to-yellow-500";
    return "from-yellow-500 to-green-500";
  };

  // 일반 팝업 닫기 (sessionStorage 저장 안함)
  const handleClose = () => {
    onClose();
  };

  // "오늘 하루 안보기" 버튼 클릭 시 (sessionStorage 저장함)
  const handleDoNotShowToday = () => {
    const today = new Date().toDateString();
    sessionStorage.setItem("hide-offer-today", today);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-1 max-w-sm w-full mx-4 relative shadow-2xl z-[70]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>

                {/* 실시간 카운트다운 타이머 */}
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-2">
                    OFFER EXPIRES IN
                  </div>
                  <motion.div
                    key={`${timeLeft.minutes}-${timeLeft.seconds}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-4xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2"
                    style={{ fontFamily: "Courier New, monospace" }}
                  >
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </motion.div>

                  {/* 동적 프로그레스 바 */}
                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getProgressColor(
                        progress
                      )} rounded-full shadow-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>

                <img
                  src="../img/photoism_kdh_frame.jpg"
                  alt="Special Offer"
                  className="w-full h-24 object-cover rounded-xl mb-4 border border-orange-500/30"
                />

                <h2 className="text-xl font-bold text-white mb-2">
                  Sale Alert!
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                  Limited time offer - Book now and save big!
                </p>

                <div className="bg-gradient-to-r from-orange-900/50 to-pink-900/50 rounded-2xl p-4 mb-4 border border-orange-500/30">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    <span className="text-lg line-through text-gray-500">
                      ₩45,000
                    </span>
                    {" → "}₩25,000
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    Save 50 pounds per person!
                  </div>
                  <div className="text-xs text-orange-400 font-medium">
                    Get your own K-Pop Photo Cards
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDoNotShowToday}
                    className="flex-1 bg-gray-800/50 text-gray-300 py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-colors border border-gray-600/50"
                  >
                    Do not show today
                  </button>
                  <NeonButton
                    variant="warning"
                    className="flex-1 py-3 px-4 text-sm"
                  >
                    Grab Deal
                  </NeonButton>
                </div>

                {/* 텍스트 강조 */}
                <motion.div
                  className="mt-3 text-xs"
                  animate={{
                    color: ["#ef4444", "#f97316", "#eab308", "#ef4444"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔥 Only {timeLeft.minutes}:
                  {String(timeLeft.seconds).padStart(2, "0")} left!
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// 탭 버튼
const TabButton = ({ active, onClick, children }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`px-6 py-3 font-semibold rounded-2xl transition-all duration-200 border ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-purple-500/50"
        : "text-gray-300 hover:text-purple-300 hover:bg-gray-800/50 bg-gray-900/50 border-gray-600/30"
    }`}
  >
    {children}
  </motion.button>
);

export default function TourDetail({ tourId = 1, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  // 팝업 로직
  useEffect(() => {
    // 오늘 하루 팝업을 보지 않겠다는 설정이 있는지 확인
    const today = new Date().toDateString();
    const hideToday = sessionStorage.getItem("hide-offer-today");

    if (hideToday !== today) {
      // 오늘 처음이거나 다른 날이면 팝업 표시
      setShowOfferPopup(true);
    }
  }, [tourId]);

  // 팝업 닫기 함수
  const closeOfferPopup = () => {
    setShowOfferPopup(false);
  };

  // 뒤로가기
  const handleBack = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  const tourData = tourDetailData[tourId];

  if (!tourData) {
    return (
      <BackgroundEffect>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <NeonCard className="p-12">
              <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                투어를 찾을 수 없습니다
              </h2>
              <p className="text-gray-300">
                요청하신 투어 정보가 존재하지 않습니다.
              </p>
            </NeonCard>
          </motion.div>
        </div>
      </BackgroundEffect>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <NeonCard>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <GradientText variant="secondary" size="2xl">
                  투어 일정
                </GradientText>
              </h3>
              <div className="space-y-6">
                {tourData.itinerary.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <GradientText
                          variant="primary"
                          size="lg"
                          className="font-bold"
                        >
                          {item.time}
                        </GradientText>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-2 text-lg">
                          {item.location}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </NeonCard>

            <NeonCard variant="success">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <GradientText variant="success" size="2xl">
                  포함 사항
                </GradientText>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {["전문 가이드", "점심 식사", "기념품"].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-white">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-4">
                  {["교통비", "체험 활동비", "보험"].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-white">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </NeonCard>
          </motion.div>
        );
      case "detail":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <NeonCard>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <GradientText variant="secondary" size="2xl">
                  투어 세부 사항 및 정보
                </GradientText>
              </h3>
              <div className="space-y-6">
                {tourData.itinerary.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <GradientText
                          variant="primary"
                          size="lg"
                          className="font-bold"
                        >
                          {item.time}
                        </GradientText>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-2 text-lg">
                          {item.location}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </NeonCard>
          </motion.div>
        );
      case "reviews":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NeonCard variant="warning">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <GradientText variant="warning" size="2xl">
                  고객 리뷰
                </GradientText>
              </h3>
              <div className="space-y-6">
                {tourData.reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/80 rounded-2xl border border-gray-600/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${review.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {review.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white">
                            {review.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {review.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      {review.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </NeonCard>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <BackgroundEffect>
      <OfferPopup isOpen={showOfferPopup} onClose={closeOfferPopup} />
      <div className="bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 text-gray-300 hover:text-purple-300 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center group-hover:from-purple-600/40 group-hover:to-pink-600/40 transition-all duration-300 border border-purple-500/30">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold">투어 목록으로 돌아가기</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <NeonCard className="overflow-hidden">
                <div className="relative">
                  <img
                    src={tourData.images[selectedImage]}
                    alt={tourData.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 border ${
                        isBookmarked
                          ? "bg-yellow-500 text-white shadow-lg border-yellow-400/50"
                          : "bg-gray-900/50 text-white hover:bg-gray-800/60 border-gray-600/50"
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-3 overflow-x-auto">
                    {tourData.images.map((image, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-200 ${
                          selectedImage === index
                            ? "border-purple-500 shadow-lg shadow-purple-500/25 scale-105"
                            : "border-gray-600/50 hover:border-purple-400/50"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </NeonCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NeonCard className="p-8">
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                  <TabButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                  >
                    상품 일정
                  </TabButton>
                  <TabButton
                    active={activeTab === "detail"}
                    onClick={() => setActiveTab("detail")}
                  >
                    상품 상세 사항
                  </TabButton>
                  <TabButton
                    active={activeTab === "reviews"}
                    onClick={() => setActiveTab("reviews")}
                  >
                    고객 리뷰
                  </TabButton>
                </div>

                <AnimatePresence mode="wait">
                  {renderTabContent()}
                </AnimatePresence>
              </NeonCard>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-24"
            >
              <NeonCard className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 text-sm rounded-full font-semibold border border-purple-500/30">
                      {tourData.partnership.primary} ×{" "}
                      {tourData.partnership.secondary}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                    {tourData.title}
                  </h1>
                  <p className="text-gray-300 leading-relaxed">
                    {tourData.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    {tourData.location}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg text-white">
                      {tourData.rating}
                    </span>
                    <span className="text-gray-400">
                      ({tourData.reviewCount}개 리뷰)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">
                      {tourData.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">
                      {tourData.groupSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">
                      {tourData.language}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-600/50 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <GradientText
                          variant="primary"
                          size="3xl"
                          className="font-bold"
                        >
                          {tourData.price}
                        </GradientText>
                        <span className="text-xl text-gray-500 line-through">
                          {tourData.originalPrice}
                        </span>
                      </div>
                      <GradientText
                        variant="success"
                        size="sm"
                        className="font-bold"
                      >
                        {tourData.discount} 할인
                      </GradientText>
                    </div>
                    <motion.button
                      onClick={() => setIsLiked(!isLiked)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-2xl transition-all duration-200 border ${
                        isLiked
                          ? "bg-red-500/20 text-red-400 shadow-lg border-red-500/50"
                          : "hover:bg-gray-800/50 text-gray-400 border-gray-600/50"
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                      />
                    </motion.button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <NeonButton className="w-full py-4 font-bold">
                      지금 예약하기
                    </NeonButton>
                    <NeonButton
                      variant="secondary"
                      className="w-full py-4 font-semibold flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      공유하기
                    </NeonButton>
                  </div>

                  <div className="pt-6 border-t border-gray-600/50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl border border-gray-600/30">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300 font-medium">
                          02-1234-5678
                        </span>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl border border-gray-600/30">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300 font-medium">
                          tour@example.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          </div>
        </div>
      </div>
    </BackgroundEffect>
  );
}
