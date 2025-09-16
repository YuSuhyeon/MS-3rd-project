# 주요 기능 구현 목록

## Frontend (map-app)

### pages/Home.jsx

- 메인 페이지의 텍스트 애니메이션을 위해 `framer-motion` 라이브러리를 사용하여 동적인 효과를 구현했습니다.
- `displayName`, `isNameAnimating` 같은 상태를 활용하여 이름 입력 및 애니메이션을 제어하고, 사용자와의 상호작용을 강화했습니다.
- 스크롤에 따른 애니메이션 효과를 위해 `useEffect`, `useScroll`, `useTransform` 훅을 사용하여 스크롤 위치에 따라 UI 요소가 변화하도록 만들었습니다.
- CTA 버튼(`handleStartClick`) 클릭 시 `useNavigate`를 통해 다음 페이지로 이동하며, 사용자 여정의 시작점을 명확히 제시합니다.
- 환영 메시지, 사용자 이름 입력 필드, 시작 버튼 등 주요 UI 요소들을 동적으로 렌더링하여 사용자 경험을 향상시켰습니다.
- `useAuth` 훅을 통해 인증 상태를 관리하며, Google/Microsoft SSO 로그인 모달을 `AnimatePresence`로 부드럽게 표시합니다.

### pages/CommunityMain.jsx

- 다양한 커뮤니티 콘텐츠를 탭 형태로 제공하며, 현재 탭은 URL 쿼리(`tab`)를 통해 상태를 관리하고 공유 가능하도록 구현했습니다.
- `SurvivalKit` 컴포넌트에서는 여행 팁, 추천 아이템, 플레이리스트 등 유용한 정보를 카드 형태로 제공합니다.
- 탭 전환 시 콘텐츠가 부드럽게 나타나도록 `framer-motion`을 사용한 애니메이션 효과를 적용했습니다.
- Spotify 플레이리스트 생성기(`SpotifyPlaylistGenerator`)를 통합하여 사용자 맞춤형 음악 추천 기능을 제공합니다.
- 탭 이동 시 `layoutId`를 사용하여 선택된 탭의 배경이 부드럽게 움직이는 애니메이션을 구현했습니다.
- `renderContent` 함수로 탭 콘텐츠를 동적으로 렌더링하며, `AnimatePresence`로 전환 효과를 제어합니다.

### pages/DirectionsMantine.jsx

- 카카오 SDK를 직접 사용하여 지도를 렌더링하고, 길찾기 기능을 구현했습니다.
- `geocode`, `buildPathFromRoute`, `drawPolylines` 같은 함수를 통해 Kakao/Naver 지도 API 응답을 파싱하여 경로를 그립니다.
- 경로 데이터(`lastRoutesRef`)를 ref에 저장하여 불필요한 API 호출을 최소화하고 성능을 최적화했습니다.
- 경로 탐색 결과를 `timeline`과 `summary` 형태로 시각화하여, 사용자가 여정을 쉽게 파악할 수 있도록 UI를 구성했습니다.
- `useLocation` 훅으로 이전 페이지에서 전달된 장소 정보를 받아 길찾기 출발/도착지로 자동 설정합니다.
- Kakao API 요청 실패 시 Naver 지도를 대체 옵션으로 사용하는 폴백(fallback) 로직을 구현했습니다.

### pages/DirectionsMyro.jsx

- 여행 일정을 `days` 배열 상태로 관리하며, 각 날짜별 장소, 경로, 숙소, 메모 등을 저장합니다.
- 전체 일정은 `sessionStorage`에 저장하여 페이지 리프레시에도 데이터를 유지하고, 최종 저장은 `localStorage`를 사용합니다.
- 카카오 지도 위에 장소 마커와 경로 폴리라인을 표시하며, 날짜별로 다른 색상으로 구분하여 시각화합니다.
- 새로운 일정을 계획할 때, `clearMap` 함수로 기존 마커와 폴리라인을 모두 제거합니다.
- 드래그앤드롭으로 날짜별, 장소별 순서를 변경할 수 있는 직관적인 UI를 제공합니다.
- 일정의 `shareInfo`를 생성하여 다른 사용자와 여행 계획을 공유하는 기능을 구현했습니다.

### pages/DirectionsMantineImproved.jsx

- Kakao와 TMap API를 함께 사용하여 경로 탐색의 정확성과 옵션을 확장했습니다.
- 백엔드 프록시를 통해 API를 호출하며, 각각 `/api/tmap/*` 및 `/api/kakao-waypoints` 엔드포인트를 사용합니다.
- `Reorder.Group`을 사용하여 경유지를 드래그하여 순서를 변경하는 기능을 구현했고, 변경 시 경로를 다시 계산합니다.
- `recomputeTimelineWithStays` 함수는 장소별 체류 시간을 고려하여 전체 타임라인을 동적으로 재계산합니다.
- 사용자가 직접 경유지를 추가하거나 삭제할 수 있는 동적인 인터페이스를 제공하여, 유연한 경로 계획을 지원합니다.
- 경로, 타임라인, 요약 정보 등 주요 UI 요소에 `framer-motion`을 적용하여 부드러운 사용자 경험을 제공합니다.

