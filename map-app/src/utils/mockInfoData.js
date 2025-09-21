export const mockInfoPosts = [
  // 고정 공지글 3개 (priority: "notice")
  {
    id: "10001",
    board_id: "10001",
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
    likes_count: 156,
    //comments_count: 28,
    views: 1245,
    is_liked: false,
    category: "official",
    priority: "notice",
    is_pinned: true,
  },
  // 일반 정보글들
  {
    id: "1001",
    board_id: "1001",
    author: "su hyeon",
    user_name: "Su Hyeon",

    title: "케이팝 데몬 헌터스- 3일 서울 여행 코스",
    created_at: "2025-09-17",
    content: ` '케이팝 데몬 헌터스'의 배경이 된 서울 명소들을 3일에 걸쳐 돌아보는 성지순례 코스를 소개합니다!

**Day 1: K-POP 아이돌의 낮과 밤 (강남/삼성)**
① K-Star Road (압구정동): 웹툰 속 '이클립스' 소속사 건물 배경지. SM, JYP 등 실제 기획사가 모여있는 K-POP 성지. 강남돌 하트 베어 조형물에서 팬사인회 분위기 연출 가능.
② 코엑스 별마당 도서관: 주인공 시우가 악귀 봉인의 단서를 찾던 장소. 천장까지 뻗은 서가와 네온 조명이 인상적.
③ 봉은사: 헌터들의 정신수련 및 첫 번째 단서 발견지. 도심 속 고즈넉한 사찰에서 힐링까지.

**Day 2: 데몬 헌터들의 격전지 (한강/홍대)**  
① 반포한강공원 & 세빛섬: 웹툰 하이라이트 전투 장면의 배경. 화려한 야경과 분수쇼로 로맨틱한 분위기.
② 홍대 거리 & 그래피티 골목: 헌터들의 추격신 무대. 젊음이 넘치는 거리에서 버스킹과 함께 즐기기.

**Day 3: 비밀 조직의 흔적을 찾아서 (광화문/익선동)**
① 광화문광장 & 경복궁: 'KDH' 조직 비밀 본부 설정지. 최종 결전 무대 같은 웅장함.
② 익선동 한옥거리: 헌터들의 비밀 접선 장소. 미로 같은 골목과 전통 찻집.
③ 낙산성곽길: 은밀한 이동 루트. 야경이 아름다운 산책 코스.

**여행 꿀팁**
- 동선: 1일차 강남·삼성, 2일차 한강·홍대, 3일차 광화문·익선동·낙산
- 교통: 지하철 2호선, 5호선 적극 활용
- 인증샷: 웹툰 속 포즈와 대사로 진짜 성지순례 인증!`,

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
