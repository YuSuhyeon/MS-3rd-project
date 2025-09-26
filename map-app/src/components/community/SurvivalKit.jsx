import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Camera, Globe, Sparkles } from "lucide-react";
import QuickTranslator from "./QuickTranslator";
import OCR from "../../pages/VisionOCR";
import {
  NeonCard,
  NeonButton,
  GradientText,
  ResponsiveGrid,
} from "../ui/NeonTheme";
import { useTranslation } from "react-i18next";

export default function SurvivalKit() {
  const [activeSection, setActiveSection] = useState("menu");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const { t } = useTranslation("SurvivalKit");
  const { t: tCommon } = useTranslation("common");

  const sections = useMemo(
    () => [
      {
        id: "menu",
        label: t("vision_ocr"),
        description: t("section_vision_benefit"),
        icon: Camera,
      },
      {
        id: "translate",
        label: t("quick_translator"),
        description: t("section_translator_benefit"),
        icon: Globe,
      },
      {
        id: "culture",
        label: t("culture_guide"),
        description: t("section_culture_benefit"),
        icon: BookOpen,
      },
    ],
    [t]
  );

  const glowGradients = {
    menu: "from-cyan-500/30 via-blue-500/20 to-purple-500/30",
    translate: "from-emerald-400/30 via-teal-400/20 to-blue-400/30",
    culture: "from-pink-400/25 via-purple-400/15 to-orange-400/25",
  };

  const cultureGuide = [
    {
      title: t("greeting"),
      content: t("greeting_content"),
      extra: t("greeting_extra"),
      icon: "🙇‍♀️",
      modaldata: {
        title: t("greeting_modal_title"),
        paragraphs: [
          t("greeting_modal_paragraphs"),
          t("greeting_modal_paragraphs_2"),
        ],
        list: [
          t("greeting_modal_list_1"),
          t("greeting_modal_list_2"),
          t("greeting_modal_list_3"),
          t("greeting_modal_list_4"),
          t("greeting_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("greeting_modal_link_1"),
            url: "https://www.youtube.com/watch?v=oAFRq1Zz-9A",
          },
        ],
      },
    },
    {
      title: t("meal"),
      content: t("meal_content"),
      extra: t("meal_extra"),
      icon: "🍽️",
      modaldata: {
        title: t("meal_modal_title"),
        paragraphs: [t("meal_modal_paragraphs"), t("meal_modal_paragraphs_2")],
        list: [
          t("meal_modal_list_1"),
          t("meal_modal_list_2"),
          t("meal_modal_list_3"),
          t("meal_modal_list_4"),
          t("meal_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("meal_modal_link_1"),
            url: "https://www.youtube.com/watch?v=B5GwksUY8dw",
          },
        ],
      },
    },
    {
      title: t("transportation"),
      content: t("transportation_content"),
      extra: t("transportation_extra"),
      icon: "🚇",
      modaldata: {
        title: t("transportation_modal_title"),
        paragraphs: [
          t("transportation_modal_paragraphs"),
          t("transportation_modal_paragraphs_2"),
        ],
        list: [
          t("transportation_modal_list_1"),
          t("transportation_modal_list_2"),
          t("transportation_modal_list_3"),
          t("transportation_modal_list_4"),
          t("transportation_modal_list_5"),
        ],
        links: [
          {
            text: "🎥 " + t("transportation_modal_link_1"),
            url: "https://www.youtube.com/watch?v=OQibRFJtPXo",
          },
          {
            text: "🚇 " + t("transportation_modal_link_2"),
            url: "https://korean.visitseoul.net/subway",
          },
        ],
      },
    },
    {
      title: t("tip"),
      content: t("tip_content"),
      extra: t("tip_extra"),
      icon: "💰",
      modaldata: {
        title: t("tip_modal_title"),
        paragraphs: [t("tip_modal_paragraphs")],
        list: [
          t("tip_modal_list_1"),
          t("tip_modal_list_2"),
          t("tip_modal_list_3"),
        ],
      },
    },
    {
      title: t("footwear"),
      content: t("footwear_content"),
      extra: t("footwear_extra"),
      icon: "👟",
      modaldata: {
        title: t("footwear_modal_title"),
        paragraphs: [
          t("footwear_modal_paragraphs"),
          t("footwear_modal_paragraphs_2"),
          t("footwear_modal_paragraphs_3"),
        ],
        list: [t("footwear_modal_list_1"), t("footwear_modal_list_2")],
      },
    },
    {
      title: t("gift"),
      content: t("gift_content"),
      extra: t("gift_extra"),
      icon: "🎁",
      modaldata: {
        title: t("gift_modal_title"),
        paragraphs: [t("gift_modal_paragraphs"), t("gift_modal_paragraphs_2")],
        list: [t("gift_modal_list_1"), t("gift_modal_list_2")],
      },
    },
  ];

  return (
    <div className="relative w-full space-y-10">
      {/* 상단 헤더 카드 - SpotifyPlaylistGenerator와 동일한 스타일 */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-black/30 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>
        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-100/80">
              <Sparkles className="h-4 w-4 text-purple-200" />
              {t("hero_tagline")}
            </div>
            <GradientText
              size="2xl"
              variant="primary"
              className="leading-tight"
            >
              {t("hero_title")}
            </GradientText>
            <p className="text-sm text-purple-100/85 sm:text-base">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-purple-200/80">
              {sections.map((section) => (
                <span
                  key={section.id}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1"
                >
                  {section.label}
                </span>
              ))}
            </div>
          </div>

          {/* 섹션 선택 카드 */}
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-black/35 p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.35em] text-purple-200/70">
                  도구 선택
                </p>
                <GradientText size="xl" variant="primary">
                  여행 도구
                </GradientText>
              </div>
              <div className="grid gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all duration-300 ${
                        isActive
                          ? "border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                          : "hover:border-purple-300/40"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          glowGradients[section.id]
                        } opacity-0 transition-opacity duration-500 group-hover:opacity-60 ${
                          isActive ? "opacity-80" : ""
                        }`}
                      />
                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className={`rounded-lg border border-white/10 p-1.5 transition-colors ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "bg-black/30 text-purple-100"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {section.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {activeSection === "menu" && (
            <motion.div
              key="section-menu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-black/30 p-6 sm:p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-3xl blur-xl" />
                <div className="relative z-10">
                  <OCR />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "translate" && (
            <motion.div
              key="section-translate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-black/30 p-6 sm:p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-blue-600/10 rounded-3xl blur-xl" />
                <div className="relative z-10">
                  <QuickTranslator />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "culture" && (
            <motion.div
              key="section-culture"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-black/30 p-6 sm:p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-orange-600/10 rounded-3xl blur-xl" />
                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <GradientText
                        size="2xl"
                        variant="primary"
                        className="leading-tight"
                      >
                        {t("culture_guide")}
                      </GradientText>
                      <p className="text-sm text-purple-100/80 sm:text-base">
                        한국 문화와 예절에 대한 실용적인 가이드
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cultureGuide.map((guide, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => setSelectedGuide(guide)}
                        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_40px_120px_-40px_rgba(236,72,153,0.45)]"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%)] opacity-60" />
                        <div className="relative z-10 flex flex-col gap-4 p-6">
                          <div className="flex items-start justify-between">
                            <span className="text-4xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
                              {guide.icon}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 shadow-[0_0_20px_rgba(236,72,153,0.6)]" />
                          </div>
                          <div className="space-y-2">
                            <GradientText
                              variant="primary"
                              size="lg"
                              className="block leading-tight"
                            >
                              {guide.title}
                            </GradientText>
                            <p className="text-sm leading-relaxed text-gray-200">
                              {guide.content}
                            </p>
                            <p className="text-xs text-purple-200/70">
                              {guide.extra}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] uppercase tracking-[0.35em] text-purple-200/60">
                              {t("culture_guide")}
                            </span>
                            <NeonButton
                              variant="primary"
                              size="sm"
                              className="text-xs"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedGuide(guide);
                              }}
                            >
                              {tCommon("main.more.view")}
                            </NeonButton>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {selectedGuide && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setSelectedGuide(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <NeonCard
                variant="primary"
                className="relative overflow-hidden p-6 sm:p-8"
                delay={0}
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedGuide.icon}</span>
                    <GradientText
                      variant="primary"
                      size="2xl"
                      className="leading-tight"
                    >
                      {selectedGuide.modaldata?.title || selectedGuide.title}
                    </GradientText>
                  </div>

                  {selectedGuide.modaldata?.paragraphs?.map((para, index) => (
                    <p
                      key={index}
                      className="text-sm leading-relaxed text-gray-200"
                    >
                      {para}
                    </p>
                  ))}

                  {selectedGuide.modaldata?.list && (
                    <ul className="space-y-2 text-sm text-gray-200">
                      {selectedGuide.modaldata.list.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {selectedGuide.modaldata?.links && (
                    <div className="space-y-2 pt-2">
                      {selectedGuide.modaldata.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-purple-200 transition-colors hover:text-white"
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 text-right">
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedGuide(null)}
                    >
                      {t("modal_close")}
                    </NeonButton>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
