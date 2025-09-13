import {
  Users,
  Play,
  Gift,
  Camera,
  ShoppingCart,
  Building2,
  Award,
} from "lucide-react";

/**
 * 개발용 목업 데이터
 * TODO: 실제 서비스에서는 백엔드 API로 교체 예정
 * API 스펙: GET /api/tours, GET /api/partnerships, GET /api/tour-details/:id
 */

// 투어 상품 데이터
export const tourProducts = [
  {
    id: 1,
    title: "케이팝데몬헌터스 투어",
    image: "/img/tour_mock_01.jpg",
    price: "₩89,000",
    category: "food",
    kpopGroup: "케이팝데몬헌터스",
    description: "화제의 케이팝 데몬헌터스 콜라보와 함께하는 먹방 체험",
    tags: ["먹방", "케이팝데몬헌터스", "콜라보"],
    rating: 4.6,
    reviews: 134,
    partnership: "농심 × 케이팝데몬헌터스",
    roi: "+450%",
    newCustomers: "3,421명",
    brandValue: "+40%",
    location: "서울 강남구",
  },
  {
    id: 2,
    title: "국립중앙박물관 & 스냅 사진 투어",
    image: "/korean-food-tour-ramen.jpg",
    price: "₩125,000",
    category: "location",
    kpopGroup: "아이브",
    description: "국립중앙박물관에서 K-POP 스타일 사진촬영",
    tags: ["사진촬영", "박물관", "아이브"],
    rating: 4.8,
    reviews: 89,
    partnership: "국립중앙박물관 × IVE",
    roi: "+320%",
    newCustomers: "2,156명",
    brandValue: "+35%",
    location: "서울 용산구",
  },
];

// 파트너십 데이터 (기존 + K-Pop Demon Hunters 추가)
export const partnershipData = [
  // K-Pop Demon Hunters 관련 제휴사
  {
    id: 1,
    name: "Netflix",
    logo: "/logos/netflix-logo.png",
    category: "엔터테인먼트 플랫폼",
    products: 4,
    revenue: "₩2.45억",
    growth: "+340%",
    description: "Netflix 오리지널 K-Pop Demon Hunters 포토카드",
    benefits: [
      "한정판 포토카드 4종 세트",
      "Netflix 독점 디자인",
      "홀로그램 인증서 포함",
      "비하인드 스토리 영상 액세스",
    ],
    partnershipType: "미디어 콜라보",
    established: "2024.03",
    status: "진행중",
  },
  {
    id: 2,
    name: "농심",
    logo: "/logos/nongshim-logo.png",
    category: "식품·음료",
    products: 5,
    revenue: "₩1.89억",
    growth: "+25%",
    description: "K-Pop Demon Hunters 한정판 컵라면",
    benefits: [
      "캐릭터 디자인 컵라면 5종",
      "랜덤 포토카드 1매 증정",
      "컬렉터블 패키징",
      "특별 레시피 포함",
    ],
    partnershipType: "제품 콜라보",
    established: "2024.06",
    status: "런칭예정",
  },
  {
    id: 3,
    name: "Photoism",
    logo: "/logos/photoism-logo.png",
    category: "포토 서비스",
    products: 12,
    revenue: "₩980만",
    growth: "+180%",
    description: "K-Pop Demon Hunters 포토부스 프레임",
    benefits: [
      "AR 필터 포토부스 체험",
      "캐릭터 프레임 12종",
      "즉석 인화 서비스",
      "SNS 연동 기능",
    ],
    partnershipType: "체험 서비스",
    established: "2024.01",
    status: "운영중",
  },
  {
    id: 4,
    name: "투어 파트너",
    logo: "/logos/tour-partner-logo.png",
    category: "여행·관광",
    products: 3,
    revenue: "₩3.25억",
    growth: "+75%",
    description: "K-Pop Demon Hunters 서울 성지순례 투어",
    benefits: [
      "촬영지 방문 투어",
      "캐릭터 굿즈 패키지",
      "전문 가이드 동행",
      "인증서 발급",
    ],
    partnershipType: "여행 패키지",
    established: "2024.02",
    status: "진행중",
  },
  // 기존 파트너십 데이터
  {
    id: 5,
    name: "하나투어",
    logo: "/img/HanaTour_eng.png",
    category: "여행",
    products: 12,
    revenue: "₩2.4억",
    growth: "+45%",
    description: "전국 지점 네트워크를 통한 투어 패키지 판매",
    benefits: ["전국 지점 예약 가능", "단체 할인 혜택", "맞춤형 일정 구성"],
    partnershipType: "유통 파트너",
    established: "2023.05",
    status: "진행중",
  },
  {
    id: 6,
    name: "롯데면세점",
    logo: "/lotte-duty-free-logo.jpg",
    category: "쇼핑",
    products: 8,
    revenue: "₩1.8억",
    growth: "+32%",
    description: "투어 참가자 전용 면세점 쇼핑 혜택",
    benefits: ["10% 추가 할인", "VIP 라운지 이용", "무료 배송 서비스"],
    partnershipType: "쇼핑 혜택",
    established: "2023.08",
    status: "진행중",
  },
  {
    id: 7,
    name: "SM엔터테인먼트",
    logo: "/sm-entertainment-logo.jpg",
    category: "엔터테인먼트",
    products: 15,
    revenue: "₩3.2억",
    growth: "+28%",
    description: "SM 아티스트 관련 콘텐츠 및 굿즈 제공",
    benefits: ["한정판 굿즈", "팬미팅 우선 예약", "아티스트 사인회 참여권"],
    partnershipType: "콘텐츠 제휴",
    established: "2023.03",
    status: "진행중",
  },
];

