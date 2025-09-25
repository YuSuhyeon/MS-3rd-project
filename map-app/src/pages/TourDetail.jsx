import { useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  Bus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// NeonTheme 컴포넌트들을 import
import {
  BackgroundEffect,
  NeonCard,
  NeonButton,
  GradientText,
} from "../components/ui/NeonTheme";

import {
  tourProducts,
  tourDetailData,
  getTourOffer,
} from "../utils/mockTourData";

const OfferPopup = ({ isOpen, onClose, tourId }) => {
  const { t } = useTranslation("tourDetail");
  const [timeLeft, setTimeLeft] = useState({ minutes: 10, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [isGrabbed, setIsGrabbed] = useState(false);

  // mockTourData에서 투어별 할인 정보 가져오기
  const offerInfo = getTourOffer(tourId);
  console.log("OfferPopup offerInfo:", offerInfo);

  useEffect(() => {
    if (!isOpen || !offerInfo.hasOffer) return; // 조건을 useEffect 내부로 이동

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
  }, [isOpen, onClose, offerInfo.hasOffer]); // ✅ 의존성 배열에 offerInfo.hasOffer 추가

  if (!offerInfo.hasOffer) {
    return null;
  }

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
    sessionStorage.setItem(`hide-offer-today-${tourId}`, today);
    onClose();
  };

  const filterMediaForDevice = (mediaList, isMobile = false) => {
    if (!mediaList) return [];

    return mediaList.filter((item) => {
      if (typeof item === "string") {
        // 문자열인 경우 확장자로 판단
        const videoExtensions = [
          ".mp4",
          ".webm",
          ".ogg",
          ".avi",
          ".mov",
          ".wmv",
        ];
        const isVideo = videoExtensions.some((ext) =>
          item.toLowerCase().includes(ext)
        );
        return isMobile ? !isVideo : true; // 모바일에서는 영상 제외
      }

      if (typeof item === "object" && item.type) {
        // 객체인 경우 type 속성으로 판단
        return isMobile ? item.type !== "video" : true;
      }

      return true; // 기본적으로 모든 항목 포함
    });
  };

  // 모바일 감지 훅
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkDevice = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkDevice();
      window.addEventListener("resize", checkDevice);
      return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return isMobile;
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
                    {t("offer.expiresIn")}
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
                  src={offerInfo.image || "../img/photoism_kdh_frame.jpg"}
                  alt="Special Offer"
                  className="w-full h-24 object-cover rounded-xl mb-4 border border-orange-500/30"
                />

                <h2 className="text-xl font-bold text-white mb-2">
                  {offerInfo.title}
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                  {t("offer.limitedTime")}
                </p>

                <div className="bg-gradient-to-r from-orange-900/50 to-pink-900/50 rounded-2xl p-4 mb-4 border border-orange-500/30">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {isGrabbed ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl text-green-400">✓</span>
                        <span className="text-3xl">
                          {offerInfo.discountPrice}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-lg line-through text-gray-500">
                          {offerInfo.originalPrice}
                        </span>
                        {" → "}
                        {offerInfo.discountPrice}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {isGrabbed ? t("offer.dealGrabbed") : offerInfo.savings}
                  </div>
                  <div className="text-xs text-orange-400 font-medium">
                    {isGrabbed
                      ? t("offer.priceSecured")
                      : offerInfo.description}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDoNotShowToday}
                    className="flex-1 bg-gray-800/50 text-gray-300 py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-colors border border-gray-600/50"
                  >
                    {t("offer.doNotShowToday")}
                  </button>
                  <NeonButton
                    variant="warning"
                    className="flex-1 py-3 px-4 text-sm"
                    onClick={() => {
                      setIsGrabbed(true);
                      // 가격 확정 UI를 잠시 보여준 뒤 닫기 (0.8초)
                      setTimeout(() => {
                        onClose();
                      }, 800);
                    }}
                  >
                    {isGrabbed ? t("offer.grabbed") : t("offer.grabDeal")}
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
                  🔥{" "}
                  {offerInfo.urgencyText ||
                    t("offer.urgencyText", {
                      minutes: timeLeft.minutes,
                      seconds: String(timeLeft.seconds).padStart(2, "0"),
                    })}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 기존 탭 버튼 (그대로 유지, 필요시 사용)
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

// 카드 컴포넌트
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800/30 rounded-2xl border border-gray-700/30 ${className}`}
  >
    {children}
  </div>
);

const Tabs = ({ activeTab, onTabChange, children }) => {
  const { t } = useTranslation("tourDetail");
  const [tabPositions, setTabPositions] = useState({});
  const tabRefs = useRef({});
  const containerRef = useRef(null);

  const tabs = [
    { id: "overview", label: t("tabs.overview") || "일정" },
    { id: "details", label: t("tabs.details") || "상세정보" },
    { id: "reviews", label: t("tabs.reviews") || "리뷰" },
  ];

  // 탭 위치 계산
  useEffect(() => {
    const updateTabPositions = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const positions = {};

      tabs.forEach((tab) => {
        if (tabRefs.current[tab.id]) {
          const tabRect = tabRefs.current[tab.id].getBoundingClientRect();
          positions[tab.id] = {
            left: tabRect.left - containerRect.left,
            width: tabRect.width,
          };
        }
      });

      setTabPositions(positions);
    };

    updateTabPositions();
    window.addEventListener("resize", updateTabPositions);
    return () => window.removeEventListener("resize", updateTabPositions);
  }, []);

  const currentTabPosition = tabPositions[activeTab];

  return (
    <Card className="p-6">
      <div className="relative mb-6">
        {/* 탭 버튼들 */}
        <div
          ref={containerRef}
          className="flex justify-center md:justify-start"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 md:flex-none px-6 py-3 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* 이동하는 구분선 제거: 텍스트 색상만으로 활성 탭 표시 */}
        <div className="mt-2 border-b border-gray-700/50" />
      </div>

      {/* 탭 내용 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};
// 일정 탭 내용 (포함사항 2열 배치)
const OverviewTab = ({ itinerary, included, tourId }) => {
  const { t } = useTranslation("tourDetail");
  return (
    <div className="space-y-8">
      {/* 일정 */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          {t("overview.itinerary")}
        </h3>
        <div className="space-y-4">
          {itinerary?.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30"
            >
              <div className="flex-shrink-0 text-center">
                <div className="text-purple-400  text-center text-sm  mb-1 font-medium">
                  {item.time}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-white  mb-1">
                  {t(`data.${tourId}.itinerary.${index}.location`, {
                    defaultValue: item.location,
                  })}
                </h4>
                <p className="text-gray-300 text-sm">
                  {t(`data.${tourId}.itinerary.${index}.description`, {
                    defaultValue: item.description,
                  })}
                </p>
              </div>
            </div>
          )) || (
            <div className="text-gray-300 text-sm p-4 bg-gray-800/30 rounded-xl">
              {t("overview.noItinerary")}
            </div>
          )}
        </div>
      </div>

      {/* 포함사항 - 2열 배치 */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {t("overview.included")}
        </h3>
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {included && included.length > 0
              ? included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">
                      {t(`data.${tourId}.inclusions.${index}`, {
                        defaultValue: item,
                      })}
                    </span>
                  </div>
                ))
              : [
                  t("overview.includedItems.guide", { defaultValue: "Guide" }),
                  t("overview.includedItems.lunch", { defaultValue: "Lunch" }),
                  t("overview.includedItems.souvenirs", {
                    defaultValue: "Souvenirs",
                  }),
                  t("overview.includedItems.transportation", {
                    defaultValue: "Transportation",
                  }),
                  t("overview.includedItems.activities", {
                    defaultValue: "Activities",
                  }),
                  t("overview.includedItems.insurance", {
                    defaultValue: "Insurance",
                  }),
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 상세정보 탭 내용
const DetailsTab = ({ detailSections, tourId }) => {
  const { t } = useTranslation("tourDetail");
  return (
    <div className="space-y-6">
      {detailSections?.map((section, index) => (
        <div key={index} className="overflow-hidden rounded-xl">
          <img
            src={section.image}
            alt={section.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="p-4 bg-gray-800/30 rounded-b-xl border border-gray-600/30 border-t-0">
            <h4 className="text-lg font-bold text-white mb-2">
              {t(`data.${tourId}.detailSections.${index}.title`, {
                defaultValue: section.title,
              })}
            </h4>
            <p className="text-gray-300 text-sm">
              {t(`data.${tourId}.detailSections.${index}.text`, {
                defaultValue: section.text,
              })}
            </p>
          </div>
        </div>
      )) || (
        <div className="text-gray-300 text-sm p-4 bg-gray-800/30 rounded-xl">
          {t("details.noDetails")}
        </div>
      )}
    </div>
  );
};

// 리뷰 탭 내용
const ReviewsTab = ({ reviews, tourId }) => {
  const { t } = useTranslation("tourDetail");
  return (
    <div className="space-y-4">
      {reviews?.map((review, index) => (
        <div
          key={review.id}
          className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/80 rounded-xl border border-gray-600/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${
                review.gradient || "from-purple-600 to-pink-600"
              } rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm`}
            >
              {review.avatar || review.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">
                  {review.name}
                </div>
                <div className="text-xs text-gray-400">{review.date}</div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < (review.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {t(`data.${tourId}.reviews.${index}.content`, {
              defaultValue: review.content,
            })}
          </p>
        </div>
      )) || (
        <div className="text-gray-300 text-sm p-4 bg-gray-800/30 rounded-xl">
          {t("reviews.noReviews")}
        </div>
      )}
    </div>
  );
};

