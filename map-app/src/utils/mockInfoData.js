export const mockInfoPosts = [
  // 고정 공지글 3개 (priority: "notice")

  {
    id: "10001",
    board_id: "10001",
    title: "✈️ Seoul City Airport Terminal Smart Usage Guide",
    content: `Check-in and complete departure procedures before heading to the airport! Make the most of Seoul's City Airport Terminal services.

📍 Operating City Airport Terminals:
- Seoul Station City Airport Terminal (B2F)
- Gwangmyeong Station City Airport Terminal

🛫 Available Services:
- Check-in and seat assignment
- Baggage drop-off service  
- Immigration clearance (Seoul Station only)
- Direct connection to Airport Railroad Express

✈️ Participating Airlines:
Korean Air, Asiana Airlines, Jeju Air, T'way Air, Air Seoul, Air Busan, Jin Air, Easter Jet

🕒 Operating Hours:
- Check-in/Baggage drop: 05:20~19:00
- Immigration clearance: 05:30~19:00

⏰ Check-in Deadline:
- Terminal 1 departures: 3 hours before flight departure
- Terminal 2 departures: 3 hours 20 minutes before flight departure

⚠️ Important Notes:
- Airport Railroad Express ticket required
- Same-day Incheon Airport international flights only
- Mobile check-in not available (counter check-in required)

💡 Benefits: Access to dedicated departure gate at the airport after completing city terminal procedures!`,
    user_name: "Seoul Metropolitan Government",
    user_profile_image: "/img/seoul_CI.png",
    user_id: "seoul_admin",
    tags: "city airport terminal,Seoul Station,Incheon Airport,check-in,immigration,Airport Railroad",
    //  is_liked: false,
    category: "official",
    priority: "notice",
    is_pinned: true,
  },
  {
    id: "10002",
    board_id: "10002",
    title: "🎆 2025 서울세계불꽃축제 개최 안내",
    content: `올해도 화려한 불꽃으로 서울의 밤하늘을 수놓을 서울세계불꽃축제가 개최됩니다!
  
  🎊 축제 정보:
  - 일시: 2025년 9월 27일(토) 오후 7:30~9:00
  - 장소: 여의도 한강공원 일대
  - 주제: "Seoul Dreams, Global Harmony"
  
  🎯 관람 포인트:
  - 여의도 한강공원 (메인 관람석)
  - 반포 한강공원 
  - 뚝섬 한강공원,
  - 망원 한강공원
  
  🚇 교통 정보:
  - 5호선 여의나루역 3번 출구
  - 9호선 샛강역 1번 출구  
  - 축제 당일 지하철 연장 운행 예정
  
  ⚠️ 안전을 위해 텐트, 돗자리 설치는 오후 2시부터 가능합니다.
  
  자세한 정보는 서울시 공식 홈페이지를 확인해주세요!`,
    user_name: "서울시",
    user_profile_image: "/img/seoul_CI.png",
    user_id: "seoul_admin",
    tags: "불꽃축제,여의도,한강공원,축제,문화행사",
    is_liked: false,
    category: "official",
    priority: "notice",
    is_pinned: true,
  },
  {
    id: "10003",
    board_id: "10003",
    title: "🌟 서울 지하철 2025년 추석 단축 운영",
    content: `민족 대명절 추석을 맞아 서울지하철 1-9호선이 오후 11시까지 단축 운행합니다.

📍 주요 행사 진행지:
- 종각역
- 을지로입구역  
- 명동역
- 홍대입구역

🕒 운행 시간: 오후 11시까지 단축 운행

📋 자세한 시간표는 서울교통공사 홈페이지에서 확인하실 수 있습니다.`,
    user_name: "서울시",
    user_profile_image: "/img/seoul_CI.png",
    user_id: "seoul_admin",
    tags: "지하철,단축 운행,추석,교통정보",
    // likes_count: 156,
    //comments_count: 28,
    //views: 1245,
    is_liked: false,
    category: "official",
    priority: "notice",
    is_pinned: true,
  },

  // 일반 정보글들
  {
    id: "1001",
    board_id: "1002",
    author: "triple_guide",
    user_name: "유수현",
    title: "K-Pop 아이돌들처럼 먹어보자! 🎤✨ 서울 맛집 완전정복 가이드",
    created_at: "2025-09-20",
    content: `
좋아하는 아이돌과 같은 공간에서 같은 메뉴를... 상상만 해도 설레지 않나요? 에디터가 직접 발품 팔아 모은 아이돌들의 진짜 단골집 리스트를 공개합니다! 📍

TV 속 그 맛집들
🥖 Pachamama Bakery | 용산 HYBE 근처
LE SSERAFIM이 더 매니저에서 극찬한 그 베이커리! 소금빵과 피스타치오 슬라이스는 필수 주문 아이템. HYBE 구경 후 들르면 일석이조 ✨

🥩 금돼지식당 | 미슐랭 빕 구르망
ZB1, BTS, EXO가 단골인 데에는 이유가 있었어요. 바질쌈에 두툼한 삼겹살 올려 먹으면... 말이 필요 없죠 🤤

SNS 화제의 그 곳들
🍈 아소또 | 을지로
aespa 윈터가 버블로 인증한 메론빵 전문점! 2024년 오픈 후 지금까지 인기 지속 중. 바닐라크림 메론빵 강력 추천 💛

🌿 카페 수목금토 | 강남
SEVENTEEN 민규의 무지개 계단 인스타 포토존으로 유명세. 도심 속 자연 친화적 분위기에서 힐링 타임 가져보세요 🌈

🍦 요아정 | 전국 매장
RIIZE 성찬의 조합 레시피로 유명해진 요거트 아이스크림. 골드망고+허니콤+샤인머스캣 조합은 진짜 맛있어요 (에디터도 인정!)

🍩 피르마 베이커리 | 안국
TWICE 사나의 슈퍼 얼그레이 도넛. 달지 않은 진한 얼그레이 크림이 포인트! (포장만 가능)

팬들의 성지 순례 필수 코스
🐑 Lamb NIKUYA | 둔촌2호점
Stray Kids, DAY6 멤버들 사인과 포스트잇이 가득! V-Live 촬영지로도 유명

🥩 곱창파는고기집
SEVENTEEN 고잉 세븐틴 촬영지. 캐럿세트 메뉴와 생일 이벤트까지! 진짜 팬이라면 필수 방문 📸

🎯수현 에디터의 Tips!

강남라인: 수목금토 → Sunday Burger Club → 아가젤라또

성수라인: 카페 파르벤 → 성수다락

용산라인: Pachamama → 아소또

평일 오후에 방문하면 한적하게 즐길 수 있어요. 아이돌들과 같은 메뉴 주문하고 #아이돌맛집투어 해시태그 잊지 마세요! 💜



    `,
    tags: "K-Pop맛집,아이돌추천,서울카페,성지순례,BTS,SEVENTEEN,aespa,TXT,LESSERAFIM",
    is_liked: false,
    category: "official",
    priority: "normal",
    // 이미지 배열 추가
    pictures: [
      "/img/editor_mock_1.png",
      "/img/editor_mock_2.png",
      "/img/editor_mock_3.png",
      "/img/editor_mock_4.png",
    ],
  },
  {
    id: "1002",
    board_id: "1002",
    author: "su hyeon",
    user_name: "Su Hyeon",

    title: "케이팝 데몬 헌터스- 3일 서울 여행 코스",
    created_at: "2025-09-17",
    content: ` '케이팝 데몬 헌터스'의 배경이 된 서울 명소들을 3일에 걸쳐 돌아보는 성지순례 코스를 소개합니다!
수현 에디터가 직접 답사한 케데헌 배경지 투어 코스라구요요! 진짜 헌터가 된 기분으로 서울을 누벼보세요 ⚔️
Day 1 | K-POP의 중심에서 데몬을 찾다 🌃
📍 K-Star Road (압구정)
이클립스 소속사 모티브가 된 실제 기획사 밀집 지역. 강남돌 하트 베어 앞에서 팬사인회 포즈 필수!

📍 코엑스 별마당 도서관
시우가 악귀 봉인 단서를 찾던 그 장소. 천장 높은 서가 사이를 걸으면 진짜 비밀을 찾는 기분 ✨

📍 봉은사
헌터들의 정신수련지. 도심 속 고요함에서 내면의 힘을 길러보세요

Day 2 | 격전의 현장을 걸어보다 ⚡
📍 반포한강공원 & 세빛섬
웹툰 최고 명장면 전투 배경지! 화려한 야경과 분수쇼가 더해져 로맨틱함까지

📍 홍대 거리 & 그래피티 골목
헌터들의 스릴 넘치는 추격신 무대. 버스킹과 함께 젊은 에너지 만끽 🎵

Day 3 | 비밀 조직의 흔적을 찾아서 🕵️
📍 광화문광장 & 경복궁
KDH 조직 본부 설정지. 웅장한 스케일에서 최종 보스전 분위기 연출

📍 익선동 한옥거리
헌터들의 은밀한 접선 장소. 미로 같은 골목에서 숨은 찻집 발견하는 재미

📍 낙산성곽길
야경 맛집이자 은밀한 이동 루트. 서울 전경 보며 힐링까지 🌙




🎯su hyeon 's Tips!



동선 최적화: 지하철 2호선, 5호선 적극 활용

베스트 타임: 1일차 오후, 2일차 저녁, 3일차 야경

인증샷 포인트: 웹툰 속 대사와 포즈로 진짜 성지순례 완성!

3일 코스 완주하면 당신도 진짜 케데헌 마스터! 🏆`,

    tags: "케이팝데몬헌터스,서울여행코스",
    is_liked: false,
    category: "official",
    priority: "normal",
    // 이미지 배열 추가
    pictures: [
      "/img/tour_mock_01.jpg",
      "/img/tour_mock_02.jpg",
      "/img/tour_mock_03.jpg",
    ],
  },
];

