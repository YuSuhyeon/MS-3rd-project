import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
//import Menu from "components/ui/Menu";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

import {
  ArrowUp,
  Loader,
  AlertTriangle,
  Users,
  Car,
  ParkingCircle,
  Wind,
  CloudSun,
  Train,
  Umbrella,
  Droplets,
  Calendar,
  ShoppingBag,
  MapPin,
  Gift,
  Star,
} from "lucide-react";

import {
  BackgroundEffect,
  NeonCard,
  NeonCardJH,
  NeonCardJHMobile,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import LanguageButtons from "components/ui/LanguageButtons";

// 투어 상품 데이터 (mockTourData.js에서 가져온 것)
const tourProducts = [
  {
    id: 1,
    title: "Netflix x Interpark Global",
    image: "/img/tour_mock_01.jpg",
    price: "₩89,000",
    category: "entertainment",
    kpopGroup: "K-Pop Demon Hunters",
    description: "Everland 자유입장권이 포함된 Kpop Demon Hunters 테마 투어",
    tags: ["Day Tour", "K-Pop Demon Hunters", "Amusement Park", "Netflix"],
    rating: 4.9,
    reviews: 250,
    location: "서울 강남구 → 용인 에버랜드",
  },
  {
    id: 2,
    title: "Microsoft AI Tour Seoul",
    image: "/img/thumbnail_ms.jpg",
    price: "₩125,000",
    category: "it",
    kpopGroup: "Microsoft",
    description: "Microsoft AI Tour Seoul - AI 기술과 문화재 복원의 만남",
    tags: ["Microsoft", "AI Technology", "Cultural Heritage", "Bootcamp"],
    rating: 5.0,
    reviews: 89,
    location: "서울 중구",
  },
  {
    id: 3,
    title: "한강버스 X 인스타그램 서울 핫플 투어",
    image: "/img/hangang_bus.jpg",
    price: "₩85,000",
    category: "experience",
    kpopGroup: "서울관광재단",
    description:
      "한강버스를 타고 서울 대표 포토스팟과 인스타 핫플을 돌아보는 감성 투어",
    tags: ["Instagram", "Han River Bus", "Photo Spot", "Seoul Hotplace"],
    rating: 4.6,
    reviews: 312,
    location: "한강 전구간",
  },
  {
    id: 4,
    title: "LG 트윈스 야구 관람",
    image: "/img/baseball_chicken.jpg",
    price: "₩100,000",
    category: "sports",
    kpopGroup: "LG 트윈스",
    description: "잠실야구장 프리미엄 관람 + 치킨맥주 + 스포츠 체험",
    tags: ["Baseball", "Korean Food", "Sports", "Jamsil"],
    rating: 4.8,
    reviews: 445,
    location: "서울 송파구 (잠실 관광 특구)",
  },
];

// 장소별 이미지와 설명 데이터
const placeInfo = {
  "강남 MICE 관광특구": {
    image: "/img/p1.png",
    description:
      "서울의 경제와 문화의 중심지로, 고급 쇼핑몰과 레스토랑, 엔터테인먼트가 집중된 곳. K-pop과 한류의 발원지이자 현대 서울의 상징적인 지역입니다.",
  },
  "광화문·덕수궁": {
    image: "/img/deoksugung.jpg",
    description:
      "조선왕조의 역사가 살아 숨쉬는 궁궐과 현대 서울의 중심이 조화를 이루는 곳. 전통과 현대가 만나는 특별한 공간입니다.",
  },
  "명동 관광특구": {
    image: "/img/myeondong.jpg",
    description:
      "서울의 대표 쇼핑 거리이자 한류 문화의 중심지. 국내외 관광객들이 가장 많이 찾는 명소로, 화장품 매장과 패션 브랜드, 맛집들이 즐비합니다.",
  },

  서울역: {
    image: "/img/p4.png",
    description:
      "한국 철도교통의 중심 허브이자 쇼핑과 문화가 어우러진 복합공간. 전통 시장과 현대적 상업시설이 공존하는 서울의 관문 역할을 합니다.",
  },
  "이태원 관광특구": {
    image: "/img/Itaewon.jpg",
    description:
      "다양한 국가의 문화가 공존하는 국제적인 거리. 이국적인 음식점과 바, 클럽들이 모여 있는 서울의 글로벌 핫플레이스입니다.",
  },
  "잠실 관광특구": {
    image: "/img/jamsil.jpg",
    description:
      "롯데월드와 올림픽공원이 있는 복합 엔터테인먼트 구역. 쇼핑, 레저, 문화를 한 번에 즐길 수 있는 서울의 랜드마크입니다.",
  },
  "종로·청계 관광특구": {
    image: "/img/p3.png",
    description:
      "서울의 역사적 중심가로 경복궁, 창덕궁 등 조선 왕궁과 인사동, 북촌 한옥마을이 위치한 전통문화의 보고. 과거와 현재가 어우러진 문화의 거리입니다.",
  },
  "홍대 관광특구": {
    image: "/img/p4.png",
    description:
      "젊음과 예술이 살아있는 대학가 문화의 중심지. 독특한 카페, 클럽, 라이브 음악 공연장들이 모여있는 서울의 대표적인 나이트라이프 명소입니다.",
  },
};

// 지하철 도착시간을 분 단위로 파싱하는 함수
const parseArrivalTime = (timeString) => {
  if (!timeString) return Infinity;

  // "곧 도착", "1분 후", "3분 후" 등의 형태를 파싱
  if (timeString.includes("곧")) return 0;

  const match = timeString.match(/(\d+)분/);
  if (match) return parseInt(match[1]);

  // 숫자만 있는 경우
  const numberMatch = timeString.match(/(\d+)/);
  if (numberMatch) return parseInt(numberMatch[1]);

  return Infinity;
};

// 호선별로 가장 빠른 지하철 정보만 추출하는 함수
const getUniqueSubwayLines = (subwayStationList) => {
  const lineMap = new Map();

  subwayStationList.forEach((station) => {
    const line = station.SUB_STN_LINE?._text;
    if (!line) return;

    const details = Array.isArray(station.SUB_DETAIL?.SUB_DETAIL)
      ? station.SUB_DETAIL.SUB_DETAIL
      : station.SUB_DETAIL?.SUB_DETAIL
      ? [station.SUB_DETAIL.SUB_DETAIL]
      : [];

    details.forEach((train) => {
      const arrivalTime = parseArrivalTime(train.SUB_ARMG1?._text);
      const lineKey = `${line}호선`;

      if (
        !lineMap.has(lineKey) ||
        arrivalTime < parseArrivalTime(lineMap.get(lineKey).arrivalTime)
      ) {
        lineMap.set(lineKey, {
          line: lineKey,
          stationName: station.SUB_STN_NM?._text,
          destination: train.SUB_ROUTE_NM?._text,
          arrivalTime: train.SUB_ARMG1?._text,
          arrivalMinutes: arrivalTime,
        });
      }
    });
  });

  return Array.from(lineMap.values()).sort(
    (a, b) => a.arrivalMinutes - b.arrivalMinutes
  );
};

// 지역별 투어 상품 필터링 함수
const getAreaTourProducts = (areaName) => {
  const decodedAreaName = decodeURIComponent(areaName);

  // 지역명에 따른 투어 상품 매핑
  const areaMapping = {
    "강남 Mice 관광특구": ["강남", "강남구", "Gangnam"],
    "잠실 관광특구": ["잠실", "송파구", "Jamsil"],
    "명동 관광특구": ["명동", "중구"],
    "광화문·덕수궁": ["광화문", "덕수궁", "중구"],
    "이태원 관광특구": ["이태원", "용산구"],
  };

  const keywords = areaMapping[decodedAreaName] || [];

  return tourProducts.filter((product) =>
    keywords.some(
      (keyword) =>
        product.location.includes(keyword) ||
        product.description.includes(keyword) ||
        product.tags.some((tag) => tag.includes(keyword))
    )
  );
};

// 네온 스타일 카드 컴포넌트
const NeonInfoCard = ({
  icon,
  title,
  children,
  delay = 0.2,
  className = "",
}) => (
  <motion.div
    className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg
                 border border-purple-500/30 rounded-2xl p-6 shadow-2xl
                 hover:border-pink-500/50 hover:shadow-pink-500/20 hover:shadow-2xl
                 transition-all duration-300 ${className}`}
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    {/* 네온 글로우 효과 */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl" />

    <div className="relative z-10">
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
          {React.cloneElement(icon, { className: "text-white", size: 20 })}
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h2>
      </motion.div>
      <div className="space-y-2 text-gray-100">{children}</div>
    </div>
  </motion.div>
);

//배경 이미지 컴포넌트
const HeroSection = ({ placeData, areaName }) => {
  const { t } = useTranslation("data");
  const decodedAreaName = decodeURIComponent(areaName);
  const info = placeInfo[decodedAreaName];

  return (
    <motion.div
      className="relative h-96 mb-8 rounded-3xl overflow-hidden p-1"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 배경 이미지 */}
      {info?.image && (
        <div
          className="absolute inset-1 bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${info.image})` }}
        />
      )}

      {/* 그라데이션 오버레이 제거: 불투명 이미지 위에 텍스트만 표시 */}

      {/* 컨텐츠 */}
      <div className="absolute bottom-1 left-1 right-1 p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4 min-w-0">
            <MapPin className="text-pink-400 flex-shrink-0" size={20} />
            <span className="text-pink-400 font-medium truncate max-w-full">
              {t("live_info")}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            {t("now")} <span dynamic="true">{placeData.AREA_NM?._text}</span>
            {t("is")}
          </h1>

          {info?.description && (
            <p
              className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed"
              dynamic="true"
            >
              {info.description}
            </p>
          )}

          <p className="text-gray-400 text-sm mt-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
            {t("data_update")}:{" "}
            <span dynamic="true">
              {placeData.WEATHER_STTS?.WEATHER_STTS?.WEATHER_TIME?._text}
            </span>
          </p>
        </motion.div>
      </div>

      {/* 네온 테두리 효과 */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50 bg-clip-border blur-sm" />
    </motion.div>
  );
};

