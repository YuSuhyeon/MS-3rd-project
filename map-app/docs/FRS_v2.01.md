# AI Seoul Tour Planner & Docent 기능 명세서(FRS)

버전: 2.01  
문서 갱신: 2025-09-09

## 1. 개요

### 1.1 목적
본 문서는 AI Seoul Tour Planner & Docent의 최신 기능(경로 편집/타임라인/검색/테마)을 상세히 정리합니다.

### 1.2 범위
- AI Tour Planner: 성향 설문 기반 페르소나 분석, 코스/경로 제안
- AI Docent: 지도 기반 POI 탐색/설명, 추천/요약, 음성 안내(TTS)

## 2. 경로 편집(Directions)

[진행] 2025-09-09: 경로 편집 페이지 UI/UX를 마이로(Myro) 유사 레이아웃으로 개편했습니다.
- 좌측 스텝 네비 + 중앙 다일차(1~N) 컬럼 카드 + 우측 풀높이 지도
- Day 탭 → 컬럼 카드로 전환, 각 일차별 타임라인·요약 표시, 활성 일차는 강조 표시 및 체류 입력 가능
- 기존 계산/검색/우선순위/출발시간 컨트롤은 상단 툴바 유지
- Kakao Waypoints 경로 계산/마커 렌더링 로직은 유지

### 2.1 주요 기능(최신 구현)
- 출발/도착/경유지 자동완성: Kakao Places 기반 입력(PlaceSearchInput)
- 경유지 검색 모달(강화):
  - 키워드 검색, 카테고리 토글(카페/음식/공원/박물관/쇼핑), 거리·이름 정렬
  - 다중 선택(체크박스) → “선택 N건 추가”로 일괄 추가
  - 거리(km) 표기: 출발지(없으면 지도 중심) 기준 haversine 계산
  - 더보기: Kakao Places pagination 지원 시 다음 페이지 로드(미지원 시 graceful degrade)
- 경유지 순서 변경: 드래그 앤 드롭 + 상/하 버튼
- 체류 시간: 출발/각 경유/도착지 체류(분) 입력 → 타임라인 누적 반영
- 이동 수단: 자동차(정식), 도보/대중교통(베타)
  - 자동차: Kakao Mobility Waypoints 경로 응답(routes[0].summary/sections[*].summary)로
    - 총 거리/시간, 구간 거리/시간 정확 표기
    - 지도 폴리라인(도로 vertexes) 렌더링
  - 도보/대중교통(베타):
    - 현재는 직선거리 기반 추정치(도보 4.5km/h, 대중교통 25km/h + 환승 5분/구간)
    - 점선 폴리라인으로 시각화(정식 경로 API 미연동 시)
- 타임라인(테마 보정):
  - myro 유사 수직 타임라인(좌: 점/선, 우: 카드)
  - 각 지점: 이름, 도착 예상 시각, (이전 구간) 이동거리·시간, 체류 시간
  - 상단 요약: 총 이동거리/총 이동시간, 예상 종료 시각(출발 + 이동 + 체류)
- 마커 표시/아이콘: 출발/경유/도착 마커 이미지 적용
  - 경로: `map-app/public/marker_ko/*.png` 활용
  - 크기 36x36, 경유지는 색상/번호 변형 이미지 순환 적용

### 2.2 화면 구성
- 상단 3열 그리드: 출발(자동완성+체류), 도착(자동완성+체류), [경유지 검색][경로 계산]
- 하단 3열 그리드: 우선순위(추천/최단시간/최단거리), 출발 시간, 이동 수단(자동차/도보/대중교통)
- 경유지 목록: 자동완성, 체류(분), 드래그 정렬/삭제/상하 이동
- 지도(좌) + 타임라인(우)

### 2.3 타임라인 계산 로직
- 입력: 출발 시각(HH:mm), 구간 이동 시간, 각 지점 체류 시간
- 도착 시간: 출발 → (구간 이동) → 도착 → (체류) → 다음 구간 이동 … 방식으로 누적
- 총합: 총 이동거리(sum(sections.distance)/1000), 총 이동시간(sum(sections.duration)/60), 종료 시각(마지막 누적 분)

### 2.4 Kakao 통합
- 프런트: Kakao Maps JS SDK(`libraries=services`) 로딩
- 백엔드 프록시: `POST /api/kakao-waypoints`
  - 헤더: `Authorization: KakaoAK {KAKAO_REST_API_KEY}`
  - 바디: `{ origin:{x,y}, destination:{x,y}, waypoints:[{x,y}], priority }`
  - 응답: Kakao Mobility `v1/waypoints/directions` JSON 그대로 전달
  - 환경변수: `KAKAO_REST_API_KEY` 또는 `REACT_APP_KAKAO_API_KEY`

### 2.5 도보/대중교통 정식 경로 API(네이버)
- 백엔드 프록시 추가(키 필요):
  - `POST /api/naver/walking` → 보행 구간별 요청(연속 다구간 구성)
  - `POST /api/naver/transit` → 대중교통 구간별 요청(연속 다구간 구성)
