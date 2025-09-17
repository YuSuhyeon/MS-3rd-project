import {
  Users,
  Play,
  Gift,
  Camera,
  ShoppingCart,
  Building2,
  Award,
  Bus,
} from "lucide-react";

// 투어 상품 데이터
export const tourProducts = [
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
    title: "LG 트윈스 X 교촌치킨과 함께하는 야구장 + 롯데월드 투어",
    image: "/img/baseball_chicken.jpg",
    price: "₩100,000",
    category: "sports",
    kpopGroup: "LG 트윈스",
    description:
      "잠실야구장 프리미엄 관람 + 치킨맥주 + 롯데월드 자유이용권 패키지",
    tags: ["Baseball", "Korean Food", "Sports", "Lotte World", "Jamsil"],
    rating: 4.8,
    reviews: 445,
    location: "서울 송파구 (잠실 관광 특구)",
  },
  {
    id: 5,
    title: "강남 K-뷰티 X 올리브영 프리미엄 뷰티 투어",
    image: "/img/oliveyoung_store.jpg",
    price: "₩135,000",
    category: "beauty",
    kpopGroup: "올리브영",
    description:
      "강남 피부과 케어 + K-뷰티 브랜드 체험 + 올리브영 쇼핑 + 한방 스파",
    tags: ["K-Beauty", "Skincare", "Wellness", "Premium", "Gangnam"],
    rating: 4.9,
    reviews: 428,
    location: "서울 강남구",
  },
  {
    id: 6,
    title: "국립중앙박물관 X 카카오프렌즈 디지털 체험관",
    image: "/img/kakao_shop.jpg",
    price: "₩55,000",
    category: "culture",
    kpopGroup: "카카오프렌즈",
    description:
      "AI 도슨트와 카카오프렌즈 캐릭터가 함께하는 재미있는 박물관 체험",
    tags: ["Museum", "Kakao Friends", "AI Experience", "Photo Zone", "Culture"],
    rating: 4.8,
    reviews: 285,
    location: "서울 용산구",
  },
];
//partnershipData 데이터
export const partnershipData = [
  {
    id: 1,
    name: "Netflix",
    logo: "/img/Company=Netflix.png",
    category: "Netflix Korea",
  },
  {
    id: 2,
    name: "Spotify",
    logo: "/img/Company=Spotify.png",
    category: "Spotify",
  },
  {
    id: 3,
    name: "Naver",
    logo: "/img/naver_logo.png",
    category: "Naver",
  },
  {
    id: 4,
    name: "National Museum of Korea",
    logo: "/img/국립중앙박물관로고.png",
    category: "National Museum of Korea",
  },

  {
    id: 5,
    name: "Microsoft",
    logo: "/img/Company=Microsoft.png",
    category: "Microsoft Korea",
  },
  {
    id: 6,
    name: "Lotte Duty Free",
    logo: "/img/lotte_duty_free.png",
    category: "Lotte Duty Free",
  },
  {
    id: 7,
    name: "Hana Tour",
    logo: "/img/HanaTour_eng.png",
    category: "Hana Tour",
  },
  {
    id: 8,
    name: "LG TWINS",
    logo: "/img/lg_twins_logo.jpg",
    category: "LG TWINS",
  },

  {
    id: 9,
    name: "Paypal",
    logo: "/img/Company=Paypal.png",
    category: "Paypal Korea",
  },
  {
    id: 10,
    name: "CJ",
    logo: "/img/CJ.png",
    category: "CJ",
  },
  {
    id: 11,
    name: "Lotte",
    logo: "/img/lotte_logo.png",
    category: "Lotte",
  },
  {
    id: 13,
    name: "Uber",
    logo: "/img/Company=Uber.png",
    category: "Uber Korea",
  },

  {
    id: 14,
    name: "SK Telecom",
    logo: "/img/sk_telecom_logo.png",
    category: "SK Telecom",
  },
  {
    id: 15,
    name: "JYP SHOP",
    logo: "/img/jypshoplogo.svg",
    category: "JYP SHOP",
  },
  {
    id: 16,
    name: "KaKao",
    logo: "/img/kakao.png",
    category: "KaKao",
  },
  {
    id: 17,
    name: "SAMSUNG",
    logo: "/img/samsung_org.jpg",
    category: "SAMSUNG",
  },
];

