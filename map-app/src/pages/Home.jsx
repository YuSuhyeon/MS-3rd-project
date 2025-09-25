import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Map,
  Edit3,
  Heart,
  Star,
  Camera,
  ChevronRight,
  Globe,
  Clock,
  LogOut,
  ArrowUp, // ArrowLeft 대신 ArrowUp 사용
  MapPin,
  Flag,
  Plane,
} from "lucide-react";
import { Link } from "react-router-dom";
import LanguageButtons from "components/ui/LanguageButtons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Menu from "components/ui/Menu";
import {
  motion,
  useScroll,
  useMotionValue,
  useAnimationFrame,
  AnimatePresence,
  useTransform,
  useInView,
} from "framer-motion";
import {
  BackgroundEffect,
  NeonCard,
  GradientText,
  NeonButton,
  ResponsiveGrid,
  DataDisplay,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import "../styles/custom_detail.css";
import i18n from "../i18n";

// Reusable Section wrapper from Home_basic.jsx
const Section = ({ id, children, className = "" }) => (
  <section
    id={id}
    className={`relative min-h-screen w-full flex items-center justify-center px-6 md:px-10 ${className}`}
  >
    <div className="w-full max-w-6xl">{children}</div>
  </section>
);

const KPopTravelHome = () => {
  const { t } = useTranslation("common");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);
  const { profile, login, logout } = useAuth();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const navigate = useNavigate();

  // 스크롤 관련 상태
  const [lastScrollY, setLastScrollY] = useState(0);

  // 내비게이션 바를 숨기거나 보이게 하는 상태
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    i18n.changeLanguage("ko");
  }, []);

  // 스크롤 방향 감지 및 버튼 표시 로직 통합
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 방향 감지
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 스크롤을 아래로 내릴 때
        setIsNavVisible(false);
      } else {
        // 스크롤을 위로 올릴 때
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

  // 랜덤 이름과 애니메이션을 위한 상태들
  const [displayName, setDisplayName] = useState("'s");
  const [isNameAnimating, setIsNameAnimating] = useState(false);
  const randomNames = [
    "수현",
    "진희",
    "정훈",
    "연수",
    "주영",
    "봉현",
    "Sammy",
    "Sunny",
    "Nour",
  ];

  const getRandomName = () => {
    return randomNames[Math.floor(Math.random() * randomNames.length)];
  };

  useEffect(() => {
    if (!profile) {
      const timer = setTimeout(() => {
        setDisplayName(`${getRandomName()}'s`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!profile && displayName !== "'s") {
      const interval = setInterval(() => {
        setIsNameAnimating(true);
        setTimeout(() => {
          setDisplayName(`${getRandomName()}'s`);
          setIsNameAnimating(false);
        }, 300);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [profile, displayName]);

  useEffect(() => {
    if (profile && profile.name) {
      setIsNameAnimating(true);
      setTimeout(() => {
        const firstName = profile.name.split(" ")[0];
        setDisplayName(`${firstName}'s`);
        setIsNameAnimating(false);
      }, 300);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && showLoginModal) {
      setShowLoginModal(false);
    }
  }, [profile, showLoginModal, redirectOnLogin, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Your mouse move logic (if any)
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    console.log("Home 컴포넌트에서 profile 변경됨:", profile);
  }, [profile]);

  const handleStartClick = () => {
    if (profile) {
      navigate("/persona");
    } else {
      setRedirectOnLogin(true);
      setShowLoginModal(true);
    }
  };

  const nameVariants = {
    initial: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
    },
    animating: {
      opacity: 0.3,
      scale: 0.95,
      rotateY: 90,
      filter: "blur(2px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    complete: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        delay: 0.1,
      },
    },
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t("features.title1"),
      description: t("features.desc1"),
      variant: "default",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: t("features.title2"),
      description: t("features.desc2"),
      variant: "primary",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: t("features.title4"),
      description: t("features.desc4"),
      variant: "primary",
    },
  ];

  const stats = [
    {
      number: "10K+",
      label: t("stats.label1"),
      icon: <Globe className="w-5 h-5" />,
      variant: "primary",
    },
    {
      number: "98%",
      label: t("stats.label2"),
      icon: <Heart className="w-5 h-5" />,
      variant: "success",
    },
    {
      number: "24/7",
      label: t("stats.label3"),
      icon: <Clock className="w-5 h-5" />,
      variant: "info",
    },
    {
      number: "5★",
      label: t("stats.label4"),
      icon: <Star className="w-5 h-5" />,
      variant: "warning",
    },
  ];

  // ---------- 공용 유틸 (섹션 3에서 사용) ----------
  const haversineKm = (a, b) => {
    const R = 6371; // km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c =
      2 *
      Math.asin(
        Math.sqrt(
          sinDLat * sinDLat +
            Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
        )
      );
    return R * c;
  };

  const formatDuration = (hoursFloat) => {
    const totalMin = Math.round(hoursFloat * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <BackgroundEffect className="min-h-screen neon-scrollbar">
      <NeonScrollbarStyles />
      <AnimatePresence>
        {/* Herosection */}
        {isNavVisible && (
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50"
            style={{
              background: "transparent",
              backdropFilter: "none",
              borderBottom: "none",
              outline: "none",
              zIndex: 40,
            }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center h-10">
                  <Menu />
                </div>
                <div className="flex items-center gap-3 h-10">
                  <div className="h-10 flex items-center">
                    <div className="h-10 flex items-center justify-center">
                      <LanguageButtons />
                    </div>
                  </div>
                  {profile ? (
                    <div className="flex items-center gap-2 h-10">
                      <div className="h-10 flex items-center">
                        <img
                          src={
                            profile.picture ||
                            profile.profile_image ||
                            "/img/default_profile_purple_img.png"
                          }
                          alt="profile"
                          className="w-8 h-8 rounded-full border border-purple-400/50 flex-shrink-0"
                          onError={(e) => {
                            e.target.src =
                              "/img/default_profile_purple_img.png";
                          }}
                        />
                      </div>
                      <span className="text-white/90 font-semibold hidden lg:block max-w-24 xl:max-w-32 truncate text-sm">
                        {profile.name}
                      </span>
                      <button
                        onClick={logout}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 hover:scale-105"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="h-10 px-4 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 hover:scale-105 font-medium text-sm"
                    >
                      {t("login.login")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={{
          y: heroY,
          opacity: heroOpacity,
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.span
                variants={nameVariants}
                initial="initial"
                animate={isNameAnimating ? "animating" : "complete"}
                className="inline-block"
                style={{ transformStyle: "preserve-3d" }}
              >
                {displayName}
              </motion.span>{" "}
              <GradientText variant="primary" size="6xl">
                {t("main.title.k_travel")}
              </GradientText>
              {t("main.title.connector")}
              <br />
              {t("main.title.ai_creates")}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {t("main.subtitle")}
            </motion.p>
          </motion.div>
          {/* Simple animated map preview */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <DataDisplay
                  value={stat.number}
                  label={stat.label}
                  variant={stat.variant}
                  size="lg"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* Sections from Home_basic.jsx (Persona, AI reco, Editing, CTA) */}
      {/* Section 2: Persona */}
      <Section id="persona">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t("home.persona.title")}
            </h2>
            <p className="mt-5 text-lg text-white/80">
              {t("home.persona.desc")}
            </p>
            <div className="mt-8">
              <NeonButton
                onClick={() => navigate("/persona")}
                variant="primary"
                size="lg"
                className="inline-flex items-center gap-2"
              >
                {t("home.persona.cta")}
                <Wand2 className="w-4 h-4" />
              </NeonButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative grid grid-cols-1 gap-4">
              {/* Mock of question cards */}
              {[
                {
                  title: t("home.persona.card1.title"),
                  pills: [
                    t("home.persona.card1.pill1"),
                    t("home.persona.card1.pill2"),
                    t("home.persona.card1.pill3"),
                  ],
                  accent: "from-purple-500 to-pink-500",
                },
                {
                  title: t("home.persona.card2.title"),
                  pills: [
                    t("home.persona.card2.pill1"),
                    t("home.persona.card2.pill2"),
                    t("home.persona.card2.pill3"),
                  ],
                  accent: "from-indigo-500 to-blue-500",
                },
                {
                  title: t("home.persona.card3.title"),
                  pills: [
                    t("home.persona.card3.pill1"),
                    t("home.persona.card3.pill2"),
                    t("home.persona.card3.pill3"),
                  ],
                  accent: "from-fuchsia-500 to-pink-500",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-purple-500/30 shadow-2xl"
                >
                  <div className="text-sm font-semibold text-white mb-3">
                    {card.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.pills.map((p, j) => (
                      <span
                        key={j}
                        className={`px-3 py-1 text-sm rounded-full text-white bg-gradient-to-r ${card.accent}`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Section 3: AI 맞춤 코스 추천 — 확장 버전 (다중 경유지 + 실제 거리/시간) */}
      <Section id="ai-reco">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t("home.ai_reco.title")}
            </h2>
            <p className="mt-5 text-lg text-white/80">
              {t("home.ai_reco.desc")}
            </p>

            {/* 이동수단 선택 */}
            <TransportSelector />

            {/* 거리/시간 요약 (아래 컴포넌트와 데이터 공유 위해 context 없이도 동일 로직 복제하지 않도록 구성) */}
            <RouteSummary />
          </motion.div>

          {/* Animated Multi-Waypoint Map */}
          <AnimatedSeoulRouteCard />
        </div>
      </Section>

      {/* Section 4: 자유로운 편집 기능 */}
      <Section id="editing">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t("home.editing.title")}
            </h2>
            <p className="mt-5 text-lg text-white/80">
              {t("home.editing.desc")}
            </p>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative w-[280px] h-[540px] rounded-[36px] bg-gradient-to-br from-gray-900 to-black shadow-2xl border border-purple-500/30 p-3">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-full" />
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg w-full h-full rounded-[28px] p-4 flex flex-col gap-3 overflow-hidden border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-white">
                    {t("home.itinerary.title")}
                  </div>
                </div>
                <div className="flex-1 space-y-3 overflow-hidden">
                  {[
                    t("home.itinerary.item1"),
                    t("home.itinerary.item2"),
                    t("home.itinerary.item3"),
                    t("home.itinerary.item4"),
                  ].map((t, i) => (
                    <motion.div
                      key={t}
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 shadow-sm flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="text-sm font-medium text-white/90 truncate">
                        {t}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 rounded-xl text-center text-sm font-semibold border border-purple-500/30 text-white/80 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                    {t("home.controls.undo")}
                  </div>
                  <div className="px-3 py-2 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600">
                    {t("home.controls.save")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Section 5: Final CTA */}
      <Section id="cta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {t("cta.title")}
          </h2>
          <div className="mt-8">
            <NeonButton
              onClick={() => navigate("/persona")}
              variant="primary"
              size="xl"
              className="inline-flex items-center gap-2"
            >
              {t("cta.start")}
            </NeonButton>
          </div>
        </motion.div>
      </Section>
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg
                          hover:from-purple-700 hover:to-pink-700 transition-all duration-300 z-50 focus:outline-none border border-purple-400/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <ArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div
              className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {t("modal.welcome")}
                </h2>
                <p className="text-white/80">{t("modal.instruction")}</p>
              </div>
              <div className="space-y-4">
                <motion.button
                  onClick={() => login("google")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C44.591,35.021,48,29.412,48,24C48,22.659,47.862,21.35,47.611,20.083z"
                    />
                  </svg>
                  {t("modal.continue_google")}
                </motion.button>
                <motion.button
                  onClick={() => login("microsoft")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all border border-blue-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 23 23"
                  >
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  {t("modal.continue_microsoft")}
                </motion.button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  {t("modal.disclaimer.prefix")}{" "}
                  <a
                    href="#"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {t("modal.disclaimer.terms")}
                  </a>
                  {t("modal.disclaimer.and")}{" "}
                  <a
                    href="#"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {t("modal.disclaimer.privacy")}
                  </a>
                  {t("modal.disclaimer.suffix")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BackgroundEffect>
  );
};

/* ======================= 섹션 3 구성요소들 ======================= */

// 공유 데이터(서울 5개 동 경유지)와 계산 로직을 훅으로 분리해 재사용
const useSeoulRoute = () => {
  // 서울 주요 동 5개 (대략 좌표)
  const waypoints = useMemo(
    () => [
      { key: "S", name: "종로1가", lat: 37.5704, lng: 126.9816 }, // Start
      { key: "1", name: "명동", lat: 37.5609, lng: 126.9863 },
      { key: "2", name: "이태원1동", lat: 37.5345, lng: 126.9946 },
      { key: "3", name: "서교동(홍대)", lat: 37.5521, lng: 126.9226 },
      { key: "E", name: "역삼1동(강남)", lat: 37.5010, lng: 127.0366 }, // End
    ],
    []
  );

  // 이동 모드
  const [mode, setMode] = useState("drive");
  const speedKmh = useMemo(() => {
    switch (mode) {
      case "walk":
        return 4.5;
      case "subway":
        return 35;
      case "drive":
      default:
        return 30; // 도심 평균 주행 가정
    }
  }, [mode]);

  // 거리 계산
  const segments = useMemo(() => {
    const segs = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      segs.push({ from: a, to: b });
    }
    return segs;
  }, [waypoints]);

  const distances = useMemo(() => {
    return segments.map((s) => haversineKm(s.from, s.to));
  }, [segments]);

  const totalKm = useMemo(
    () => distances.reduce((acc, v) => acc + v, 0),
    [distances]
  );

  const etaHours = useMemo(() => totalKm / speedKmh, [totalKm, speedKmh]);

  return {
    waypoints,
    segments,
    distances,
    totalKm,
    etaHours,
    mode,
    setMode,
  };
};

const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinDLat * sinDLat +
          Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
      )
    );
  return R * c;
};

const formatDuration = (hoursFloat) => {
  const totalMin = Math.round(hoursFloat * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
};

// 이동수단 선택 UI + 요약 정보 표시를 위한 컨텍스트 대용 컴포넌트
const TransportSelector = () => {
  // 이 컴포넌트는 단독 사용이 아니라 요약 영역과 노출을 맞추기 위해
  // AnimatedSeoulRouteCard와 동일 훅을 쓰기보다는, 아래 RouteBus에 props로 전달하는 구조를 채택.
  return null;
};

// 요약 영역 — 실제 데이터는 AnimatedSeoulRouteCard에서 커스텀 이벤트로 전달
const RouteSummary = () => {
  const [summary, setSummary] = useState({
    mode: "drive",
    totalKm: 0,
    eta: "0m",
    distances: [],
    waypointNames: [],
  });

  // 커스텀 이벤트 수신 (동일 페이지 내 통신용 — 간단 구현)
  useEffect(() => {
    const onEvt = (e) => {
      if (e.detail?.type === "ROUTE_SUMMARY") {
        setSummary(e.detail.payload);
      }
    };
    window.addEventListener("seoul-route-summary", onEvt);
    return () => window.removeEventListener("seoul-route-summary", onEvt);
  }, []);

  const modeLabel =
    summary.mode === "walk"
      ? "도보"
      : summary.mode === "subway"
      ? "지하철"
      : "차량";

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        <ModeButton current={summary.mode} mode="walk" label="도보" />
        <ModeButton current={summary.mode} mode="subway" label="지하철" />
        <ModeButton current={summary.mode} mode="drive" label="차량" />
      </div>

      <div className="mt-4 p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-gray-900/80 to-black/90 text-white/90 shadow">
        <div className="flex items-center gap-2 text-sm mb-1">
          <MapPin className="w-4 h-4" />
          <span className="font-semibold">
            경유지 ({summary.waypointNames.length}) :
          </span>
          <span className="opacity-90">
            {summary.waypointNames.join(" → ")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            <span className="font-semibold">총 거리</span>{" "}
            {summary.totalKm.toFixed(2)} km /{" "}
            <span className="font-semibold">예상 소요</span> {summary.eta} (
            {modeLabel})
          </span>
        </div>

        {/* 구간별 거리 */}
        {summary.distances.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {summary.distances.map((d, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
              >
                <span className="font-semibold">{idx + 1} 구간</span>:{" "}
                {d.toFixed(2)} km
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Animated Map Card — 섹션 3 우측의 카드
const AnimatedSeoulRouteCard = () => {
  const { waypoints, distances, totalKm, etaHours, mode, setMode } =
    useSeoulRoute();

  // 요약 정보를 상위 요약 패널로 브로드캐스트
  useEffect(() => {
    const evt = new CustomEvent("seoul-route-summary", {
      detail: {
        type: "ROUTE_SUMMARY",
        payload: {
          mode,
          totalKm,
          eta: formatDuration(etaHours),
          distances,
          waypointNames: waypoints.map((w) => w.name),
        },
      },
    });
    window.dispatchEvent(evt);
  }, [mode, totalKm, etaHours, distances, waypoints]);

  // SVG 영역(가상 캔버스)
  const W = 800;
  const H = 360;
  const P = 28; // padding

  // 좌표 변환 (소지역 범위이므로 단순 선형 매핑)
  const [minLat, maxLat, minLng, maxLng] = useMemo(() => {
    const lats = waypoints.map((w) => w.lat);
    const lngs = waypoints.map((w) => w.lng);
    return [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  }, [waypoints]);

  const project = (lat, lng) => {
    const x =
      P +
      ((lng - minLng) / (maxLng - minLng || 1)) * (W - P * 2);
    // y는 lat이 클수록 위로 가도록 반전
    const y =
      P +
      (1 - (lat - minLat) / (maxLat - minLat || 1)) * (H - P * 2);
    return { x, y };
  };

  const pathD = useMemo(() => {
    const pts = waypoints.map((w) => project(w.lat, w.lng));
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      d += ` L ${p.x},${p.y}`;
    }
    return d;
  }, [waypoints, minLat, maxLat, minLng, maxLng]);

  // 경로 애니메이션 (pathLength + 비행기 이동)
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.4, once: true });
  const pathRef = useRef(null);
  const progress = useMotionValue(0);
  const [plane, setPlane] = useState({ x: 0, y: 0, angle: 0 });

  useEffect(() => {
    if (!inView) return;
    let rafId;
    const start = performance.now();
    const duration = 1500;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      progress.set(t);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => rafId && cancelAnimationFrame(rafId);
  }, [inView, progress]);

  useAnimationFrame(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const d = len * progress.get();
    const p = path.getPointAtLength(d);
    // 진행 방향 각도 계산
    const eps = 1;
    const p2 = path.getPointAtLength(Math.min(len, d + eps));
    const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
    setPlane({ x: p.x, y: p.y, angle });
  });

  // 배경(그리드/노이즈)
  const GradientNoise = () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(transparent,rgba(0,0,0,0.4)), url('data:image/svg+xml;utf8," +
            encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.25"/>
</svg>`) +
            "')",
          backgroundSize: "cover",
        }}
      />
    </div>
  );

  const MapGrid = () => (
    <div
      aria-hidden
      className="absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)] opacity-60"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );

  const modeLabel =
    mode === "walk" ? "도보" : mode === "subway" ? "지하철" : "차량";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-full h-[360px] bg-gradient-to-br from-slate-900 via-slate-950 to-black relative">
          <GradientNoise />
          <MapGrid />

          {/* 경로 SVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 부드러운 글로우 */}
            <path
              d={pathD}
              stroke="#A78BFA"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.12"
            />

            {/* 점선 베이스 */}
            <path
              d={pathD}
              stroke="#A78BFA"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="0 10"
              opacity="0.35"
            />

            {/* 그려지는 애니메이션 라인 */}
            <motion.path
              ref={pathRef}
              d={pathD}
              stroke="#C4B5FD"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* 핀들 */}
            {waypoints.map((w, idx) => {
              const p = project(w.lat, w.lng);
              const isStart = idx === 0;
              const isEnd = idx === waypoints.length - 1;
              return (
                <g key={w.key} transform={`translate(${p.x} ${p.y})`}>
                  {/* pulse */}
                  <circle
                    r="18"
                    className="animate-ping"
                    fill={isStart ? "#A78BFA" : isEnd ? "#6366F1" : "#EC4899"}
                    opacity="0.35"
                  />
                  {/* dot */}
                  <g>
                    <circle
                      r="14"
                      fill={isStart ? "#8B5CF6" : isEnd ? "#4F46E5" : "#EC4899"}
                      stroke="#FFFFFF"
                      strokeWidth="4"
                    />
                    {isStart ? (
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FFFFFF"
                        fontWeight="bold"
                        fontSize="12"
                      >
                        S
                      </text>
                    ) : isEnd ? (
                      <g transform="translate(-7 -7)">
                        <Flag width={14} height={14} color="#FFFFFF" />
                      </g>
                    ) : (
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FFFFFF"
                        fontWeight="bold"
                        fontSize="12"
                      >
                        {idx}
                      </text>
                    )}
                  </g>
                  {/* 라벨 */}
                  <g transform="translate(0 -26)">
                    <rect
                      x={-46}
                      y={-18}
                      width={92}
                      height={22}
                      rx={11}
                      fill="rgba(17,24,39,0.85)"
                      stroke="rgba(168,85,247,0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={0}
                      y={-3}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="11"
                      style={{ fontWeight: 600 }}
                    >
                      {w.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 비행기 아이콘 */}
            <g
              transform={`translate(${plane.x} ${plane.y}) rotate(${plane.angle})`}
            >
              <foreignObject x={-12} y={-12} width={24} height={24}>
                <div className="h-6 w-6 rounded-full bg-white/90 shadow-md backdrop-blur flex items-center justify-center">
                  <Plane className="h-3.5 w-3.5 text-slate-900" />
                </div>
              </foreignObject>
            </g>
          </svg>

          {/* 상단 라벨 */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white/90 text-sm flex items-center gap-2 shadow">
            <Map className="w-4 h-4 text-purple-300" />
            <span>서울 도심 코스 · {modeLabel}</span>
          </div>

          {/* 하단 요약 바(시각 보조) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-4 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent p-4 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{waypoints[0].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span>{totalKm.toFixed(2)} km · {formatDuration(etaHours)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>{waypoints[waypoints.length - 1].name}</span>
            </div>
          </div>
        </div>

        {/* 모드 토글 (카드 자체에도 제공) */}
        <div className="absolute top-4 right-4 flex gap-2">
          <ToggleChip
            active={mode === "walk"}
            onClick={() => setMode("walk")}
            label="도보"
          />
          <ToggleChip
            active={mode === "subway"}
            onClick={() => setMode("subway")}
            label="지하철"
          />
          <ToggleChip
            active={mode === "drive"}
            onClick={() => setMode("drive")}
            label="차량"
          />
        </div>
      </div>
    </motion.div>
  );
};

const ToggleChip = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow"
        : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white/80 border-purple-500/30 hover:bg-purple-500/20"
    }`}
  >
    {label}
  </button>
);

// 외부 요약 패널의 모드 버튼 (동기화를 위해 카드에서 이벤트 발행)
const ModeButton = ({ current, mode, label }) => {
  const isActive = current === mode;
  const onClick = () => {
    const evt = new CustomEvent("seoul-route-mode", {
      detail: { mode },
    });
    window.dispatchEvent(evt);
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
        isActive
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow"
          : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white/80 border-purple-500/30 hover:bg-purple-500/20"
      }`}
    >
      {label}
    </button>
  );
};

/* ============================================================= */

export default KPopTravelHome;

/* =================== 동작 메모 ===================
- 섹션 3에 AnimatedSeoulRouteCard를 넣어, 서울 주요 5개 동을 잇는 경로를
  애니메이션으로 그려주고(경로 그려짐 + 비행기 아이콘 이동),
  상/하단 라벨, 그리드/노이즈/그라디언트 배경, 핀+라벨까지 표시했습니다.
- 실제 거리(haversine)로 구간별/총 거리 계산 및 이동 모드(도보/지하철/차량)
  속도 가정치에 따른 ETA를 표시합니다.
- 외부 요약 패널(RouteSummary)과 카드 간에는 CustomEvent로 정보를 공유합니다.
  (간단한 단방향 브로드캐스트)
==================================================== */