- 요청 바디(공통):
  - `{ origin:{x,y}, destination:{x,y}, waypoints:[{x,y}] }`  // x=경도, y=위도, 문자열 허용
- 응답 형식(공통):
  - `{ routes:[{ summary:{distance, duration}, sections:[ { summary:{distance, duration}, path:[[x,y], ...] } ] } ] }`
- 키/헤더(Naver Cloud Platform):
  - `X-NCP-APIGW-API-KEY-ID: ${NAVER_MAPS_API_KEY_ID}`
  - `X-NCP-APIGW-API-KEY: ${NAVER_MAPS_API_KEY}`
- 프런트 동작:
  - 모드가 WALK/TRANSIT일 때 네이버 프록시 우선 호출 → 성공 시 섹션별 거리/시간/좌표에 기반하여 타임라인/폴리라인 표시, 실패 시 추정(도보 4.5km/h, 대중교통 25km/h+5분/구간)

## 3. UI/테마 사양(마이로 유사)

### 3.1 색/레이아웃
- 카드형 레이아웃(얕은 그림자), 중립 배경(#f8f9fb 계열), 주요 액션 인디고 계열 버튼
- 좌측 고정 스텝 네비게이션(STEP 1/2/3), 중앙 컨텐츠 패널(폭 360~520px), 우측 풀 높이 지도
- 타임라인: 수직 라인 + 원형 노드(출발=녹색, 도착=적색, 경유=보라), 우측 카드에 정보 배치

### 3.2 타임라인 컴포넌트(CSS)
- 파일: `map-app/src/styles/directions.css`
- 클래스: `.timeline`, `.timeline-item`, `.timeline-dot(start|wp|end)`, `.timeline-line`, `.timeline-content`
- 레이아웃: `.directions-wrapper`, `.directions-leftbar`, `.step-nav`, `.directions-panel`, `.directions-mapbox`
- 접근성: 텍스트 대비 준수, 간결한 정보 밀도 유지

### 3.3 마커 아이콘
- 경로: `public/marker_ko/`
  - `marker_start.png`, `marker_end.png`, `marker_waypoint_1~5.png`
- 적용: `kakao.maps.MarkerImage(src, Size(36,36))`
- 배치: 출발/경유/도착 순으로 마커 표시, 경유는 1~5 순환 이미지 사용

## 4. 기술 상세

### 4.1 프런트 소스(핵심)
- `src/pages/DirectionsPro.jsx`
  - 모드: DRIVE/WALK/TRANSIT
  - 우선순위: RECOMMEND/FAST/SHORTEST(자동차)
  - 체류 시간, 출발 시간, 경유지 검색 모달(필터/정렬/더보기), 드래그 정렬
  - 자동차: 백엔드 프록시로 Kakao Waypoints 요청 → 폴리라인/요약(정확)
  - 도보/대중교통: 추정 로직 + 점선 폴리라인(정식 연동 시 교체 예정)
  - 마커: `public/marker_ko` 이미지 적용
- `src/components/directions/PlaceSearchInput.jsx`
  - Kakao Places 자동완성(디바운스, 키보드 탐색, 선택)
- `src/styles/directions.css`
  - 타임라인 스타일 정의
- 라우팅: `src/App.js` → `/directions`가 `DirectionsPro` 페이지로 연결

### 4.2 백엔드 API
- `POST /api/kakao-waypoints` → Kakao Mobility `v1/waypoints/directions` 프록시
- `GET /api/persona/courses` → 코스 CSV 파싱/그룹
- 기타 헬스체크/데이터 집계 엔드포인트

### 4.3 환경변수
- 프런트: `REACT_APP_KAKAO_API_KEY`(Maps JS SDK)
- 백엔드: `KAKAO_REST_API_KEY`(Mobility REST), `BACKEND_HOST/BACKEND_PORT`
- 네이버: `NAVER_MAPS_API_KEY_ID`, `NAVER_MAPS_API_KEY` (NCP API GW 헤더 값)

## 5. 운영

### 5.1 개발 실행
- 백엔드: `python backend/app.py` (또는 가상환경 활성화 후 실행)
- 프런트: `cd map-app && npm start` (프록시: `src/setupProxy.js`)

### 5.2 빌드
- 프런트 빌드: `cd map-app && npm run build`
- 백엔드가 CRA build 정적 자산 제공(있을 경우)

## 6. 알려진 이슈/한계
- 도보/대중교통 정식 경로: 공개 REST/JS API 제약으로 미연동(추정치 제공). 외부 키 제공 시 바로 연동 가능
- 회피 옵션: 요청 범위 밖으로 구현 보류(우선순위 낮음)
- 카테고리 정확도: Kakao Places 응답의 `category_name`에 의존(간단 필터)

## 7. 향후 계획(제안)
- 도보/대중교통 정식 연동(Naver/Tmap/Google 중 택1)
- 회피 옵션(유료/고속도로 등) Kakao 스펙 확인 후 안전 반영
- 검색 모달 고도화: 평점/혼잡도/가격대가 있는 소스와 결합, 지도 미리보기
- 공유/저장: 경로 상태를 URL/백엔드에 저장, 링크 공유/즐겨찾기
