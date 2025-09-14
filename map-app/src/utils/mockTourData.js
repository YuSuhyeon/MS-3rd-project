// 목업 데이터: 빌드용 최소 스키마 제공
import { TrendingUp, Users, Award, DollarSign } from "lucide-react";

export const tourProducts = [
  {
    id: 1,
    title: "K-POP 로케이션 투어",
    description: "인기 K-POP 촬영지와 포토스팟을 하루 만에!",
    category: "location",
    partnership: "Netflix",
    rating: 4.8,
    kpopGroup: "Demon Hunters",
    reviews: 132,
    image: "/img/seoul_trip_hunters.jpg",
  },
  {
    id: 2,
    title: "K-POP 굿즈 쇼핑",
    description: "한정판 앨범과 포토카드 수집 투어",
    category: "goods",
    partnership: "Photoism",
    rating: 4.6,
    kpopGroup: "Aespa",
    reviews: 98,
    image: "/img/aespa.jpg",
  },
  {
    id: 3,
    title: "한강 피크닉 & 먹방",
    description: "라면, 디저트와 함께하는 감성 체험",
    category: "food",
    partnership: "Nongshim",
    rating: 4.7,
    kpopGroup: "Various",
    reviews: 76,
    image: "/img/ns_ramen.png",
  },
];

export const partnershipData = [
  {
    id: 1,
    name: "Netflix",
    category: "Media",
    products: 12,
    revenue: "₩120M",
    growth: "+18%",
    logo: "/img/HanaTour_eng.png",
    status: "진행중",
    description: "K-콘텐츠 협업 및 공동 프로모션",
    benefits: ["포토카드 제공", "콜라보 굿즈"]
  },
  {
    id: 2,
    name: "Photoism",
    category: "Studio",
    products: 8,
    revenue: "₩65M",
    growth: "+12%",
    logo: "/img/photoism_kdh_main.jpg",
    status: "런칭예정",
    description: "투어 참가자 무료 촬영 이벤트",
    benefits: ["무료 촬영권", "액자 증정"]
  },
  {
    id: 3,
    name: "Nongshim",
    category: "Food",
    products: 15,
    revenue: "₩80M",
    growth: "+9%",
    logo: "/img/ns_ramen.png",
    status: "진행중",
    description: "한강 라면 체험 프로모션",
    benefits: ["시식권", "기념품"]
  },
  {
    id: 4,
    name: "VisitSeoul",
    category: "Tourism",
    products: 10,
    revenue: "₩40M",
    growth: "+6%",
    logo: "/img/seoul_night.png",
    status: "진행중",
    description: "서울 관광 명소 연계",
    benefits: ["가이드북", "쿠폰"]
  },
];

export const BusinessMetrics = [
  {
    icon: TrendingUp,
    label: "매출 증가율",
    value: "+285%",
    description: "전년 대비 매출 성장",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    label: "신규 고객 유입",
    value: "7,394명",
    description: "월평균 신규 가입자",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Award,
    label: "브랜드 가치",
    value: "+42%",
    description: "브랜드 인지도 상승",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: DollarSign,
    label: "평균 ROI",
    value: "298%",
    description: "마케팅 투자 수익",
    gradient: "from-orange-500 to-red-500",
  },
];

export const tourDetailData = {
  // 파트너쉽 섹션에서 사용하는 집계
  partnershipData,
  partnershipStats: {
    totalPartners: 24,
    averageGrowth: "+11%",
    activeCampaigns: 7,
    upcomingLaunches: 3,
  },

  // 투어 상세 더미 데이터 (id별)
  1: {
    title: "K-POP Demon Hunters 시그니처 투어",
    subtitle: "서울 도심 명소와 촬영지를 잇는 하루 코스",
    location: "서울 전역",
    rating: 4.8,
    reviewCount: 132,
    duration: "6시간",
    groupSize: "최대 12명",
    language: "한국어/영어",
    price: "₩89,000",
    originalPrice: "₩129,000",
    discount: "31%",
    partnership: { primary: "Netflix", secondary: "Photoism" },
    images: [
      "/img/seoul_trip_hunters.jpg",
      "/img/myeondong.jpg",
      "/img/jamsil.jpg",
    ],
    itinerary: [
      { time: "09:00", title: "서울역 집결", desc: "가이드 미팅 및 오리엔테이션" },
      { time: "10:00", title: "촬영지 방문", desc: "대표 MV 촬영지 포토스팟" },
      { time: "12:00", title: "점심", desc: "K-푸드 맛집" },
      { time: "14:00", title: "한강 피크닉", desc: "라면 & 디저트" },
      { time: "16:00", title: "포토이즘 스튜디오", desc: "기념 촬영" },
    ],
    partnershipBenefits: [
      "한정 포토카드 증정",
      "포토이즘 촬영 할인",
      "굿즈 쿠폰 제공",
    ],
    businessMetrics: {
      roi: "298%",
      newCustomers: "7,394명",
      brandValue: "+42%",
      conversionRate: "8.4%",
      socialMentions: "12.3K",
      mediaValue: "₩210M",
    },
    marketingInsights: [
      "SNS 해시태그 도달률 상승",
      "10~20대 여성 타겟 반응 우수",
      "콜라보 굿즈 판매 호조",
    ],
    reviews: [
      { user: "Ari***", rating: 5, comment: "코스가 알차고 사진이 예쁘게 나와요!" },
      { user: "Min***", rating: 4, comment: "가이드 친절, 시간 배분 좋음" },
    ],
  },
  2: {
    title: "K-POP 굿즈 컬렉션 투어",
    subtitle: "핫플 굿즈샵과 한정판 구매 루트",
    location: "강남/홍대",
    rating: 4.6,
    reviewCount: 98,
    duration: "5시간",
    groupSize: "최대 10명",
    language: "한국어/영어",
    price: "₩79,000",
    originalPrice: "₩109,000",
    discount: "27%",
    partnership: { primary: "Photoism", secondary: "Nongshim" },
    images: [
      "/img/tour_mock_01.jpg",
      "/img/tour_mock_02.jpg",
      "/img/tour_mock_03.jpg",
    ],
    itinerary: [
      { time: "10:00", title: "홍대 인포", desc: "그룹별 인기 굿즈 소개" },
      { time: "11:30", title: "샵 투어", desc: "한정판 발매점 방문" },
      { time: "14:00", title: "스튜디오 촬영", desc: "포토이즘 스페셜" },
    ],
    partnershipBenefits: ["포카 증정", "할인 쿠폰"],
    businessMetrics: {
      roi: "214%",
      newCustomers: "4,210명",
      brandValue: "+31%",
      conversionRate: "6.1%",
      socialMentions: "8.7K",
      mediaValue: "₩140M",
    },
    marketingInsights: ["굿즈 발매일 트래픽 급증"],
    reviews: [
      { user: "Jin***", rating: 5, comment: "득템 성공! 가성비 좋아요" },
    ],
  },
};

