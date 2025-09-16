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

import { tourDetailData } from "../utils/mockTourData";

// 팝업 컴포넌트
const WelcomePopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-2xl border border-purple-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                src="/img/seoul_trip_hunters.jpg"
                alt="K-Pop Demon Hunters"
                className="w-full h-32 object-cover rounded-2xl mb-6 border border-purple-100"
              />

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-4"
              >
                Welcome to Your K-Pop Adventure!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-6 leading-relaxed"
              >
                You're about to explore the magical world of K-Pop Demon
                Hunters! Get ready for exclusive experiences and amazing photo
                opportunities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>24+ joined today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.8★ rating</span>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Start the Journey
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const OfferPopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-1 max-w-sm w-full mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
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
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>

                <img
                  src="/img/tour_mock_01.jpg"
                  alt="Special Offer"
                  className="w-full h-24 object-cover rounded-xl mb-4 border border-orange-200"
                />

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Flash Sale Alert!
                </h2>

                <p className="text-gray-600 mb-4 text-sm">
                  Limited time offer - Book now and save big!
                </p>

                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-4 mb-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    <span className="text-lg line-through text-gray-400">
                      ₩45,000
                    </span>
                    {" → "}₩35,000
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Save ₩10,000 + Free Bonuses
                  </div>
                  <div className="text-xs text-orange-600 font-medium">
                    Netflix Photo Cards + AR Photo Session
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Not Now
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Grab Deal
                  </motion.button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Offer expires in 10 minutes
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`px-6 py-3 font-semibold rounded-2xl transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50 bg-white/50"
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

  // 팝업 상태 관리
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  const tourData = tourDetailData[tourId];

  // 팝업 로직
  useEffect(() => {
    // 페이지 로드 후 1.5초 뒤에 웰컴 팝업 표시
    const welcomeTimer = setTimeout(() => {
      const hasVisited = localStorage.getItem("tour-visited-" + tourId);
      if (!hasVisited) {
        setShowWelcomePopup(true);
        localStorage.setItem("tour-visited-" + tourId, "true");
      }
    }, 1500);

    return () => clearTimeout(welcomeTimer);
  }, [tourId]);

  // 웰컴 팝업이 닫힌 후 8초 뒤에 오퍼 팝업 표시
  useEffect(() => {
    if (!showWelcomePopup) {
      const offerTimer = setTimeout(() => {
        const offerDismissed = localStorage.getItem(
          "offer-dismissed-" + tourId
        );
        const today = new Date().toDateString();
        if (offerDismissed !== today) {
          setShowOfferPopup(true);
        }
      }, 8000);

      return () => clearTimeout(offerTimer);
    }
  }, [showWelcomePopup, tourId]);

  const closeWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  const closeOfferPopup = () => {
    setShowOfferPopup(false);
    // 오늘 하루 동안 오퍼 팝업 표시 안함
    const today = new Date().toDateString();
    localStorage.setItem("offer-dismissed-" + tourId, today);
  };

  // 뒤로가기 처리 함수
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

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20"
        >
          <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            투어를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">
            요청하신 투어 정보가 존재하지 않습니다.
          </p>
        </motion.div>
      </div>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                투어 일정
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
                      className="flex gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {item.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">
                          {item.location}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                포함 사항
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {["전문 가이드", "점심 식사", "기념품"].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">{item}</span>
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
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "partnership":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                제휴 파트너 혜택
              </h3>
              <div className="space-y-6">
                {tourData.partnershipBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 mb-3">
                          {benefit.description}
                        </p>
                        <div
                          className={`text-lg font-bold bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}
                        >
                          {benefit.value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                파트너십 성과
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {tourData.businessMetrics.roi}
                  </div>
                  <div className="text-gray-600 font-medium">
                    투자 대비 수익률
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {tourData.businessMetrics.newCustomers}
                  </div>
                  <div className="text-gray-600 font-medium">
                    신규 고객 유입
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {tourData.businessMetrics.brandValue}
                  </div>
                  <div className="text-gray-600 font-medium">
                    브랜드 가치 상승
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case "analytics":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                마케팅 성과 분석
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {tourData.marketingInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900">
                        {insight.metric}
                      </h4>
                      <span className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        {insight.growth}
                      </span>
                    </div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r ${insight.gradient} bg-clip-text text-transparent mb-2`}
                    >
                      {insight.value}
                    </div>
                    <p className="text-gray-600">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                핵심 성과 지표 (KPI)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                >
                  <BarChart3 className="w-8 h-8 text-purple-600 mb-4" />
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {tourData.businessMetrics.conversionRate}
                  </div>
                  <div className="text-gray-600 font-medium">전환율</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
                >
                  <Target className="w-8 h-8 text-blue-600 mb-4" />
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {tourData.businessMetrics.socialMentions}
                  </div>
                  <div className="text-gray-600 font-medium">
                    소셜 미디어 언급
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                >
                  <Zap className="w-8 h-8 text-green-600 mb-4" />
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {tourData.businessMetrics.mediaValue}
                  </div>
                  <div className="text-gray-600 font-medium">
                    미디어 노출 가치
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case "reviews":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              고객 리뷰
            </h3>
            <div className="space-y-6">
              {tourData.reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${review.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900">
                          {review.name}
                        </div>
                        <div className="text-sm text-gray-500">
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
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* 팝업들 */}
      <WelcomePopup isOpen={showWelcomePopup} onClose={closeWelcomePopup} />
      <OfferPopup isOpen={showOfferPopup} onClose={closeOfferPopup} />

      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
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
              className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/20"
            >
              <div className="relative">
                <img
                  src={tourData.images[selectedImage]}
                  alt={tourData.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      isBookmarked
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
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
                          ? "border-purple-500 shadow-lg scale-105"
                          : "border-gray-200 hover:border-purple-300"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                <TabButton
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                >
                  상품 개요
                </TabButton>
                <TabButton
                  active={activeTab === "partnership"}
                  onClick={() => setActiveTab("partnership")}
                >
                  기업 제휴
                </TabButton>
                <TabButton
                  active={activeTab === "analytics"}
                  onClick={() => setActiveTab("analytics")}
                >
                  성과 분석
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
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 sticky top-24"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full font-semibold border border-purple-200">
                    {tourData.partnership.primary} ×{" "}
                    {tourData.partnership.secondary}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {tourData.title}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {tourData.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">
                  {tourData.location}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{tourData.rating}</span>
                  <span className="text-gray-500">
                    ({tourData.reviewCount}개 리뷰)
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">
                    {tourData.duration}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">
                    {tourData.groupSize}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">
                    {tourData.language}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {tourData.price}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {tourData.originalPrice}
                      </span>
                    </div>
                    <div className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {tourData.discount} 할인
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsLiked(!isLiked)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-2xl transition-all duration-200 ${
                      isLiked
                        ? "bg-red-50 text-red-500 shadow-lg"
                        : "hover:bg-gray-50 text-gray-400"
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                    />
                  </motion.button>
                </div>

                <div className="space-y-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    지금 예약하기
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    공유하기
                  </motion.button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 font-medium">
                        02-1234-5678
                      </span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 font-medium">
                        tour@example.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
