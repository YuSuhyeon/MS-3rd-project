import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Wand2, Map, Edit3 } from "lucide-react";
import BrandLogo from "components/BrandLogo";

const Section = ({ id, children, className = "" }) => (
  <section
    id={id}
    className={`relative min-h-screen w-full flex items-center justify-center px-6 md:px-10 ${className}`}
  >
    <div className="w-full max-w-6xl">{children}</div>
  </section>
);

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="bg-white text-gray-900">
      {/* Section 1: Hero */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background: pattern + optional video */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 80% 10%, rgba(124,58,237,0.18), transparent 60%), " +
              "radial-gradient(900px 500px at 0% 100%, rgba(236,72,153,0.12), transparent 60%), " +
              `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">\n' +
                  '<rect width="100%" height="100%" fill="white"/>\n' +
                  '<g stroke="%238b5cf6" stroke-opacity="0.18" fill="none" stroke-width="2">\n' +
                  '<path d="M80,760 C220,640 360,640 520,520 C680,400 920,360 1200,420" stroke-dasharray="6 10"/>\n' +
                  '<path d="M0,520 C160,440 360,440 560,360" stroke-dasharray="4 12"/>\n' +
                  "</g>\n" +
                  '<g fill="%238b5cf6" fill-opacity="0.22">\n' +
                  '<circle cx="520" cy="520" r="6"/>\n' +
                  '<circle cx="1200" cy="420" r="6"/>\n' +
                  '<circle cx="80" cy="760" r="6"/>\n' +
                  "</g>\n" +
                  "</svg>"
              )}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10">
          <video
            className="w-full h-full object-cover"
            src={process.env.PUBLIC_URL + "/assets/landing/hero.mp4"}
            poster={process.env.PUBLIC_URL + "/assets/landing/hero.jpg"}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/55" />
        </div>

        {/* Top brand */}
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl">
              <BrandLogo size={48} />
            </div>
            <div>
              <p className="text-white/90 font-semibold text-sm">
                {t("landing.brand.title")}
              </p>
              <p className="text-white/70 text-xs">{t("landing.brand.subtitle")}</p>
            </div>
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/90">
              {t("landing.hero.subtitle")}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/persona"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                {t("landing.hero.cta.start")}
              </Link>
              <a
                href="#persona"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/90 border border-white/30 hover:bg-white/10 transition-colors"
              >
                {t("landing.hero.cta.more")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Persona */}
      <Section id="persona" className="bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("landing.persona.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              {t("landing.persona.desc")}
            </p>
            <div className="mt-8">
              <Link
                to="/persona"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t("landing.persona.cta")}
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
                  title: "어떤 여행 스타일을 선호하시나요?",
                  pills: ["모험적", "문화적", "휴양"],
                  accent: "from-purple-500 to-pink-500",
                },
                {
                  title: "누구와 함께 여행하시나요?",
                  pills: ["혼자서", "연인/부부", "가족"],
                  accent: "from-indigo-500 to-blue-500",
                },
                {
                  title: "관심 있는 활동은?",
                  pills: ["#맛집", "#쇼핑", "#휴양"],
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
      <Section id="ai-reco" className="bg-gray-50">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("landing.ai.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              {t("landing.ai.desc")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["#맛집", "#쇼핑", "#휴양", "#문화", "#사진"].map((t) => (
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
                {t("landing.map.preview")}
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Section 4: 자유로운 편집 기능 */}
      <Section id="editing" className="bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("landing.edit.title")}
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              {t("landing.edit.desc")}
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
                    "인천공항 → 호텔 체크인",
                    "광장시장 맛집 탐방",
                    "덕수궁 산책",
                    "남산타워 야경",
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
                    되돌리기
                  </div>
                  <div className="px-3 py-2 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600">
                    저장
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Section 5: Final CTA */}
      <Section id="cta" className="bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.cta.title")}
          </h2>
          <div className="mt-8">
            <Link
              to="/persona"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
            >
              {t("landing.cta.start")}
            </Link>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