### pages/DocentMantine.jsx

- 도슨트 UI를 위해 `UI` 상태를 통해 지도, 목록, 상세 정보, 채팅 모드를 전환합니다.
- `POIList`, `LocationMap`, `POIDetails` 컴포넌트로 장소 목록, 지도, 상세 정보를 각각 렌더링합니다.
- `FixedChatbot`은 사용자 질문에 답변하며, 텍스트 번역(`translateText`), 음성 출력(`speakText`/`stopTTS`) 기능을 포함합니다.
- `Papa.parse`로 CSV 파일을 파싱하여 POI 데이터를 로드하고, 카카오 지도를 통해 좌표를 변환합니다.
- 다국어 지원을 위해 장소 이름(`nameTr`), 주소(`addrTr`)를 상태로 관리하며 동적으로 번역합니다.
- `useIsMobile` 훅으로 모바일 환경을 감지하여 기기에 최적화된 UI를 동적으로 제공합니다.

### pages/DocentVision.jsx

- 사용자가 이미지를 업로드하거나, 이미지 파일의 URL을 입력할 수 있습니다.
- Azure Custom Vision 이미지 인식 API를 호출하여 장소를 식별하고, 관련 CSV 데이터와 `TAG_ALIASES`를 매칭합니다.
- `Papa.parse`를 사용하여 CSV 데이터를 파싱하고 이미지 인식 결과와 일치하는 장소 정보를 찾습니다.
- 인식된 장소와 관련된 상세 정보를 사용자에게 보여주며, 관련 정보가 없을 경우(`poi`) 안내 메시지를 표시합니다.
- 인식 결과는 `LocationMap`과 `POIDetails`를 통해 지도상의 위치와 상세 정보로 시각화됩니다.
- 이미지 분석을 통해 사용자가 현재 위치한 장소의 정보를 손쉽게 얻을 수 있는 경험을 제공합니다.

### pages/ItineraryView.jsx

- PocketBase에서 특정 `Itinerary`를 ID로 조회하여 일정 데이터를 가져오고, 상태로 관리합니다.
- `TimelineDay`, `ActivityEditor`, `ItineraryHeader` 컴포넌트를 통해 일정을 체계적으로 시각화하고 편집합니다.
- 사용자가 활동을 드래그하여 순서를 변경하면 즉시 `Itinerary.update`를 호출하여 서버에 반영합니다.
- 일정에 장소가 없을 경우, 장소 추가를 유도하는 CTA(Call To Action) 버튼을 표시합니다.
- 일정 제목, 날짜, 활동, 메모, 비용 등 세부 항목에 대한 CRUD 기능을 완벽하게 지원합니다.
- 특정 활동 편집 시 `editingActivity` 상태를 활용하고 `AnimatePresence`로 편집기를 부드럽게 표시합니다.

### pages/PersonaAnalysis.jsx

- `/api/persona/questions`에서 질문 목록을 가져오고, 사용자가 각 질문에 답변하면 다음 질문으로 넘어가는 UI를 구현했습니다.
- 사용자의 모든 답변은 `answers` 상태 객체에 질문 ID를 키로 하여 저장됩니다.
- `AnimatePresence`와 `questionVariants`를 통해 질문 전환 시 슬라이드 애니메이션 효과를 적용했습니다.
- 분석이 완료되면 `/api/persona/analyze`로 답변을 전송하여 AI 분석 결과를 받고, `TravelProfile.create`로 DB에 저장합니다.
- `ProgressIndicator`로 전체 질문 진행 상태를 시각화하며, 현재/전체 질문 수를 표시합니다.
- 분석 결과가 나오기 전까지 로딩 화면을 표시하여 사용자에게 진행 상황을 명확하게 알려줍니다.

### pages/PopularPlaces.jsx

- URL 파라미터 `areaName`을 기반으로 Azure Functions `CityDataDetailAPI`를 호출하여, 해당 지역의 `placeData`를 가져옵니다.
- `placeInfo` 데이터를 매핑하여 각 장소의 이미지, 이름, 태그, 설명 등을 카드 형태로 보여줍니다.
- `NeonInfoCard` 컴포넌트는 장소의 이름, 태그, 평점, 리뷰 수 등 핵심 정보를 시각적으로 강조합니다.
- 장소 카드를 클릭하면 해당 장소의 상세 페이지로 이동하는 링크를 제공합니다.
- 검색 기능을 통해 장소 목록을 필터링하며, `Link`로 검색 결과 페이지로 이동할 수 있습니다.
- 사용자가 지역별 인기 장소를 쉽게 탐색하고 정보를 얻을 수 있도록 돕습니다.