const PopularPlaces = () => {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("data");
  const decodedAreaName = decodeURIComponent(areaName || "");
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false); //최상단 이동버튼

  // 스크롤 관련 상태
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // 스크롤 방향 감지 및 버튼 표시 로직 통합
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 방향 감지
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 스크롤을 아래로 내릴 때
        setIsNavVisible(false);
      } else {
        // 스크롤을 위로 올릴 때 또는 맨 위일 때
        setIsNavVisible(true);
      }

      // '상단으로 이동' 버튼 표시/숨김
      if (currentScrollY > 400) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // 투어 상품 클릭 핸들러
  const handleTourClick = (tourId) => {
    navigate(`/tour/${tourId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const url = `https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/CityDataDetailAPI?areaName=${decodedAreaName}`;

      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data && data.available) {
          setPlaceData(data);
        } else {
          throw new Error(
            `'${decodedAreaName}'에 대한 데이터를 찾을 수 없습니다.`
          );
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [areaName]);

  useEffect(() => {
    // 페이지 로드 시 즉시 최상단으로 스크롤
    window.scrollTo(0, 0);

    if (!loading && placeData) {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 부드러운 스크롤 효과
      });
    }
  }, [loading, placeData]);

  // 컴포넌트 마운트 시 확실하게 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);

    // DOM이 완전히 렌더링된 후 한 번 더 확인
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [areaName]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-12 h-12 text-purple-400" />
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">{error.message}</p>
      </div>
    );

  if (!placeData)
    return (
      <div className="p-4 bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white min-h-screen">
        데이터가 없습니다.
      </div>
    );

  const eventList = Array.isArray(placeData.EVENT_STTS?.EVENT_STTS)
    ? placeData.EVENT_STTS.EVENT_STTS
    : [];

  const commercialList = Array.isArray(
    placeData.LIVE_CMRCL_STTS?.CMRCL_RSB?.CMRCL_RSB
  )
    ? placeData.LIVE_CMRCL_STTS.CMRCL_RSB.CMRCL_RSB
    : [];

  const subwayStationList = Array.isArray(placeData.SUB_STTS?.SUB_STTS)
    ? placeData.SUB_STTS.SUB_STTS
    : [];

  // 호선별 가장 빠른 지하철 정보만 추출
  const uniqueSubwayLines = getUniqueSubwayLines(subwayStationList);

  // 해당 지역 투어 상품 가져오기
  const areaTourProducts = getAreaTourProducts(areaName);

  return (
    <BackgroundEffect>
      {/* Navigation  */}
      {/* Top navigation removed: using global Layout header */}

      {/* Hero Section */}
      <HeroSection placeData={placeData} areaName={areaName} />

      {/* 데이터 카드 그리드 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* 실시간 인구 */}
          <NeonInfoCard
            icon={<Users />}
            title={t("real_time_population")}
            delay={0.1}
          >
            <motion.p
              className="text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              dynamic="true"
            >
              {
                placeData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_CONGEST_LVL
                  ?._text
              }
            </motion.p>
            <p className="text-lg text-gray-300">
              {t("about")}{" "}
              <span className="font-bold text-purple-300">
                {Number(
                  placeData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_PPLTN_MIN
                    ?._text
                ).toLocaleString()}
              </span>{" "}
              ~{" "}
              <span className="font-bold text-pink-300">
                {Number(
                  placeData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_PPLTN_MAX
                    ?._text
                ).toLocaleString()}
              </span>
              {t("people")}
            </p>
          </NeonInfoCard>

          {/* 실시간 상권 */}
          <NeonInfoCard
            icon={<ShoppingBag />}
            title={t("real_time_commercial")}
            delay={0.2}
          >
            <p className="text-2xl font-bold">
              {t("overall_commercial")}:{" "}
              <span
                className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent"
                dynamic="true"
              >
                {placeData.LIVE_CMRCL_STTS?.AREA_CMRCL_LVL?._text}
              </span>
            </p>
          </NeonInfoCard>

          {/* 지하철 정보 - 개선된 버전 */}
          {uniqueSubwayLines.length > 0 && (
            <NeonInfoCard
              icon={<Train />}
              title={t("subway_arrival_info")}
              delay={0.4}
            >
              <div className="space-y-3">
                {uniqueSubwayLines.map((subway, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center px-1 text-center whitespace-nowrap">
                        {(() => {
                          const label = subway.line.replace("호선", "");
                          const sizeClass =
                            label.length >= 3 ? "text-[10px]" : "text-sm";
                          return (
                            <span
                              className={`text-white font-bold leading-none ${sizeClass}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <div
                          className="font-semibold text-green-300"
                          dynamic="true"
                        >
                          {subway.stationName}
                        </div>
                        <div className="text-sm text-gray-400" dynamic="true">
                          {subway.destination}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-bold text-green-400 bg-green-900/50 px-3 py-1 rounded-lg"
                        dynamic="true"
                      >
                        {subway.arrivalTime}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeonInfoCard>
          )}

          {/* 문화행사 */}
          {eventList.length > 0 && (
            <NeonInfoCard
              icon={<Calendar />}
              title={t("nearby_cultural_events")}
              delay={0.3}
            >
              <div className="space-y-3 max-h-40 overflow-y-auto text-sm custom-scrollbar">
                {eventList.map((evt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20"
                  >
                    <a
                      href={evt.URL?._text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold hover:text-pink-300 transition-colors"
                      dynamic="true"
                    >
                      {evt.EVENT_NM?._text}
                    </a>
                    <p className="text-xs text-gray-400 mt-1" dynamic="true">
                      {evt.EVENT_PLACE?._text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </NeonInfoCard>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 교통 상황 */}
          <NeonInfoCard
            icon={<Car />}
            title={t("traffic_conditions")}
            delay={0.5}
          >
            <p
              className="font-semibold text-xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
              dynamic="true"
            >
              {
                placeData.ROAD_TRAFFIC_STTS?.AVG_ROAD_DATA?.ROAD_TRAFFIC_IDX
                  ?._text
              }
            </p>
            <p className="text-gray-300 text-sm" dynamic="true">
              {placeData.ROAD_TRAFFIC_STTS?.AVG_ROAD_DATA?.ROAD_MSG?._text}
            </p>
          </NeonInfoCard>

          {/* 날씨 정보 */}
          <NeonInfoCard icon={<CloudSun />} title={t("weather")} delay={0.6}>
            <motion.p
              className="text-4xl font-black bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              dynamic="true"
            >
              {placeData.WEATHER_STTS?.WEATHER_STTS?.TEMP?._text}°C
            </motion.p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 mt-4">
              <span className="flex items-center gap-1">
                <Droplets size={14} className="text-blue-400" />
                {t("humidity")}:{" "}
                <span dynamic="true">
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.HUMIDITY?._text}
                </span>
                %
              </span>
              <span className="flex items-center gap-1">
                <Wind size={14} className="text-gray-400" />
                {t("wind_speed")}:{" "}
                <span dynamic="true">
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.WIND_SPD?._text}
                </span>
                m/s
              </span>
              <span className="flex items-center gap-1">
                <Umbrella size={14} className="text-purple-400" />
                {t("precipitation")}:{" "}
                <span dynamic="true">
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.PRECIPITATION?._text}
                </span>
              </span>
              <span className="text-pink-300">
                {t("feels_like")}:{" "}
                <span dynamic="true">
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.SENSIBLE_TEMP?._text}
                </span>
                °C
              </span>
            </div>

            <p
              className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-700 bg-black/20 rounded-lg p-2"
              dynamic="true"
            >
              {placeData.WEATHER_STTS?.WEATHER_STTS?.AIR_MSG?._text}
            </p>
          </NeonInfoCard>

          {/* 추천 투어 상품 - 우측 사이드로 이동 */}
          {areaTourProducts.length > 0 && (
            <NeonInfoCard
              icon={<Gift />}
              title={t("recommended_tour_products")}
              delay={0.7}
            >
              <div className="space-y-4">
                {areaTourProducts.map((tour) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * tour.id }}
                    className="p-4 rounded-xl bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/20 hover:border-pink-400/50 transition-colors cursor-pointer"
                    onClick={() => handleTourClick(tour.id)}
                  >
                    <div className="flex gap-4">
                      {tour.image && (
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          className="font-bold text-pink-300 mb-1"
                          dynamic="true"
                        >
                          {tour.title}
                        </h3>
                        <p
                          className="text-sm text-gray-300 mb-2"
                          dynamic="true"
                        >
                          {tour.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star
                              className="text-yellow-400"
                              size={14}
                              fill="currentColor"
                            />
                            <span className="text-sm text-gray-300">
                              {tour.rating} ({tour.reviews})
                            </span>
                          </div>
                          <div className="font-bold text-pink-400">
                            {tour.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeonInfoCard>
          )}
        </div>
      </div>
      {/* '상단으로 이동' 플로팅 버튼 */}
      {showScrollButton && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-purple-600 text-white shadow-lg
                             hover:bg-pink-600 transition-colors duration-300 z-50 focus:outline-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <ArrowUp />
        </motion.button>
      )}
      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </BackgroundEffect>
  );
};

export default PopularPlaces;