// 투어 상세 데이터
export const tourDetailData = {
  1: {
    id: 1,
    bookingUrl:
      "https://triple.global/en/tna/products/0a85aa0c-7d4e-47ec-b3dd-67195c248d71?date=2025-09-20",
    title: "K-Pop Demon Hunters Theme Tour",
    subtitle: "Netflix Original Series Filming Location Complete Tour",
    location: "Everland, Bukchon Hanok Village, Myeongdong",
    images: [
      "/img/tour_mock_01.jpg",
      "/img/tour_mock_02.jpg",
      "/img/tour_mock_03.jpg",
      "/img/seoul_trip_hunters.jpg",
    ],
    price: "₩69,000",
    originalPrice: "₩89,000",
    discount: "22%",
    rating: 5.0,
    reviewCount: 250,
    duration: "8시간",
    groupSize: "최대 15명",
    language: "한국어, 영어",
    partnership: {
      primary: "NETFLIX",
      secondary: "Interpark Global",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200",
    },
    specialFeatures: [
      "Netflix Original Series 촬영 현장 견학",
      "한정판 K-Pop Demon Hunters 포토카드 세트",
      "에버랜드 1일 입장권 포함",
      "Kpoop Demon Hunters 콘셉트 점심 도시락(진우 정식) 제공",
      "독점 굿즈 및 기념품 쇼핑",
    ],
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
    bookingUrl: "https://ignite.microsoft.com/en-US/home",
    title: "Microsoft AI Tour Seoul",
    subtitle: "AI 기술과 문화재 복원의 만남",
    location: "서울 중구 Microsoft Korea",
    images: [
      "/img/thumbnail_ms.jpg",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    ],
    price: "₩125,000",
    originalPrice: "₩150,000",
    discount: "17%",
    rating: 4.8,
    reviewCount: 89,
    duration: "4시간",
    groupSize: "최대 20명",
    language: "한국어, 영어",
    partnership: {
      primary: "Microsoft Korea",
      secondary: "국가유산청",
    },
    specialFeatures: [
      "마이크로소프트 Azure AI 실습 워크샵",
      "경복궁 문화재 복원  AI기술 실습 패키지 제공 ",
      "국립 중앙 박물관 입장권 포함",
      "글로벌 테크 트렌드 리포트 (영문)",
    ],
    itinerary: [
      {
        time: "09:00",
        location: "Microsoft Korea Office",
        description: "AI 기술 소개 및 투어 시작",
        icon: Users,
      },
      {
        time: "10:00",
        location: "AI 데모 센터",
        description: "문화재 복원 AI 기술 체험",
        icon: Play,
      },
      {
        time: "11:30",
        location: "국가유산청 협업관",
        description: "디지털 문화재 복원 사례 체험",
        icon: Camera,
      },
      {
        time: "13:00",
        location: "마이크로소프트 굿즈샵",
        description: "한정판 기념품 및 AI 체험 키트",
        icon: Gift,
      },
    ],
    reviews: [
      {
        id: 1,
        name: "김현수",
        rating: 5,
        date: "2025-08-12",
        content:
          "AI 기술로 문화재를 복원하는 과정이 정말 신기했어요! Microsoft의 최신 기술을 직접 체험할 수 있어서 좋았습니다.",
        avatar: "김",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: 2,
        name: "Alex Johnson",
        rating: 5,
        date: "2025-08-08",
        content:
          "Amazing technology demonstration! The AI restoration process was fascinating and the collaboration with Korean heritage preservation was inspiring.",
        avatar: "A",
        gradient: "from-green-500 to-blue-500",
      },
      {
        id: 3,
        name: "이서연",
        rating: 4,
        date: "2025-08-03",
        content:
          "IT와 전통문화의 융합이 인상적이었어요. 특히 AI로 복원된 문화재들을 직접 볼 수 있어서 의미 있는 시간이었습니다.",
        avatar: "이",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: 4,
        name: "Michael Park",
        rating: 5,
        date: "2025-07-30",
        content:
          "Perfect blend of cutting-edge technology and cultural preservation. The Microsoft team was very knowledgeable and the demos were impressive!",
        avatar: "M",
        gradient: "from-orange-500 to-red-500",
      },
    ],
  },

  3: {
    id: 3,
    title: "한강 버스 X 인스타그램 서울 핫플 투어",
    subtitle: "한강을 따라 펼쳐지는 서울 대표 포토스팟 완전 정복",
    location: "한강공원 (여의도-잠실-반포-마포)",
    images: [
      "/img/hangang_bus.jpg",
      "/img/hangang_bus_interior.jpg",
      "/img/hangang_bus_route.jpg",
      "/img/banpo_rainbow.jpg",
    ],
    price: "₩69,000",
    originalPrice: "₩85,000",
    discount: "19%",
    rating: 4.6,
    reviewCount: 312,
    duration: "3.5시간",
    groupSize: "최대 25명",
    language: "한국어, 영어",
    partnership: {
      primary: "서울관광재단",
      secondary: "한강사업본부",
      logo: "/img/seoul_tourism_logo.png",
    },
    specialFeatures: [
      "전문 포토그래퍼의 인스타그램 촬영 가이드",
      "포토존별 최적 촬영 시간 및 각도 안내",
      "무료 휴대폰 삼각대 및 셀카봉 대여",
      "편집된 고화질 사진 10장 당일 제공",
      "서울 핫플 지도 및 포토 팁북 증정",
      "한강버스 창가석 포토존 우선 배정",
    ],

    itinerary: [
      {
        time: "15:00",
        location: "여의도 한강공원",
        description: "투어 시작 및 인스타그램 포토 팁 강의",
        icon: Users,
      },
      {
        time: "15:30",
        location: "한강버스 (여의도→잠실)",
        description: "63빌딩 & IFC몰 배경 버스 내 촬영",
        icon: Camera,
      },
      {
        time: "16:00",
        location: "잠실 롯데월드타워 포토존",
        description: "서울 스카이라인 대표 인증샷 촬영",
        icon: Camera,
      },
      {
        time: "16:45",
        location: "한강버스 (잠실→반포)",
        description: "한강 크루즈 감성 동영상 촬영",
        icon: Play,
      },
      {
        time: "17:15",
        location: "반포 무지개분수",
        description: "골든아워 무지개분수 타임랩스 촬영",
        icon: Camera,
      },
      {
        time: "18:00",
        location: "세빛섬 LED 쇼",
        description: "야경 불꽃놀이 및 단체 기념 촬영",
        icon: Gift,
      },
    ],
    reviews: [
      {
        id: 1,
        name: "인스타그래머 지은",
        rating: 5,
        date: "2025-09-15",
        content:
          "사진 진짜 예쁘게 나왔어요! 포토그래퍼님이 각도까지 다 잡아주셔서 인스타에 올릴 사진 한 달치는 건졌네요. 무지개분수 타이밍 완벽!",
        avatar: "지",
        gradient: "from-pink-500 to-purple-500",
      },
      {
        id: 2,
        name: "Emma Photographer",
        rating: 5,
        date: "2025-09-12",
        content:
          "Perfect tour for content creators! The photographer taught us amazing techniques and the golden hour shots were incredible. Highly recommend!",
        avatar: "E",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: 3,
        name: "커플 민수♥지혜",
        rating: 5,
        date: "2025-09-10",
        content:
          "데이트로 완벽했어요! 한강버스 타면서 사진도 많이 찍고, 야경도 보고. 포토그래퍼님 덕분에 프로필 사진도 건졌습니다!",
        avatar: "커",
        gradient: "from-red-500 to-pink-500",
      },
      {
        id: 4,
        name: "Sarah Content",
        rating: 4,
        date: "2025-09-08",
        content:
          "Great experience for influencers and anyone who loves photography! The Han River views are stunning and perfect for social media content.",
        avatar: "S",
        gradient: "from-green-500 to-blue-500",
      },
    ],
  },
  4: {
    id: 4,
    bookingUrl: "https://www.lgtwins.com/ticket/",
    title: "LG 트윈스 프리미엄 야구 관람 투어",
    subtitle: "잠실야구장에서 즐기는 완벽한 야구 체험",
    location: "잠실야구장, 롯데월드타워",
    images: [
      "/img/baseball_tour.jpg",
      "/img/jamsil_stadium.jpg",
      "/img/korean_chicken_beer.jpg",
      "/img/lg_twins_merchandise.jpg",
    ],
    price: "₩79,000",
    originalPrice: "₩95,000",
    discount: "17%",
    rating: 4.7,
    reviewCount: 342,
    duration: "6시간",
    groupSize: "최대 25명",
    language: "한국어, 영어, 일본어",
    partnership: {
      primary: "LG 트윈스",
      secondary: "교촌치킨",
      logo: "/img/lg_twins_logo.png",
    },
    specialFeatures: [
      "프리미엄 박스석 야구 관람권",
      "교촌치킨 & 맥주 무제한 제공",
      "LG 트윈스 공식 유니폼 대여",
      "나만의 응원가 만들기 체험",
      "선수 사인회 참여 기회 (경기 후)",
      "잠실야구장 VIP 투어",
    ],
    itinerary: [
      {
        time: "14:00",
        location: "잠실역 2번 출구",
        description: "투어 시작 및 야구 문화 소개",
        icon: Users,
      },
      {
        time: "15:00",
        location: "LG 트윈스 팬샵",
        description: "유니폼 착용 및 응원용품 준비",
        icon: ShoppingCart,
      },
      {
        time: "18:00",
        location: "교촌치킨 프리미엄 박스석",
        description: "치킨&맥주와 함께 경기 관람",
        icon: Gift,
      },
      {
        time: "20:00",
        location: "포토존",
        description: "경기장 배경 기념 스냅 사진 투어 ",
        icon: Camera,
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Park Min-jun",
        rating: 5,
        date: "2025-09-10",
        content:
          "야구를 잘 몰랐는데도 정말 재미있었어요! 교촌치킨도 맛있고 응원 분위기가 끝내줬습니다.",
        avatar: "박",
        gradient: "from-red-500 to-blue-500",
      },
      {
        id: 2,
        name: "Emma S.",
        rating: 5,
        date: "2025-09-08",
        content:
          "Amazing cultural experience! Learning Korean baseball cheers was so fun and the chicken was incredible!",
        avatar: "E",
        gradient: "from-blue-500 to-cyan-500",
      },
    ],
  },
  5: {
    id: 5,
    title: "강남 K-뷰티 & 웰니스 프리미엄 투어",
    subtitle: "한국 최고의 뷰티 기술과 전통 웰니스의 완벽한 조합",
    location: "강남구 (압구정-청담-신사동 일대)",
    images: [
      "/img/kbeauty_wellness_tour.jpg",
      "/img/gangnam_skincare_clinic.jpg",
      "/img/oliveyoung_flagship.jpg",
      "/img/korean_spa_wellness.jpg",
    ],
    price: "₩135,000",
    originalPrice: "₩180,000",
    discount: "25%",
    rating: 4.9,
    reviewCount: 428,
    duration: "6시간",
    groupSize: "최대 12명",
    language: "한국어, 영어, 중국어,일본어",
    partnership: {
      primary: "올리브영",
      secondary: "강남 피부과 협회",
      logo: "/img/oliveyoung_logo.png",
    },
    specialFeatures: [
      "프리미엄 피부과 하이드라페이셜 포함 (₩15만원 상당)",
      "개인 맞춤 K-뷰티 제품 컨설팅",
      "올리브영 VIP 멤버십 + 20% 할인",
      "전통 한방 스파 90분 풀코스 (₩12만원 상당)",
      "K-뷰티 루틴 가이드북 제공",
      "설화수, 후 등 프리미엄 브랜드 샘플 키트 (₩8만원 상당)",
    ],
    itinerary: [
      {
        time: "10:00",
        location: "강남역 올리브영 플래그십",
        description: "K-뷰티 브랜드 소개 및 피부 타입 진단",
        icon: Users,
      },
      {
        time: "11:00",
        location: "압구정 프리미엄 피부과",
        description: "피부 분석 + 하이드라페이셜 케어 (30분)",
        icon: Award,
      },
      {
        time: "13:00",
        location: "청담동 한정식 레스토랑",
        description: "피부에 좋은 한방 약선 점심",
        icon: Gift,
      },
      {
        time: "14:30",
        location: "신사동 K-뷰티 체험관",
        description: "설화수, 후 등 브랜드별 맞춤 케어 체험",
        icon: Play,
      },
      {
        time: "15:30",
        location: "압구정 전통 한방 스파",
        description: "황토 찜질 + 아로마 마사지 (90분)",
        icon: Camera,
      },
      {
        time: "17:30",
        location: "올리브영 VIP 쇼핑",
        description: "개인 맞춤 제품 추천 + 면세 쇼핑",
        icon: ShoppingCart,
      },
    ],
    specialFeatures: [
      "프리미엄 피부과 하이드라페이셜 포함",
      "개인 맞춤 K-뷰티 제품 컨설팅",
      "올리브영 VIP 멤버십 + 20% 할인",
      "전통 한방 스파 90분 풀코스",
      "K-뷰티 루틴 가이드북 제공",
      "면세점 연계 추가 할인 혜택",
    ],
    partnershipBenefits: [
      {
        icon: Award,
        title: "프리미엄 피부 케어",
        description: "강남 1급 피부과 하이드라페이셜 + 피부 분석",
        value: "시술가 ₩15만원",
        gradient: "from-pink-500 to-rose-500",
      },
      {
        icon: Gift,
        title: "K-뷰티 굿즈백",
        description: "설화수, 후, 이니스프리 등 인기 브랜드 샘플 키트",
        value: "₩8만원 상당",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        icon: Play,
        title: "한방 웰니스 스파",
        description: "황토 찜질방 + 전통 아로마 마사지 90분",
        value: "₩12만원 상당",
        gradient: "from-green-500 to-emerald-500",
      },
    ],

    reviews: [
      {
        id: 1,
        name: "Liu Beauty",
        rating: 5,
        date: "2025-09-15",
        content:
          "来韩国就是为了K-Beauty! 皮肤科护理太专业了，买的护肤品也很棒。传统韩方SPA让人很放松，值得推荐！",
        avatar: "L",
        gradient: "from-pink-500 to-rose-500",
      },
      {
        id: 2,
        name: "Yuki Skincare",
        rating: 5,
        date: "2025-09-12",
        content:
          "韓国のスキンケア技術は本当にすごい！ハイドラフェイシャルで肌がツルツルになりました。オリーブヤングでのショッピングも楽しかった～",
        avatar: "Y",
        gradient: "from-purple-500 to-blue-500",
      },
      {
        id: 3,
        name: "뷰티인플루언서 서연",
        rating: 5,
        date: "2025-09-10",
        content:
          "한국 뷰티의 진수를 느꼈어요! 피부과 케어부터 한방 스파까지 완벽한 하루였습니다. 구독자들이 너무 부러워해요 ㅎㅎ",
        avatar: "서",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        id: 4,
        name: "Emma Wellness",
        rating: 5,
        date: "2025-09-08",
        content:
          "Perfect combination of modern skincare and traditional wellness! My skin feels amazing and I learned so much about K-Beauty routines.",
        avatar: "E",
        gradient: "from-orange-500 to-pink-500",
      },
    ],
  },
  6: {
    id: 6,
    title: "국립중앙박물관 X 카카오프렌즈 디지털 체험관",
    subtitle: "AI 도슨트와 카카오프렌즈가 함께하는 스마트 박물관 체험",
    location: "서울 용산구 국립중앙박물관",
    images: [
      "/img/museum_kakao_friends.jpg",
      "/img/kakao_friends_museum_ar.jpg",
      "/img/museum_digital_docent.jpg",
      "/img/kakao_ryan_photozone.jpg",
    ],
    price: "₩55,000",
    originalPrice: "₩70,000",
    discount: "21%",
    rating: 4.8,
    reviewCount: 285,
    duration: "2.5시간",
    groupSize: "최대 15명",
    language: "한국어, 영어",
    partnership: {
      primary: "국립중앙박물관",
      secondary: "카카오프렌즈",
      logo: "/img/kakao_friends_logo.png",
    },
    specialFeatures: [
      "카카오프렌즈 캐릭터 실시간 만남",
      "AI 도슨트 앱 (5개 언어 지원)",
      "AR/VR 유물 체험 프로그램",
      "한정판 카카오프렌즈 박물관 굿즈",
      "어린이 친화적 문화재 해설",
      "디지털 스탬프 투어 완주 인증서",
    ],
    itinerary: [
      {
        time: "10:00",
        location: "박물관 입구",
        description: "카카오프렌즈 캐릭터 인사 및 AI 도슨트 앱 설치",
        icon: Users,
      },
      {
        time: "10:30",
        location: "고고학관",
        description: "라이언과 함께하는 한국 고대 문화 체험",
        icon: Play,
      },
      {
        time: "11:15",
        location: "디지털 체험존",
        description: "어피치 AR 체험 및 유물 복원 게임",
        icon: Camera,
      },
      {
        time: "12:00",
        location: "카카오프렌즈 포토존",
        description: "캐릭터와 함께 기념품 증정 및 단체 촬영",
        icon: Gift,
      },
    ],

    reviews: [
      {
        id: 1,
        name: "김가족",
        rating: 5,
        date: "2025-09-12",
        content:
          "7살 아이와 함께 갔는데 라이언이 나와서 설명해주니까 아이가 너무 좋아했어요! 박물관이 이렇게 재미있을 줄 몰랐습니다.",
        avatar: "김",
        gradient: "from-yellow-500 to-orange-500",
      },
      {
        id: 2,
        name: "Sarah Kim",
        rating: 5,
        date: "2025-09-08",
        content:
          "Perfect blend of culture and entertainment! My kids loved the Kakao Friends characters and learned so much about Korean history.",
        avatar: "S",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: 3,
        name: "박대학생",
        rating: 4,
        date: "2025-09-05",
        content:
          "대학생인데도 정말 재미있었어요! AI 도슨트가 생각보다 똑똑하고 AR 체험도 신기했습니다. 굿즈도 귀여워요!",
        avatar: "박",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: 4,
        name: "Jennifer L.",
        rating: 5,
        date: "2025-09-01",
        content:
          "Amazing experience for families! The museum became so much more engaging with Kakao Friends characters. Highly recommend!",
        avatar: "J",
        gradient: "from-green-500 to-emerald-500",
      },
    ],
  },

  // 제휴 파트너십 데이터 추가
  partnershipData: partnershipData,
  // partnershipStats: partnershipStats,
};