### pages/ResultDashboard.jsx

- `TravelProfile` ID를 기반으로 사용자의 여행 분석 결과를 가져와 대시보드 형태로 시각화합니다.
- 분석된 페르소나를 기반으로 `/api/persona/route`에 추천 경로 생성을 요청하고, 최대 6개의 추천 코스를 생성합니다.
- `/api/persona/courses2` API를 통해 추천된 코스, 숙소/맛집 정보를 포함한 상세 데이터(`courseQuery`)를 조회합니다.
- `AnalysisSummaryPanel`은 사용자의 여행 스타일, 선호도, 예산, 동반자 유형 등 분석 결과를 요약하여 보여줍니다.
- 추천된 경로를 `sessionStorage`에 저장하여 `DirectionsMantineImproved` 페이지로 전달함으로써 바로 경로를 확인할 수 있습니다.
- `ScrollTopButton`을 추가하여 페이지가 길어져도 사용자가 쉽게 최상단으로 이동할 수 있도록 편의성을 제공합니다.

### pages/Tour.jsx

- `LiveInfoBar`는 5초마다 Azure Functions를 호출하여 실시간 날씨, 환율, 유가 정보를 업데이트합니다.
- `tourProducts` 배열 데이터를 기반으로 전체 여행 상품 목록을 렌더링하며, 각 상품의 이미지와 핵심 정보를 표시합니다.
- 검색어(`searchTerm`)와 카테고리 필터(`filterCategory`)를 통해 상품 목록을 동적으로 필터링하며, 호텔/항공/패키지별 조회가 가능합니다.
- 상품에 마우스를 올리면 상세 정보가 나타나는 호버 효과를 구현하여, 사용자가 쉽게 정보를 탐색하도록 돕습니다.
- 주요 CTA, 필터 버튼, 상품 카드 등 UI 요소에 `framer-motion`을 적용하여 동적인 인터페이스를 구현했습니다.
- `useNavigate`로 상품 상세 페이지로 이동하며, 호텔/항공/패키지 등 카테고리 정보를 함께 전달합니다.

### pages/TourDetail.jsx

- `tourDetailData`의 상세 정보, 리뷰, Q&A 등 섹션별 콘텐츠를 `activeTab` 상태로 제어하며 탭 UI를 구현했습니다.
- 탭 전환, 이미지 갤러리, 정보 섹션 등에 `framer-motion` 애니메이션을 적용하여 부드러운 전환 효과를 제공합니다.
- 사용자가 상품의 가격, 평점, 예약 가능 여부 등 핵심 정보를 한눈에 파악할 수 있도록 UI를 구성했습니다.
- 페이지 로딩 시 상단으로 자동 스크롤되도록 `useEffect`와 `setTimeout`을 사용했습니다.
- 이미지 갤러리에서 `selectedImage` 상태로 현재 선택된 이미지를 관리하며, CTA 버튼 클릭 시 예약, 문의, 공유 기능을 제공합니다.
- 상품 개요, 상세 설명, 편의시설, 예약 정보 등 다양한 데이터를 체계적으로 시각화합니다.

### pages/VisionOCR.jsx

- 사용자가 업로드한 이미지 파일을 `/api/vision/ocr`로 전송하며, OCR 언어(`ocrLang`)를 함께 보내 Azure Vision OCR을 호출합니다.
- OCR 결과를 텍스트 영역에 표시하고, 추출된 텍스트를 기반으로 메뉴 번역, AI 요약, 정보 검색 등 추가 기능을 제공합니다.
- 추출된 텍스트를 JSON, 일반 텍스트 CSV, 따옴표 있는 CSV 등 다양한 형식으로 다운로드하는 기능을 지원합니다.
- 텍스트 영역의 내용을 수정하여 다시 API를 호출함으로써, 사용자가 결과를 보정할 수 있습니다.
- `translateText`, `translateToKorean`, `getOpenAIMenuAnswer` 함수를 통해 번역 및 AI 기반 정보 조회를 수행합니다.
- 이미지, 번역, AI 요약 기능을 결합하여 사용자가 이미지 속 텍스트를 다각도로 활용할 수 있도록 지원합니다.

### pages/useIsMobile.jsx

- `window.matchMedia`를 사용하여 현재 브라우저의 가로 폭이 768px 이하인지 감지하는 커스텀 훅입니다.
- 이 훅의 결과는 Docent 페이지 등에서 모바일/데스크톱 레이아웃을 전환하는 데 사용됩니다.

