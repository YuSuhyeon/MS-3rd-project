import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Wallet, Repeat, Sparkles, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// 코드값을 사람이 읽는 한글로 변환
const CODE_MAP = {
  rvit: {
    RVIT_1: "첫 방문",
    RVIT_2: "2번째 방문",
    RVIT_3: "3번째 방문",
    RVIT_4: "4회 이상",
  },
  q1: { Q1_1: "관광/여가", Q1_2: "기타 방문" },
  stay: {
    STAY_1: "1~3일",
    STAY_2: "4~6일",
    STAY_3: "7~13일",
    STAY_4: "14~29일",
    STAY_5: "30일 이상",
  },
  budget: {
    BUDGET_1: "~ $1,000",
    BUDGET_2: "$1,000 ~ $2,000",
    BUDGET_3: "$2,000 ~ $3,000",
    BUDGET_4: "$3,000+",
  },
};

function humanizeCode(kind, value) {
  if (!value) return "-";
  const table = CODE_MAP[kind] || {};
  if (table[value]) return table[value];
  if (kind === "considered") {
    const KO = {
      food: "미식",
      shopping: "쇼핑",
      nature: "자연 경관",
      relaxation: "휴양/휴식",
      heritage: "문화유산",
      tradition: "전통문화체험",
      museum: "박물관/미술관",
      kpop: "K-POP/한류",
      arts: "공연/예술",
      festival: "축제/행사",
      nightlife: "나이트라이프",
      themepark: "테마파크",
      beauty: "뷰티/미용",
      medical: "의료/치유",
      sports_view: "스포츠 관람",
      sports_play: "스포츠 체험",
      other: "기타",
    };
    const v = String(value).replace(/^considered_/, "");
    return KO[v] || v;
  }
  return value;
}

const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

const SummaryItem = ({ icon, label, value }) => (
  <motion.div variants={itemVariants} className="flex items-start gap-3">
    <div className="mt-1 flex-shrink-0 text-indigo-400">{icon}</div>
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-100" dynamic="true">{value}</div>
    </div>
  </motion.div>
);

export default function AnalysisSummaryPanel({ profile }) {
  const { t } = useTranslation("dashboard");
  
  if (!profile) return null;

  // ResultDashboard에서 analysis_result.inputs가 병합되어 전달됩니다.
  const summaryItems = [
    { icon: <Repeat size={18} />, label: t("visit_count"), value: humanizeCode("rvit", profile.rvit) },
    { icon: <CalendarDays size={18} />, label: t("stay_period"), value: humanizeCode("stay", profile.stay) },
    { icon: <Wallet size={18} />, label: t("travel_budget"), value: humanizeCode("budget", profile.budget) },
    { icon: <HelpCircle size={18} />, label: t("visit_purpose"), value: humanizeCode("q1", profile.q1) },
    { icon: <Sparkles size={18} />, label: t("interests_activities"), value: (profile.considered || []).map((c) => humanizeCode("considered", c)).join(", ") },
  ];

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ staggerChildren: 0.1 }} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        {summaryItems.map((item, idx) => (
          <SummaryItem key={idx} {...item} />
        ))}
      </div>
    </motion.div>
  );
}