// 파트너십 통계
export const partnershipStats = {
  totalPartners: 7,
  totalRevenue: "₩15.97억",
  averageGrowth: "+155%",
  activeCampaigns: 5,
  upcomingLaunches: 2,
};

// 투어 상세 데이터
export const tourDetailData = {
  1: {
    id: 1,
    title: "K-Pop Demon Hunters & Street Food Tour",
    subtitle: "Netflix Original Series Filming Location Complete Tour",
    location: "Naksan Fortress Wall, Bukchon Hanok Village, Myeongdong",
    images: [
      "/img/tour_mock_01.jpg",
      "/img/tour_mock_02.jpg",
      "/img/tour_mock_03.jpg",
      "/img/seoul_trip_hunters.jpg",
    ],
    price: "₩35,000",
    originalPrice: "₩45,000",
    discount: "22%",
    rating: 4.8,
    reviewCount: 247,
    duration: "4시간",
    groupSize: "최대 15명",
    language: "한국어, 영어",
    partnership: {
      primary: "넷플릭스",
      secondary: "하나투어",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200",
    },
    businessMetrics: {
      roi: "+340%",
      newCustomers: "2,847명",
      brandValue: "+25%",
      mediaValue: "₩12.4억",
      socialMentions: "45,672건",
      conversionRate: "18.5%",
    },
    itinerary: [
      {
        time: "09:00",
        location: "Gangnam Station Meeting Point",
        description: "Tour start and orientation",
        icon: Users,
      },
      {
        time: "10:00",
        location: "Dalgona Game Experience Center",
        description: "Hands-on dalgona candy making experience",
        icon: Play,
      },
      {
        time: "12:00",
        location: "Lunch Break",
        description: "Drama-inspired lunchbox menu",
        icon: Gift,
      },
      {
        time: "14:00",
        location: "Glass Bridge Set",
        description: "Photo zone and game experience",
        icon: Camera,
      },
      {
        time: "16:00",
        location: "Souvenir Shop",
        description: "Limited edition merchandise shopping",
        icon: ShoppingCart,
      },
    ],
    partnershipBenefits: [
      {
        icon: Building2,
        title: "Netflix Content Partnership",
        description: "Exclusive behind-the-scenes videos and photo cards",
        value: "Customer satisfaction 96%",
        gradient: "from-red-500 to-orange-500",
      },
      {
        icon: ShoppingCart,
        title: "Nongshim Collaboration",
        description: "Limited edition K-Pop Demon Hunters cup noodles",
        value: "5 character design varieties",
        gradient: "from-orange-500 to-yellow-500",
      },
      {
        icon: Award,
        title: "Photoism Photo Service",
        description: "AR filter photo booth with character frames",
        value: "12 exclusive frame designs",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        icon: Camera,
        title: "Tour Partner Package",
        description: "Seoul pilgrimage tour with professional guide",
        value: "Filming location certificate included",
        gradient: "from-blue-500 to-cyan-500",
      },
    ],
    marketingInsights: [
      {
        metric: "브랜드 노출 효과",
        value: "₩12.4억",
        growth: "+340%",
        description: "TV, 온라인 미디어 노출 가치",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        metric: "소셜 미디어 언급",
        value: "45,672건",
        growth: "+280%",
        description: "인스타그램, 틱톡, 유튜브 언급량",
        gradient: "from-blue-500 to-indigo-500",
      },
      {
        metric: "신규 고객 유입",
        value: "2,847명",
        growth: "+190%",
        description: "투어를 통한 신규 고객 확보",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        metric: "재방문율",
        value: "73%",
        growth: "+45%",
        description: "투어 참가 후 재방문 고객 비율",
        gradient: "from-orange-500 to-yellow-500",
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Sarah K.",
        rating: 5,
        date: "2025-08-15",
        content:
          "Amazing tour experience! Being able to experience scenes from the drama in real life was incredible. The guide was so friendly and took tons of photos for us. Highly recommend!",
        avatar: "S",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: 2,
        name: "Michael T.",
        rating: 5,
        date: "2025-08-10",
        content:
          "Joined with my international friends and everyone loved it. Such a great opportunity to experience Korean culture. The Netflix collaboration made it extra special!",
        avatar: "M",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: 3,
        name: "Jessica L.",
        rating: 4,
        date: "2025-08-05",
        content:
          "Making dalgona was harder than I expected but so much fun! The exclusive merchandise was worth it. Planning to join again next time!",
        avatar: "J",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        id: 4,
        name: "David P.",
        rating: 5,
        date: "2025-07-28",
        content:
          "As a K-Pop Demon Hunters fan, this tour exceeded all my expectations. The filming locations were authentic and the photo cards were amazing collector items!",
        avatar: "D",
        gradient: "from-orange-500 to-red-500",
      },
      {
        id: 5,
        name: "Emma W.",
        rating: 5,
        date: "2025-07-22",
        content:
          "Perfect blend of entertainment and cultural experience. The AR photo booth was incredible and the cup noodle collaboration was such a fun surprise!",
        avatar: "E",
        gradient: "from-pink-500 to-purple-500",
      },
    ],
  },
  2: {
    id: 2,
    title: "국립중앙박물관 & 스냅 사진 투어",
    subtitle: "K-POP Style Photography and Cultural Experience",
    location: "Yongsan-gu National Museum of Korea",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    ],
    price: "₩125,000",
    originalPrice: "₩150,000",
    discount: "17%",
    rating: 4.8,
    reviewCount: 89,
    duration: "3시간",
    groupSize: "최대 12명",
    language: "한국어, 영어",
    partnership: {
      primary: "국립중앙박물관",
      secondary: "IVE",
    },
    businessMetrics: {
      roi: "+320%",
      newCustomers: "2,156명",
      brandValue: "+35%",
      mediaValue: "₩8.7억",
      socialMentions: "32,145건",
      conversionRate: "22.1%",
    },
    itinerary: [
      {
        time: "10:00",
        location: "Museum Entrance",
        description: "Tour start and IVE styling session",
        icon: Users,
      },
      {
        time: "10:30",
        location: "Archaeology Hall",
        description: "Ancient Korean culture experience",
        icon: Camera,
      },
      {
        time: "11:30",
        location: "Art Gallery",
        description: "Traditional costume experience and photography",
        icon: Gift,
      },
      {
        time: "12:30",
        location: "Photo Zone",
        description: "K-POP concept group photography",
        icon: Camera,
      },
    ],
    partnershipBenefits: [
      {
        icon: Building2,
        title: "National Museum Special Exhibition",
        description: "Free access to special exhibitions for tour participants",
        value: "Monthly average 280 bookings",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        icon: Camera,
        title: "Professional Photographer",
        description: "Individual photography session with K-POP specialist",
        value: "98% satisfaction rate",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        icon: Award,
        title: "IVE Merchandise",
        description: "Limited edition photo cards and stickers",
        value: "95% collector preference",
        gradient: "from-orange-500 to-red-500",
      },
    ],
    marketingInsights: [
      {
        metric: "브랜드 노출 효과",
        value: "₩8.7억",
        growth: "+320%",
        description: "문화계 및 엔터테인먼트 미디어 노출",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        metric: "소셜 미디어 언급",
        value: "32,145건",
        growth: "+245%",
        description: "인스타그램, 틱톡 해시태그 언급",
        gradient: "from-blue-500 to-indigo-500",
      },
      {
        metric: "신규 고객 유입",
        value: "2,156명",
        growth: "+178%",
        description: "박물관 투어 신규 고객",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        metric: "재방문율",
        value: "81%",
        growth: "+52%",
        description: "투어 후 박물관 재방문율",
        gradient: "from-orange-500 to-yellow-500",
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Ashley M.",
        rating: 5,
        date: "2025-08-12",
        content:
          "As an IVE fan, I joined this tour and learned so much about Korean culture while getting amazing photos! The traditional costume experience was unforgettable.",
        avatar: "A",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: 2,
        name: "Ryan C.",
        rating: 5,
        date: "2025-08-08",
        content:
          "Never knew museums could be this fun! Planning to come back with more friends. The K-POP concept photography was absolutely professional.",
        avatar: "R",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: 3,
        name: "Sophie L.",
        rating: 4,
        date: "2025-08-03",
        content:
          "Great combination of culture and entertainment. The photographer was amazing and the IVE merchandise was totally worth it!",
        avatar: "S",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        id: 4,
        name: "James H.",
        rating: 5,
        date: "2025-07-30",
        content:
          "Perfect cultural immersion experience. The museum staff was incredibly knowledgeable and the photos turned out fantastic!",
        avatar: "J",
        gradient: "from-orange-500 to-yellow-500",
      },
    ],
  },
  // 제휴 파트너십 데이터 추가
  partnershipData: partnershipData,
  partnershipStats: partnershipStats,
};

// 헬퍼 함수들
export const getPartnerDetails = (partnerId) => {
  return partnershipData.find((partner) => partner.id === partnerId);
};

export const getPartnersByCategory = (category) => {
  return partnershipData.filter((partner) => partner.category === category);
};

export const getPartnersByGrowth = () => {
  return [...partnershipData].sort((a, b) => {
    const growthA = parseInt(a.growth.replace(/[^0-9]/g, ""));
    const growthB = parseInt(b.growth.replace(/[^0-9]/g, ""));
    return growthB - growthA;
  });
};