// 페이징을 위한 함수들
export const getInfoPosts = (page = 1, limit = 4, searchQuery = "") => {
  let filteredPosts = [...mockInfoPosts];

  // 검색 필터링
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.toLowerCase().includes(query) ||
        post.user_name.toLowerCase().includes(query)
    );
  }

  // 고정글(notice)과 일반글 분리 후 정렬
  const noticePosts = filteredPosts
    .filter((post) => post.priority === "notice")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const normalPosts = filteredPosts
    .filter((post) => post.priority === "normal")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 고정글을 상단에 배치
  const allPosts = [...noticePosts, ...normalPosts];

  // 페이징 처리
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalCount: allPosts.length,
    totalPages: Math.ceil(allPosts.length / limit),
    currentPage: page,
    hasNext: endIndex < allPosts.length,
    hasPrev: page > 1,
    pagination: {
      total_count: allPosts.length,
      total_pages: Math.ceil(allPosts.length / limit),
      current_page: page,
      has_next: endIndex < allPosts.length,
      has_prev: page > 1,
    },
  };
};

// 개별 포스트 조회
export const getInfoPostById = (postId) => {
  return mockInfoPosts.find(
    (post) => post.id === postId || post.board_id === postId
  );
};

// 인기 정보글 (좋아요 순)
export const getTrendingInfoPosts = (limit = 5) => {
  return [...mockInfoPosts]
    .filter((post) => post.priority === "normal") // 공지글 제외
    .sort((a, b) => b.likes_count - a.likes_count)
    .slice(0, limit);
};

// 정보 게시판용 태그 목록
export const getInfoTags = () => {
  const allTags = mockInfoPosts
    .flatMap((post) => post.tags.split(","))
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  const tagCounts = {};
  allTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
};