export const tourOffers = {
  1: {
    hasOffer: true,
    originalPrice: "₩89,000",
    discountPrice: "₩69,000",
    savings: "Save ₩20,000 per person!",
    description: "Get exclusive K-Pop photo cards + Everland tickets",
    title: "Netflix K-Pop Special Deal!",
    image: "/img/tour_mock_01.jpg",
    urgencyText: "Limited K-Pop merchandise available!",
  },
  2: {
    hasOffer: true,
    originalPrice: "₩55,000",
    discountPrice: "₩45,000",
    savings: "Save ₩10,000 per person!",
    description: "Free Kakao Friends merchandise included",
    title: "Kakao Friends Museum Deal!",
    image: "/img/kakao_shop.jpg",
    urgencyText: "Limited Kakao Friends items!",
  },
  3: {
    hasOffer: true,
    originalPrice: "₩125,000",
    discountPrice: "₩99,000",
    savings: "Save ₩26,000 per person!",
    description: "Free AI workshop materials included",
    title: "Microsoft AI Bootcamp Deal!",
    image: "/img/thumbnail_ms.jpg",
    urgencyText: "Exclusive tech workshop access!",
  },
  4: {
    hasOffer: true,
    originalPrice: "₩95,000",
    discountPrice: "₩79,000",
    savings: "Save ₩16,000 per person!",
    description: "Premium stadium seats + unlimited chicken & beer",
    title: "Baseball Premium Deal!",
    image: "/img/baseball_tour.jpg",
    urgencyText: "VIP stadium experience!",
  },
  5: {
    hasOffer: true,
    originalPrice: "₩135,000",
    discountPrice: "₩109,000",
    savings: "Save ₩26,000 per person!",
    description: "Free premium skincare products worth ₩50,000",
    title: "K-Beauty VIP Deal!",
    image: "/img/kbeauty_wellness_tour.jpg",
    urgencyText: "Exclusive beauty treatment included!",
  },
  6: {
    hasOffer: true,
    originalPrice: "₩85,000",
    discountPrice: "₩69,000",
    savings: "Save ₩16,000 per person!",
    description: "Professional photo editing + 20 high-res photos",
    title: "Instagram Hotspot Deal!",
    image: "/img/hangang_hotplace_tour.jpg",
    urgencyText: "Professional photographer included!",
  },
};

// 할인 정보를 가져오는 헬퍼 함수
export const getTourOffer = (tourId) => {
  console.log("getTourOffer called with tourId:", tourId); // 디버깅용
  const offer = tourOffers[tourId];
  console.log("Found offer:", offer); // 디버깅용

  // tourId에 해당하는 투어가 없거나 hasOffer가 false면 기본값 반환
  if (!offer || !offer.hasOffer) {
    return { hasOffer: false };
  }

  return offer;
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