const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackSrc = "/img/seoul_drone.png",
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e) => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      // 기본 이미지도 실패하면 숨김
      e.target.style.display = "none";
    }
  };

  // 선택된 이미지가 바뀌면 실제 표시 src 갱신 (모바일 화살표/도트 이동 시 반영)
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img src={imgSrc} alt={alt} className={className} onError={handleError} />
  );
};

// 메인 TourDetail 컴포넌트
export default function TourDetail({ onBack }) {
  const { t, i18n: i18nextInstance } = useTranslation("tourDetail");
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const tourId = parseInt(id) || 1;

  // 네임스페이스 보장 로드 (마운트/언어 변경 시)
  useEffect(() => {
    i18nextInstance.loadNamespaces(["tourDetail"]);
  }, [i18nextInstance]);
  useEffect(() => {
    i18nextInstance.loadNamespaces(["tourDetail"]);
  }, [i18nextInstance.language]);

  // 상세 페이지 진입 시 최상단으로 스크롤 (브라우저의 스크롤 복원 방지)
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    const previousHtmlScrollBehavior =
      document.documentElement.style.scrollBehavior;
    const previousHtmlOverflowAnchor =
      document.documentElement.style.overflowAnchor;
    const previousBodyOverflowAnchor = document.body.style.overflowAnchor;
    try {
      window.history.scrollRestoration = "manual";
    } catch (_) {}
    // 스크롤 앵커링 비활성화 (동적 콘텐츠로 인한 중간 위치 유지 방지)
    try {
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.style.overflowAnchor = "none";
      document.body.style.overflowAnchor = "none";
    } catch (_) {}

    const forceScrollToTop = () => {
      // 잠재적 스크롤 컨테이너들을 모두 0으로
      const scrollContainers = new Set();
      scrollContainers.add(window);
      scrollContainers.add(document);
      scrollContainers.add(document.documentElement);
      scrollContainers.add(document.body);
      const root = document.getElementById("root");
      if (root) scrollContainers.add(root);
      // 가장 흔한 오버플로우 컨테이너들을 탐색 (상위 20개 요소만 검사)
      try {
        const candidates = Array.from(document.querySelectorAll("*"))
          .slice(0, 500)
          .filter((el) => {
            try {
              const style = getComputedStyle(el);
              const overflowY = style.overflowY;
              return (
                (overflowY === "auto" || overflowY === "scroll") &&
                el.scrollHeight > el.clientHeight
              );
            } catch (_) {
              return false;
            }
          });
        candidates.forEach((el) => scrollContainers.add(el));
      } catch (_) {}

      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      // 각각의 컨테이너에 대해서도 스크롤 0 적용
      scrollContainers.forEach((target) => {
        try {
          if (target === window || target === document) return;
          if (target && typeof target.scrollTo === "function") {
            target.scrollTo({ top: 0, left: 0, behavior: "auto" });
          } else if (target && typeof target.scrollTop === "number") {
            target.scrollTop = 0;
            target.scrollLeft = 0;
          }
        } catch (_) {}
      });
      // 한 프레임 뒤와 약간의 지연 후에도 한번 더 시도 (이미지 로드로 인한 레이아웃 이동 방지)
      try {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
      } catch (_) {}
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 250);
    };

    forceScrollToTop();

    return () => {
      try {
        window.history.scrollRestoration = previousRestoration || "auto";
      } catch (_) {}
      try {
        document.documentElement.style.scrollBehavior =
          previousHtmlScrollBehavior || "";
        document.documentElement.style.overflowAnchor =
          previousHtmlOverflowAnchor || "";
        document.body.style.overflowAnchor = previousBodyOverflowAnchor || "";
      } catch (_) {}
    };
  }, []);

  // 투어 ID가 바뀔 때도 강제로 상단 이동 (동일 컴포넌트 재사용 케이스 대비)
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    try {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    } catch (_) {}
    const t1 = setTimeout(() => window.scrollTo(0, 0), 50);
    const t2 = setTimeout(() => window.scrollTo(0, 0), 250);
    // 추가: 가장 흔한 스크롤 컨테이너들도 리셋
    const resetContainers = () => {
      try {
        const list = [
          document.documentElement,
          document.body,
          document.getElementById("root"),
        ].filter(Boolean);
        list.forEach((el) => {
          try {
            el.scrollTop = 0;
            el.scrollLeft = 0;
          } catch (_) {}
        });
      } catch (_) {}
    };
    const t3 = setTimeout(resetContainers, 0);
    const t4 = setTimeout(resetContainers, 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [tourId]);

  // 팝업 로직
  useEffect(() => {
    const offerInfo = getTourOffer(tourId);
    console.log(`Tour ${tourId} offer info:`, offerInfo);

    if (!offerInfo.hasOffer) {
      console.log(`Tour ${tourId} has no offer, skipping popup`);
      return;
    }

    const today = new Date().toDateString();
    const hideToday = sessionStorage.getItem(`hide-offer-today-${tourId}`);
    console.log(
      `Tour ${tourId} hideToday setting:`,
      hideToday,
      "vs today:",
      today
    );

    if (hideToday !== today) {
      console.log(`Showing popup for tour ${tourId}`);
      setShowOfferPopup(true);
    } else {
      console.log(`Popup hidden for tour ${tourId} today`);
    }
  }, [tourId]);

  const closeOfferPopup = () => {
    console.log(`Closing popup for tour ${tourId}`);
    setShowOfferPopup(false);
  };

  const handleBack = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      navigate("/tour");
    }
  };

  const tourData = tourDetailData[tourId];

  // 화면 크기 감지 (모바일 여부)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 모바일에서는 비디오(.mp4 등) 제외한 이미지 리스트 계산
  const displayImages = useMemo(() => {
    const images = tourData?.images || [];
    if (!isMobile) return images;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".wmv"];
    return images.filter((media) => {
      if (typeof media === "string") {
        const lower = media.toLowerCase();
        return !videoExtensions.some((ext) => lower.includes(ext));
      }
      return media?.type !== "video";
    });
  }, [tourData?.images, isMobile]);

  // 투어 변경 또는 이미지 목록 변경 시, 선택 인덱스 안전하게 초기화
  useEffect(() => {
    if (selectedImage >= (displayImages?.length || 0)) {
      setSelectedImage(0);
    }
  }, [tourId, displayImages, selectedImage]);

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
                {t("notFound.title")}
              </h2>
              <p className="text-gray-300">{t("notFound.description")}</p>
            </NeonCard>
          </motion.div>
        </div>
      </BackgroundEffect>
    );
  }

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            itinerary={tourData.itinerary}
            included={tourData.included}
            tourId={tourId}
          />
        );
      case "details":
        return (
          <DetailsTab
            detailSections={tourData.detailSections}
            tourId={tourId}
          />
        );
      case "reviews":
        return <ReviewsTab reviews={tourData.reviews} tourId={tourId} />;
      default:
        return null;
    }
  };

  return (
    <BackgroundEffect>
      <OfferPopup
        isOpen={showOfferPopup}
        onClose={closeOfferPopup}
        tourId={tourId}
      />

      {/* Header (모바일에서는 non-sticky로 여백 문제 방지, 데스크탑에서는 sticky) 
      <div className="bg-gray-900/90 backdrop-blur-lg border-b border-purple-500/30 md:sticky md:top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 text-gray-300 hover:text-purple-300 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center group-hover:from-purple-600/40 group-hover:to-pink-600/40 transition-all duration-300 border border-purple-500/30">
              <ArrowLeft className="w-5 h-5" />
            </div>
          </motion.button>
        </div>
      </div>*/}

      {/* Main Content - 완전한 반응형 레이아웃 */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* 모바일 레이아웃 (768px 미만): 세로 스택 */}
        <div className="block md:hidden space-y-6">
          {/* 1. 투어 정보 (모바일에서 상단) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NeonCard className="p-4">
              <div className="mb-4">
                {tourData.partnership && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 text-xs rounded-full font-semibold border border-purple-500/30">
                      {t(`data.${tourId}.partnership.primary`, {
                        defaultValue: tourData.partnership.primary,
                      })}
                      {" × "}
                      {t(`data.${tourId}.partnership.secondary`, {
                        defaultValue: tourData.partnership.secondary,
                      })}
                    </span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 leading-tight">
                  {t(`data.${tourId}.title`, { defaultValue: tourData.title })}
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent leading-relaxed">
                  {t(`data.${tourId}.subtitle`, {
                    defaultValue: tourData.subtitle,
                  })}
                </p>
                {/* 로컬라이즈된 요약/설명 (옵션) */}
                {i18nextInstance.exists(`data.${tourId}.listDescription`, {
                  ns: "tourDetail",
                }) && (
                  <p className="mt-2 text-gray-300 text-sm">
                    {t(`data.${tourId}.listDescription`)}
                  </p>
                )}
              </div>
              {/* 2. 이미지 갤러리 - 모바일용 (비디오 필터링) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="overflow-hidden rounded-2xl">
                  <div className="relative group">
                    {(() => {
                      const safeSelected =
                        selectedImage >= (displayImages?.length || 0)
                          ? 0
                          : selectedImage;
                      const currentImage = displayImages?.[safeSelected];

                      return (
                        <ImageWithFallback
                          src={
                            typeof currentImage === "string"
                              ? currentImage
                              : currentImage?.src || currentImage
                          }
                          alt={tourData.title}
                          className="w-full h-72 object-cover"
                        />
                      );
                    })()}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* 이미지 네비게이션 - 필터링된 배열 기준 */}
                    {(() => {
                      if (!displayImages || displayImages.length <= 1)
                        return null;

                      return (
                        <>
                          <motion.button
                            onClick={() => {
                              const len = displayImages.length;
                              if (len <= 1) return;
                              setSelectedImage((prev) =>
                                prev <= 0 ? len - 1 : prev - 1
                              );
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200 z-10 pointer-events-auto"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </motion.button>

                          <motion.button
                            onClick={() => {
                              const len = displayImages.length;
                              if (len <= 1) return;
                              setSelectedImage((prev) =>
                                prev >= len - 1 ? 0 : prev + 1
                              );
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200 z-10 pointer-events-auto"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.button>

                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {displayImages.map((_, index) => (
                              <motion.button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  (selectedImage >= displayImages.length
                                    ? 0
                                    : selectedImage) === index
                                    ? "bg-purple-500 scale-125"
                                    : "bg-white/50 hover:bg-white/70"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  {t(`data.${tourId}.location`, {
                    defaultValue: tourData.location,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-white text-sm">
                    {tourData.rating}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({tourData.reviewCount}
                    {t("booking.reviews")})
                  </span>
                </div>
              </div>

              {/* 투어 정보를 하나의 컨테이너에 통합 */}
              <div className="px-1 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-200 text-xs sm:text-[11px] leading-snug">
                    {t(`data.${tourId}.duration`, {
                      defaultValue: tourData.duration,
                    })}
                  </span>
                </div>
              </div>
              <div className="px-1 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-200 text-xs sm:text-[11px] leading-snug">
                    {t(`data.${tourId}.groupSize`, {
                      defaultValue: tourData.groupSize,
                    })}
                  </span>
                </div>
              </div>
              <div className="px-1 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-200 text-xs sm:text-[11px] leading-snug">
                    {t(`data.${tourId}.language`, {
                      defaultValue: tourData.language,
                    })}
                  </span>
                </div>
              </div>

              {/* 가격 및 액션 버튼 */}
              <div className="border-t border-gray-600/50 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GradientText
                        variant="primary"
                        size="xl"
                        className="font-bold"
                      >
                        {tourData.price}
                      </GradientText>
                      {tourData.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {tourData.originalPrice}
                        </span>
                      )}
                    </div>
                    {tourData.discount && (
                      <GradientText
                        variant="success"
                        size="xs"
                        className="font-bold"
                      >
                        {tourData.discount} {t("booking.discount")}
                      </GradientText>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setIsLiked(!isLiked)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-xl transition-all duration-200 border ${
                        isLiked
                          ? "bg-red-500/20 text-red-400 shadow-lg border-red-500/50"
                          : "hover:bg-gray-800/50 text-gray-400 border-gray-600/50"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                      />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2">
                  <NeonButton
                    className="w-full py-3 font-bold text-sm"
                    onClick={() =>
                      window.open(tourData.bookingUrl || "#", "_blank")
                    }
                  >
                    {t("booking.bookNow")}
                  </NeonButton>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          {/* 3. 탭 컨텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
              {renderTabContent()}
            </Tabs>
          </motion.div>
        </div>
        {/* 데스크탑 레이아웃 (768px 이상): 좌우 분할 * */}
        <div className="hidden md:block">
          <NeonCard className="mb-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8">
              {/* 왼쪽: 이미지 및 탭 컨텐츠 */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="overflow-hidden rounded-2xl">
                    <div className="relative group">
                      {/* 현재 미디어가 비디오인지 확인 */}
                      {(() => {
                        const currentMedia =
                          tourData.images?.[selectedImage] ||
                          tourData.images?.[0] ||
                          "../img/photoism_kdh_frame.jpg";
                        const isVideo =
                          typeof currentMedia === "string"
                            ? [
                                ".mp4",
                                ".webm",
                                ".ogg",
                                ".avi",
                                ".mov",
                                ".wmv",
                              ].some((ext) =>
                                currentMedia.toLowerCase().includes(ext)
                              )
                            : currentMedia?.type === "video";

                        if (isVideo) {
                          return (
                            <div className="relative overflow-hidden rounded-2xl">
                              <video
                                key={selectedImage}
                                className="w-full h-96 rounded-2xl"
                                controls
                                controlsList="nodownload"
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                poster={
                                  typeof currentMedia === "object"
                                    ? currentMedia.poster
                                    : undefined
                                }
                                onLoadStart={() =>
                                  console.log("Video loading started")
                                }
                                onError={(e) =>
                                  console.error("Video error:", e)
                                }
                                onCanPlay={() => console.log("Video can play")}
                                style={{
                                  position: "relative",
                                  zIndex: 1,
                                  objectFit: "cover",
                                  objectPosition: "center center",
                                }}
                              >
                                <source
                                  src={
                                    typeof currentMedia === "string"
                                      ? currentMedia
                                      : currentMedia.src
                                  }
                                  type={
                                    typeof currentMedia === "string"
                                      ? currentMedia
                                          .toLowerCase()
                                          .includes(".webm")
                                        ? "video/webm"
                                        : currentMedia
                                            .toLowerCase()
                                            .includes(".ogg")
                                        ? "video/ogg"
                                        : "video/mp4"
                                      : currentMedia.mimeType || "video/mp4"
                                  }
                                />
                                비디오를 재생할 수 없습니다. 브라우저가 이
                                형식을 지원하지 않습니다.
                              </video>
                              {/* 비디오 표시 아이콘 오버레이 */}
                              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 z-10">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <img
                              src={
                                typeof currentMedia === "string"
                                  ? currentMedia
                                  : currentMedia.src || currentMedia
                              }
                              alt={tourData.title}
                              className="w-full h-96 object-cover"
                            />
                          );
                        }
                      })()}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* 이미지 네비게이션 버튼들 */}
                      {tourData.images?.length > 1 && (
                        <>
                          <motion.button
                            onClick={() =>
                              setSelectedImage(
                                selectedImage === 0
                                  ? tourData.images.length - 1
                                  : selectedImage - 1
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </motion.button>

                          <motion.button
                            onClick={() =>
                              setSelectedImage(
                                selectedImage === tourData.images.length - 1
                                  ? 0
                                  : selectedImage + 1
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </motion.button>

                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                            {tourData.images.map((media, index) => {
                              const isVideoThumb =
                                typeof media === "string"
                                  ? [
                                      ".mp4",
                                      ".webm",
                                      ".ogg",
                                      ".avi",
                                      ".mov",
                                      ".wmv",
                                    ].some((ext) =>
                                      media.toLowerCase().includes(ext)
                                    )
                                  : media?.type === "video";

                              return (
                                <motion.button
                                  key={index}
                                  onClick={() => setSelectedImage(index)}
                                  className={`relative w-3 h-3 rounded-full transition-all duration-200 ${
                                    selectedImage === index
                                      ? "bg-purple-500 scale-125"
                                      : "bg-white/50 hover:bg-white/70"
                                  }`}
                                >
                                  {/* 비디오 표시 아이콘 */}
                                  {isVideoThumb && (
                                    <Play
                                      className="absolute inset-0 w-2 h-2 text-white/80"
                                      style={{
                                        left: "50%",
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                        fontSize: "8px",
                                      }}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* 탭 컨텐츠 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
                    {renderTabContent()}
                  </Tabs>
                </motion.div>
              </div>

              {/* 오른쪽: 투어 정보 및 예약 (Sticky 사이드바) */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="sticky top-24"
                >
                  <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-600/30">
                    <div className="mb-6">
                      {tourData.partnership && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 text-sm rounded-full font-semibold border border-purple-500/30">
                            {t(`data.${tourId}.partnership.primary`, {
                              defaultValue: tourData.partnership.primary,
                            })}
                            {" × "}
                            {t(`data.${tourId}.partnership.secondary`, {
                              defaultValue: tourData.partnership.secondary,
                            })}
                          </span>
                        </div>
                      )}
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3 leading-tight">
                        {t(`data.${tourId}.title`, {
                          defaultValue: tourData.title,
                        })}
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent leading-relaxed">
                        {t(`data.${tourId}.subtitle`, {
                          defaultValue: tourData.subtitle,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm font-medium">
                        {t(`data.${tourId}.location`, {
                          defaultValue: tourData.location,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-white">
                          {tourData.rating}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ({tourData.reviewCount}
                          {t("booking.reviews")})
                        </span>
                      </div>
                    </div>

                    {/* 로컬라이즈된 요약/설명 (옵션, 데스크톱) */}
                    {i18nextInstance.exists(`data.${tourId}.listDescription`, {
                      ns: "tourDetail",
                    }) && (
                      <p className="mb-6 text-gray-300 text-sm">
                        {t(`data.${tourId}.listDescription`)}
                      </p>
                    )}

                    {/* 투어 정보를 하나의 컨테이너에 통합 */}
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm font-medium">
                            {t(`data.${tourId}.duration`, {
                              defaultValue: tourData.duration,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm font-medium">
                            {t(`data.${tourId}.groupSize`, {
                              defaultValue: tourData.groupSize,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm font-medium">
                            {t(`data.${tourId}.language`, {
                              defaultValue: tourData.language,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-600/50 pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <GradientText
                              variant="primary"
                              size="2xl"
                              className="font-bold"
                            >
                              {tourData.price}
                            </GradientText>
                            {tourData.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                {tourData.originalPrice}
                              </span>
                            )}
                          </div>
                          {tourData.discount && (
                            <GradientText
                              variant="success"
                              size="sm"
                              className="font-bold"
                            >
                              {tourData.discount} {t("booking.discount")}
                            </GradientText>
                          )}
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
                            className={`w-5 h-5 ${
                              isLiked ? "fill-current" : ""
                            }`}
                          />
                        </motion.button>
                      </div>

                      <div className="space-y-3 mb-6">
                        <NeonButton
                          className="w-full py-3 font-bold text-sm"
                          onClick={() =>
                            window.open(tourData.bookingUrl || "#", "_blank")
                          }
                        >
                          {t("booking.bookNow")}
                        </NeonButton>
                        {/* <NeonButton
                          variant="secondary"
                          className="w-full py-3 font-semibold flex items-center justify-center gap-2 text-sm"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: tourData.title,
                                text: tourData.subtitle,
                                url: window.location.href,
                              });
                            } else {
                              navigator.clipboard.writeText(
                                window.location.href
                              );
                              alert("링크가 복사되었습니다!");
                            }
                          }}
                        ></NeonButton> */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </NeonCard>
        </div>
      </div>
    </BackgroundEffect>
  );
}