## Frontend 컴포넌트

### components/result/AnalysisSummaryPanel.jsx

- 페르소나 분석 결과 코드를 `CODE_MAP`과 `humanizeCode` 함수를 이용해 사람이 읽기 쉬운 텍스트로 변환하여 보여줍니다.
- 여행 스타일, 선호 활동, 예산, 동반자 유형 등 각 분석 항목을 `framer-motion`으로 순차적으로 표시합니다.
- `profile.considered` 배열에 따라 사용자가 중요하게 생각한 고려사항들을 시각적으로 강조하며, `profile`의 `analysis_result.inputs`에서 해당 데이터를 가져옵니다.

### components/persona/ProgressIndicator.jsx

- 페르소나 분석 질문의 전체 단계와 현재 진행 단계를 시각적으로 보여주는 프로그레스 바이며, `framer-motion`으로 부드러운 애니메이션을 구현했습니다.
- PersonaAnalysis 페이지의 핵심 UI 요소로, 사용자가 진행 상황을 쉽게 파악하도록 돕습니다.

## Backend (backend/app)

### api/routes.py

- `GET /api/health`: 서버의 상태를 확인하는 헬스 체크 엔드포인트입니다.
- `GET /api/persona/questions`: `persona_service.load_questions()`를 호출하여 페르소나 분석 질문 목록을 반환합니다.
- `POST /api/persona/analyze`: 사용자 답변을 받아 `persona_service.analyze_persona`로 페르소나를 분석하고 결과를 반환합니다.
- `GET /api/seoul-data`: 서울시 주요 명소 CSV 데이터를 읽어 상위 500개 항목을 JSON으로 반환합니다.
- `POST /api/persona/route`: 분석된 페르소나(여행 스타일, 선호도, 기간 등) 기반으로 추천 여행 경로를 생성합니다.
- `GET /api/translate`: Azure Translator API를 사용하여 입력된 텍스트를 지정된 언어로 번역합니다.
- `POST /api/kakao-waypoints`: Kakao Mobility 길찾기 API로 경유지를 포함한 경로 정보를 조회합니다.
- `POST /api/naver/walking`, `/api/naver/transit`: Naver 지도 API를 사용하여 도보 및 대중교통 길찾기 결과를 반환합니다.
- `POST /api/tmap/route`, `/api/tmap/transit`: TMap API 역시 Kakao와 유사하게, 자동차/대중교통 길찾기 결과를 Naver 또는 Kakao 포맷으로 변환하여 반환합니다.
- `GET /api/persona/courses`, `/api/persona/courses2`: CSV에 저장된 추천 코스 데이터를 페르소나 유형에 맞게 필터링하여 반환합니다.
- `POST /api/route-plans`, `GET /api/route-plans/<id>`: JSON으로 생성된 여행 계획을 저장하고, 고유 URL로 조회할 수 있게 합니다.
- `POST /api/vision/ocr`: Azure Vision Image Analysis API를 통해 이미지에서 텍스트를 추출(OCR)합니다.
- `GET /api/spotify/login`, `/api/spotify/callback`, `/api/spotify/user`, `POST /api/spotify/logout`: Spotify OAuth 인증 및 사용자 정보 조회를 처리합니다.

### services/persona_service.py

- Joblib으로 사전 학습된 머신러닝 모델을 로드하여, 사용자 답변을 기반으로 페르소나를 예측합니다.
- UI에서 받은 간단한 답변을 모델이 이해할 수 있는 원-핫 인코딩 형태로 변환하기 위해 `_map_simple_answers_to_feature_keys`와 `_vectorize`를 사용합니다.
- 예측된 페르소나 벡터를 기반으로, 가장 유사도가 높은 상위 3개의 페르소나 코드를 최종 결과로 반환합니다.
- 각 페르소나 코드는 여행 스타일과 관련된 특정 키워드(`RVIT_1`, `STAY_3` 등) 조합으로 정의됩니다.
- 페르소나 분석에 사용될 질문은 `persona_questions.json` 파일에서 로드하며, pandas 데이터프레임으로 변환하여 처리합니다.

### data/persona_questions.json

- 페르소나 분석을 위한 5개 질문(여행 동반자, 선호 활동, 숙소 유형, 1일 예산, 여행 목적)을 정의합니다.
- 각 질문은 `type`, 선택지, 관련 데이터 키, 아이콘 등 프론트엔드 렌더링에 필요한 모든 정보를 포함합니다.
- 사용자가 중요하게 생각하는 고려사항(`considered`) 질문은 3개까지 복수 선택이 가능하며, 페르소나 분석의 가중치로 활용됩니다.
