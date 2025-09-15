import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
} from "lucide-react";

// 장소별 이미지와 설명 데이터
const placeInfo = {
  "명동 관광특구": {
    image: "/img/myeondong.jpg",
    description:
      "서울의 대표 쇼핑 거리이자 한류 문화의 중심지. 국내외 관광객들이 가장 많이 찾는 명소로, 화장품 매장과 패션 브랜드, 맛집들이 즐비합니다.",
  },
  "잠실 관광특구": {
    image: "/img/jamsil.jpg",
    description:
      "롯데월드와 올림픽공원이 있는 복합 엔터테인먼트 구역. 쇼핑, 레저, 문화를 한 번에 즐길 수 있는 서울의 랜드마크입니다.",
  },
  "광화문·덕수궁": {
    image: "/img/deoksugung.jpg",
    description:
      "조선왕조의 역사가 살아 숨쉬는 궁궐과 현대 서울의 중심이 조화를 이루는 곳. 전통과 현대가 만나는 특별한 공간입니다.",
  },
  "이태원 관광특구": {
    image: null, // 이미지 없음
    description:
      "다양한 국가의 문화가 공존하는 국제적인 거리. 이국적인 음식점과 바, 클럽들이 모여 있는 서울의 글로벌 핫플레이스입니다.",
  },
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
  const decodedAreaName = decodeURIComponent(areaName);
  const info = placeInfo[decodedAreaName];

  return (
    <motion.div
      className="relative h-96 mb-8 rounded-3xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 배경 이미지 */}
      {info?.image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${info.image})` }}
        />
      )}

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-pink-900/30" />

      {/* 컨텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="text-pink-400" size={20} />
            <span className="text-pink-400 font-medium">실시간 정보</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            지금 {placeData.AREA_NM?._text}는
          </h1>

          {info?.description && (
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
              {info.description}
            </p>
          )}

          <p className="text-gray-400 text-sm mt-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
            데이터 업데이트:{" "}
            {placeData.WEATHER_STTS?.WEATHER_STTS?.WEATHER_TIME?._text}
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
  const decodedAreaName = decodeURIComponent(areaName || "");
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      //const decodedAreaName = decodeURIComponent(areaName);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      {/* 별 배경 효과 */}
      <div className="fixed inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* 네비게이션 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-pink-300 
                     font-semibold transition-colors duration-300 group"
          >
            <img
              src="/img/home.png"
              alt="홈으로"
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            />
            <span></span>
            {/*<ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            홈으로
            */}
          </Link>
        </motion.div>

        {/* 히어로 섹션 */}
        <HeroSection placeData={placeData} areaName={areaName} />

        {/* 데이터 카드 그리드 */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* 실시간 인구 */}
            <NeonInfoCard icon={<Users />} title="실시간 인구" delay={0.1}>
              <motion.p
                className="text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {
                  placeData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_CONGEST_LVL
                    ?._text
                }
              </motion.p>
              <p className="text-lg text-gray-300">
                약{" "}
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
                명
              </p>
            </NeonInfoCard>

            {/* 실시간 상권 */}
            <NeonInfoCard
              icon={<ShoppingBag />}
              title="실시간 상권"
              delay={0.2}
            >
              <p className="text-2xl font-bold">
                전체 상권:{" "}
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  {placeData.LIVE_CMRCL_STTS?.AREA_CMRCL_LVL?._text}
                </span>
              </p>
            </NeonInfoCard>

            {/* 문화행사 */}
            {eventList.length > 0 && (
              <NeonInfoCard
                icon={<Calendar />}
                title="주변 문화행사"
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
                      >
                        {evt.EVENT_NM?._text}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">
                        {evt.EVENT_PLACE?._text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </NeonInfoCard>
            )}

            {/* 지하철 정보 */}
            {subwayStationList.length > 0 && (
              <NeonInfoCard
                icon={<Train />}
                title="지하철 도착 정보"
                delay={0.4}
              >
                <div className="space-y-4">
                  {subwayStationList.map((station, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/20"
                    >
                      <h3 className="font-bold text-green-300 border-b border-green-500/30 pb-2 mb-2">
                        {station.SUB_STN_NM?._text} (
                        {station.SUB_STN_LINE?._text}호선)
                      </h3>
                      <div className="space-y-1 text-sm max-h-24 overflow-y-auto custom-scrollbar">
                        {Array.isArray(station.SUB_DETAIL?.SUB_DETAIL) ? (
                          station.SUB_DETAIL.SUB_DETAIL.map((train, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center py-1"
                            >
                              <span className="text-gray-300">
                                {train.SUB_ROUTE_NM?._text}
                              </span>
                              <span className="font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                {train.SUB_ARMG1?._text}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300">
                              {
                                station.SUB_DETAIL?.SUB_DETAIL?.SUB_ROUTE_NM
                                  ?._text
                              }
                            </span>
                            <span className="font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                              {station.SUB_DETAIL?.SUB_DETAIL?.SUB_ARMG1?._text}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </NeonInfoCard>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 교통 상황 */}
            <NeonInfoCard icon={<Car />} title="교통 상황" delay={0.5}>
              <p className="font-semibold text-xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {
                  placeData.ROAD_TRAFFIC_STTS?.AVG_ROAD_DATA?.ROAD_TRAFFIC_IDX
                    ?._text
                }
              </p>
              <p className="text-gray-300 text-sm">
                {placeData.ROAD_TRAFFIC_STTS?.AVG_ROAD_DATA?.ROAD_MSG?._text}
              </p>
            </NeonInfoCard>

            {/* 날씨 정보 */}
            <NeonInfoCard icon={<CloudSun />} title="날씨" delay={0.6}>
              <motion.p
                className="text-4xl font-black bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                {placeData.WEATHER_STTS?.WEATHER_STTS?.TEMP?._text}°C
              </motion.p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 mt-4">
                <span className="flex items-center gap-1">
                  <Droplets size={14} className="text-blue-400" />
                  습도: {placeData.WEATHER_STTS?.WEATHER_STTS?.HUMIDITY?._text}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind size={14} className="text-gray-400" />
                  풍속: {placeData.WEATHER_STTS?.WEATHER_STTS?.WIND_SPD?._text}
                  m/s
                </span>
                <span className="flex items-center gap-1">
                  <Umbrella size={14} className="text-purple-400" />
                  강수량:{" "}
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.PRECIPITATION?._text}
                </span>
                <span className="text-pink-300">
                  체감:{" "}
                  {placeData.WEATHER_STTS?.WEATHER_STTS?.SENSIBLE_TEMP?._text}°C
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-700 bg-black/20 rounded-lg p-2">
                {placeData.WEATHER_STTS?.WEATHER_STTS?.AIR_MSG?._text}
              </p>
            </NeonInfoCard>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default PopularPlaces;
