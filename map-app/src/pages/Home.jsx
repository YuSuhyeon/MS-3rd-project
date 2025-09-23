import React, { useState, useEffect } from "react";
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
  useMotionValueEvent,
  AnimatePresence,
  useTransform,
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

  const places = [
    {
      id: "place1",
      name: t("place1"),
      icon: "🛍️",
      areaName: "명동 관광특구",
    },
    {
      id: "place2",
      name: t("place2"),
      icon: "🏛️",
      areaName: "광화문·덕수궁",
    },
    {
      id: "place3",
      name: t("place3"),
      icon: "🌍",
      areaName: "이태원 관광특구",
    },
    {
      id: "place4",
      name: t("place4"),
      icon: "🎡",
      areaName: "잠실 관광특구",
    },
  ];

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
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
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
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("home.persona.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              {t("home.persona.desc")}
            </p>
            <div className="mt-8">
              <Link
                to="/persona"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t("home.persona.cta")}
                <Wand2 className="w-4 h-4" />
              </Link>
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
                  className="p-5 rounded-2xl bg-white shadow-xl border border-gray-100"
                >
                  <div className="text-sm font-semibold text-gray-900 mb-3">
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

      {/* Section 3: AI 맞춤 코스 추천 */}
      <Section id="ai-reco">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("home.ai_reco.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              {t("home.ai_reco.desc")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                t("home.ai_reco.tag1"),
                t("home.ai_reco.tag2"),
                t("home.ai_reco.tag3"),
                t("home.ai_reco.tag4"),
                t("home.ai_reco.tag5"),
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-white border text-gray-700 shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Simple animated map preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="w-full h-[360px] bg-[radial-gradient(1200px_600px_at_80%_10%,rgba(99,102,241,0.12),transparent),radial-gradient(900px_500px_at_0%_100%,rgba(99,102,241,0.08),transparent)] bg-gray-100">
                {/* Path */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40,300 C120,220 180,240 240,180 C300,120 360,100 460,160"
                    stroke="#8b5cf6"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="6 10"
                  />
                </svg>
                {/* Pins */}
                <div className="absolute left-8 bottom-8 w-8 h-8 rounded-full bg-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="absolute left-[45%] top-[45%] w-8 h-8 rounded-full bg-pink-500 border-4 border-white shadow-xl flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="absolute right-10 top-16 w-8 h-8 rounded-full bg-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-white font-bold">
                  E
                </div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 border text-sm flex items-center gap-2 shadow">
                <Map className="w-4 h-4 text-purple-600" />
                {t("home.map.preview_label")}
              </div>
            </div>
          </motion.div>
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
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("home.editing.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
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
            <div className="relative w-[280px] h-[540px] rounded-[36px] bg-gray-900 shadow-2xl p-3">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-full" />
              <div className="bg-white w-full h-full rounded-[28px] p-4 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div className="font-semibold">나의 일정</div>
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
                      className="p-3 rounded-2xl border bg-white shadow-sm flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                        {i + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {t}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 rounded-xl text-center text-sm font-semibold border">
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
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            이제, 당신의 완벽한 여행을 시작할 시간
          </h2>
          <div className="mt-8">
            <Link
              to="/persona"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
            >
              5가지 질문으로 시작하기
            </Link>
          </div>
        </motion.div>
      </Section>
      <AnimatePresence>
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
              className="relative bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
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
                <p className="text-gray-300">{t("modal.instruction")}</p>
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
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
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
                <p className="text-gray-400 text-sm">
                  {t("modal.disclaimer.prefix")}{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    {t("modal.disclaimer.terms")}
                  </a>
                  {t("modal.disclaimer.and")}{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
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

export default KPopTravelHome;
