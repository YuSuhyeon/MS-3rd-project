# Project Architecture & Developer Guide: MS-3rd-project-1

## 1. Executive Summary
- 1.1. Project Purpose: 서울 여행자에게 페르소나 기반 추천, 경로 탐색, 커뮤니티 공유를 제공하는 풀스택 웹 애플리케이션입니다.
- 1.2. Core Functionality:
  - 페르소나 분석 및 맞춤 경로 추천
  - 도보/대중교통/자동차 경로 탐색 및 시각화(네이버/카카오/TMap 활용)
  - 커뮤니티 글/댓글/좋아요 및 이미지 업로드(Azure Blob)
  - 소셜 로그인(Google/Microsoft)과 사용자 세션 관리
  - 부가 기능: 번역(Translator), OCR/객체인식(비전), Spotify 연계

## 2. Technology Stack & Dependencies
아래는 프런트엔드/백엔드 및 개발 도구 기반의 기술 스택 요약입니다. (map-app/package.json, backend/requirements.txt 기준)

- 2.1. Frontend:
  - React (CRA), React Router, Leaflet/React-Leaflet, Mantine UI, Tailwind CSS, i18next
- 2.2. Backend:
  - Python 3, Flask, Flask-CORS, Requests
- 2.3. Database:
  - MySQL (Azure Database for MySQL; mysql-connector-python 사용)
- 2.4. State Management:
  - Zustand (여행 일정/경로 상태 관리)
- 2.5. Key Libraries (10단어 내외 설명):
  - @azure/msal-react: Microsoft 로그인 플로우를 React에서 쉽게 연동.
  - @react-oauth/google: Google OAuth 인증 훅으로 로그인 처리 단순화.
  - react-router-dom: SPA 라우팅과 화면 전환 제어 클라이언트 라우터.
  - leaflet/react-leaflet: 인터랙티브 지도를 React 컴포넌트로 렌더링.
  - mantine(+hooks/modals/notifications): 풍부한 UI 컴포넌트와 모달/알림 제공.
  - tailwindcss(+postcss/autoprefixer): 유틸리티 퍼스트 CSS로 빠른 스타일링.
  - i18next/react-i18next: 다국어 번역과 런타임 언어 전환 지원.
  - dayjs/date-fns: 날짜 시간 포맷팅과 계산을 위한 경량 라이브러리.
  - framer-motion: 선언적 모션/애니메이션으로 인터랙션 개선.
  - http-proxy-middleware: 개발 중 /api 프록시로 CORS 우회.
  - jwt-decode: 브라우저에서 JWT 페이로드 안전 디코드.
  - papaparse: 클라이언트에서 CSV 데이터를 빠르게 파싱.
  - azure-storage-blob: Azure Blob에 파일 업로드/다운로드/설정.
  - requests: 파이썬에서 외부 HTTP API 호출 단순화.
  - spotipy: Spotify Web API를 쉽게 호출하는 파이썬 클라이언트.
  - mysql-connector-python: 파이썬 MySQL 드라이버(커넥션/쿼리 수행).
  - ultralytics/torch/opencv: YOLO 객체 감지 추론 실행을 위한 스택.
  - python-dotenv: .env 환경변수 로딩 유틸리티.
  - pandas/scikit-learn/xgboost: 페르소나 모델 전처리/추론 파이프라인.
  - microsoft-cognitiveservices-speech-sdk: 음성합성/인식 기능 연동.
- 2.6. Dev & Build Tools:
  - react-scripts(빌드/테스트/개발 서버), Tailwind + PostCSS + Autoprefixer, Testing Library, CRA 프록시

## 3. Architecture & Directory Structure
- 3.1. High-Level Architecture: 모노레포 기반 Client-Server 아키텍처
  - 프런트엔드(React, map-app) → 개발 시 `setupProxy.js`로 `/api` 요청을 Flask 백엔드(backend)로 프록시
  - Flask는 Blueprint로 `/api/*` REST 엔드포인트 제공, CSV/모델/스토리지/외부 API와 연계
  - 배포 시 Flask가 SPA 정적 파일 서빙 지원(react build 탐지 시)

  ```python path=/home/rlawjdgns452/project/MS-3rd-project-1/backend/app/__init__.py start=42
  from .api.routes import api_bp
  app.register_blueprint(api_bp, url_prefix='/api')
  ```

- 3.2. 컴포넌트 다이어그램(개요)
  ```mermaid path=null start=null
  flowchart LR
    subgraph Browser[Browser (React SPA)]
      UI[Pages/Components]
      Store[Zustand Store]
    end
    UI --> Proxy[/CRA Dev Proxy (setupProxy.js)/]
    Proxy --> Flask[Flask API (Blueprint /api)]

    subgraph FlaskSide[Backend Services]
      Routes[routes.py]
      Services[services/*]
      Persona[persona_service.py]
      Social[community_social.py]
      Storage[storage_service.py]
    end

    Flask <--> Routes
    Routes --> Persona
    Routes --> Social
    Routes --> Storage

    Social --> MySQL[(Azure MySQL)]
    Storage --> Blob[(Azure Blob Storage)]

    Routes --> Kakao[(Kakao Mobility API)]
    Routes --> Naver[(Naver Map Direction APIs)]
    Routes --> Vision[(Azure Vision OCR)]
    Routes --> Spotify[(Spotify API via Spotipy)]

    Browser -. CSV .-> PubCSV[[public/seoul_data, course_data]]
    Services -. Models .-> Artifacts[(persona_classifier_model.joblib, YOLO best.pt)]
  ```

- 3.3. Directory Tree(요약)
  ```text path=null start=null
  /
  ├── package.json / package-lock.json
  ├── README.md
  ├── check_setupproxy.js                 # dev 프록시 존재 확인
  ├── map-app/                            # Frontend (React, CRA)
  │  ├── public/
  │  │  ├── seoul_data/*.csv             # 서울 POI 데이터 CSV
  │  │  └── course_data/routes_all_simplified.csv
  │  └── src/
  │     ├── setupProxy.js                # /api → Flask 프록시
  │     ├── pages/                       # 주요 화면 (Persona, Result, Directions, Community 등)
  │     ├── components/                  # 재사용 컴포넌트(경로/도슨트/커뮤니티/UI)
  │     ├── context/                     # Auth/MSAL/i18n
  │     ├── store/                       # Zustand 상태
  │     └── integrations/                # STT/TTS/번역/TMap 로더 등
  └── backend/                           # Backend (Flask)
     ├── app.py                          # 앱 엔트리, .env 로드
     ├── requirements.txt
     ├── data/
     │  ├── persona_questions.json       # 페르소나 질문
     │  └── route_plans/                 # 공유 경로 저장소(런타임 생성)
     ├── models/                         # 모델/가중치(예: best.pt, joblib)
     └── app/
        ├── __init__.py                  # CORS, SPA 서빙, BP 등록
        ├── api/routes.py                # 모든 REST 엔드포인트
        └── services/
           ├── persona_service.py        # 질문/벡터화/모델 추론
           ├── community_social.py       # MySQL CRUD(Boards/Comments/Likes/Users)
           └── storage_service.py        # Azure Blob 업로드, SAS URL
  ```

## 4. End-to-End Feature Analysis
가장 복잡/핵심 흐름: “커뮤니티 글 작성 + 이미지 업로드”

1. UI 상호작용: 사용자가 커뮤니티 작성 모달에서 제목/내용/태그/이미지 입력 후 등록. (`map-app/src/components/community/PostModal.jsx`)
2. 프록시 경유: 개발 환경에서 `setupProxy.js`가 `/api` 요청을 백엔드로 전달.
   ```js path=/home/rlawjdgns452/project/MS-3rd-project-1/map-app/src/setupProxy.js start=1
   const { createProxyMiddleware } = require("http-proxy-middleware");
   module.exports = function (app) {
     const target = process.env.REACT_APP_BACKEND_ORIGIN || "http://127.0.0.1:5001";
     app.use("/api", createProxyMiddleware({ target, changeOrigin: true }));
   };
   ```
3. 백엔드 라우팅: `POST /api/boards` → `backend/app/api/routes.py:create_board()`
4. 인증 확인: `get_user_from_token()`이 Authorization 헤더(JWT) 또는 세션에서 `current_user_id` 확인.
5. 이미지 업로드: `storage_service.upload_image(file)` → Azure Blob에 업로드, Blob URL 반환.
6. DB 트랜잭션: `community_social.BoardService.create_post(...)`가 `boards`, `pictures` 레코드 삽입.
7. 응답 반환: `{ success: true, board_id, message }` 201 JSON 응답.
8. 클라이언트 처리: UI 갱신(새 글 반영 및 상세 모달 등).

보조 플로우: 페르소나 분석 → 결과 대시보드
- PersonaAnalysis.jsx: `/api/persona/questions`로 질문 로드 → 답변 후 `/api/persona/analyze` 호출 → 결과를 저장 후 ResultDashboard로 이동.
- ResultDashboard.jsx: `/api/persona/route`로 스팟 추천 경로를 받고, `/api/persona/courses2`로 CSV 기반 코스를 그룹화하여 표시.

- 4.1 시퀀스 다이어그램 (커뮤니티 글 작성)
  ```mermaid path=null start=null
  sequenceDiagram
    participant U as User
    participant R as React App
    participant P as Dev Proxy (/api)
    participant F as Flask API (routes.py)
    participant S as StorageService
    participant B as BoardService
    participant DB as MySQL (Azure)
    participant AZ as Azure Blob

    U->>R: 작성 모달에서 제목/내용/이미지 입력
    R->>P: POST /api/boards (multipart/form-data)
    P->>F: Forward request
    F->>F: get_user_from_token()로 사용자 확인
    alt 이미지 포함
      F->>S: upload_image(file)
      S->>AZ: 업로드(Blob)
      AZ-->>S: Blob URL 반환
      S-->>F: 업로드 결과(URL 리스트)
    end
    F->>B: create_post(user, title, content, images)
    B->>DB: INSERT boards / pictures
    DB-->>B: OK
    B-->>F: { success, board_id }
    F-->>R: 201 Created JSON
    R-->>U: UI 갱신(새 게시글 반영)
  ```

- 4.2 시퀀스 다이어그램 (페르소나 분석)
  ```mermaid path=null start=null
  sequenceDiagram
    participant U as User
    participant R as PersonaAnalysis.jsx
    participant P as Dev Proxy (/api)
    participant F as Flask API
    participant PS as persona_service.py
    participant ML as Model Artifacts

    U->>R: 질문에 답변 입력
    R->>P: GET /api/persona/questions
    P->>F: 전달
    F->>PS: load_questions()
    PS-->>F: {questions}
    F-->>R: {questions}

    U->>R: 분석 요청(Submit)
    R->>P: POST /api/persona/analyze {answers}
    P->>F: 전달
    F->>PS: analyze_persona(answers)
    PS->>ML: (선택) 모델/인코더 로드 및 예측
    ML-->>PS: 예측/점수
    PS-->>F: persona_type, scores, 설명
    F-->>R: {analysis_result}
    R-->>U: 결과 표시 및 경로 추천/코스 노출
  ```

## 5. Code Interconnectivity Map
주요 모듈 간 데이터/제어 흐름 관계입니다.

| Source Module | Imports/Calls | Target Module | Rationale / Description |
|---|---|---|---|
| `map-app/src/pages/PersonaAnalysis.jsx` | `fetch('/api/persona/questions')` | `backend/app/api/routes.py:get_questions` | 페르소나 질문 로드 |
| `map-app/src/pages/PersonaAnalysis.jsx` | `fetch('/api/persona/analyze')` | `backend/app/api/routes.py:analyze` | 답변 분석 → 페르소나 산출 |
| `map-app/src/pages/ResultDashboard.jsx` | `fetch('/api/persona/route')` | `routes.py:persona_route` | 페르소나 기반 추천 경로 생성 |
| `map-app/src/pages/ResultDashboard.jsx` | `fetch('/api/persona/courses2')` | `routes.py:persona_courses2` | CSV 코스 그룹화/필터 |
| `map-app/src/NaverDirections.jsx` | `fetch('/api/kakao-waypoints')` | `routes.py:kakao_waypoints` | 카카오 경유 경로 요청 |
| `map-app/src/pages/DirectionsMantine.jsx` | `fetch('/api/kakao-waypoints')` | `routes.py:kakao_waypoints` | 자동차/보행 경로 세부 |
| `map-app/src/pages/CommunitySocial.jsx` | `fetch('/api/boards')` | `routes.py:get_boards` | 커뮤니티 글 목록/검색 |
| `map-app/src/components/community/PostModal.jsx` | `POST /api/boards` | `routes.py:create_board` | 글 생성 + 이미지 업로드 |
| `map-app/src/pages/Mypage.jsx` | `/api/users/:id/boards` | `routes.py:get_user_boards` | 특정 사용자 글 목록 |
| `map-app/src/pages/Mypage.jsx` | `/api/user/liked-posts` | `routes.py:get_user_liked_posts` | 내가 좋아요한 글 목록 |
| `map-app/src/context/AuthProvider.js` | `/api/auth/google/callback` | `routes.py:google_callback` | Google 로그인 처리 |
| `map-app/src/context/AuthProvider.js` | `/api/auth/microsoft/callback` | `routes.py:microsoft_callback` | Microsoft 로그인 처리 |
| `map-app/src/components/community/SpotifyPlaylistGenerator.jsx` | `/api/spotify/*` | `routes.py:spotify_*` | Spotify OAuth/유저 조회 |
| `map-app/src/pages/VisionOCR.jsx` | `/api/vision/ocr` | `routes.py:ocr_image` | Azure Vision OCR 프록시 |

## 6. API Endpoints (요약)
서버(Flask) 라우팅을 스캔한 결과, 주요 엔드포인트는 아래와 같습니다. (모두 `/api` 프리픽스)

| Method | Endpoint | Controller/Handler | Description |
|---|---|---|---|
| GET | /api/health | routes.health | 백엔드 상태 확인 |
| GET | /api/seoul-data | routes.seoul_data | 서울 POI 데이터(필터/제한) 조회 |
| POST | /api/persona/analyze | routes.analyze | 페르소나 분석(질문 답변 → 결과) |
| GET | /api/persona/questions | persona_service.load_questions | 페르소나 질문 목록 |
| POST | /api/persona/route | routes.persona_route | 페르소나 기반 추천 경로 생성 |
| GET | /api/persona/courses | routes.persona_courses | CSV 기반 코스 목록 |
| GET | /api/persona/courses2 | routes.persona_courses2 | CSV 기반 코스 그룹화/필터 |
| POST | /api/kakao-waypoints | routes.kakao_waypoints | 카카오 경유지 경로 API 프록시 |
| POST | /api/naver/walking | routes.naver_walking_route | 네이버 보행 경로 계산 |
| POST | /api/naver/transit | routes.naver_transit_route | 네이버 대중교통 경로 계산 |
| POST | /api/tmap/route | routes.tmap_route | 보행: 네이버 보행 보정, 그 외 카카오 |
| POST | /api/tmap/transit | routes.tmap_transit | 네이버 대중교통 보정 경로 구성 |
| POST | /api/route-plans | routes.save_route_plan | 공유 계획 JSON 저장 및 공유 URL |
| GET | /api/route-plans/:id | routes.load_route_plan | 공유 계획 JSON 로드 |
| POST | /api/detect | routes.detect | YOLO 객체 감지(업로드 이미지) |
| POST | /api/poi-info | routes.poi_info | POI 이름 → 정적 정보 매핑 |
| POST | /api/vision/ocr | routes.ocr_image | Azure Vision OCR 프록시 |
| GET | /api/spotify/login | routes.spotify_login | Spotify OAuth 시작 |
| GET | /api/spotify/callback | routes.spotify_callback | Spotify 콜백/리다이렉트 |
| GET | /api/spotify/user | routes.get_spotify_user | Spotify 사용자 프로필 |
| POST | /api/spotify/logout | routes.spotify_logout | Spotify 세션 로그아웃 |
| POST | /api/boards | routes.create_board | 게시글 생성(+Blob 업로드) |
| GET | /api/boards | routes.get_boards | 게시글 목록/검색/페이지네이션 |
| GET | /api/users/:userId/boards | routes.get_user_boards | 특정 사용자 글 목록 |
| GET | /api/boards/:boardId | routes.get_board_detail | 게시글 상세(+댓글/권한) |
| PUT | /api/boards/:boardId | routes.update_board | 게시글 수정(권한 확인) |
| DELETE | /api/boards/:boardId | routes.delete_board | 게시글 삭제(소프트) |
| POST | /api/boards/:boardId/comments | routes.create_comment | 댓글 생성 |
| GET | /api/boards/:boardId/comments | routes.get_comments | 댓글 목록 |
| PUT | /api/comments/:commentId | routes.update_comment | 댓글 수정(권한) |
| DELETE | /api/comments/:commentId | routes.delete_comment | 댓글 삭제(권한) |
| POST | /api/boards/:boardId/like | routes.add_like | 좋아요 추가 |
| DELETE | /api/boards/:boardId/like | routes.remove_like | 좋아요 취소 |
| GET | /api/boards/trending/tags | routes.get_trending_tags | 인기 태그 |
| GET | /api/boards/trending/posts | routes.get_trending_posts | 인기 게시글 |
| GET | /api/user/profile | routes.get_current_user | 현재 로그인 사용자 |
| GET | /api/user/liked-posts | routes.get_user_liked_posts | 좋아요한 글 목록 |
| GET/POST | /api/user/persona-profiles | routes.user_persona_profiles | 페르소나 프로필 |
| GET/POST | /api/user/itineraries | routes.user_itineraries | 여행 일정 |
| GET/PUT/DELETE | /api/user/itineraries/:id | routes.user_itinerary_detail | 일정 상세 CRUD |
| POST | /api/auth/google/callback | routes.google_callback | Google 로그인 처리 |
| POST | /api/auth/microsoft/callback | routes.microsoft_callback | Microsoft 로그인 처리 |
| GET | /api/auth/status | routes.auth_status | 인증 상태 확인 |
| POST | /api/logout | routes.logout | 세션 로그아웃 |

## 부록: 실행 팁
- 개발 서버 실행(권장 포트: 5001/3000)
  ```bash path=null start=null
  # 백엔드(첫 실행 시 가상환경/의존성 설치 필요)
  python3 -m venv venv && source venv/bin/activate
  pip install -r backend/requirements.txt
  BACKEND_PORT=5001 python backend/app.py

  # 프런트엔드
  cd map-app
  npm install
  npm start
  ```
- 개발 프록시 확인
  ```bash path=null start=null
  node check_setupproxy.js   # 'ok' 출력되면 프록시 로드 정상
  ```
- 환경/보안 주의
  - DB/스토리지/API 키 등 민감정보는 .env로 주입하고 커밋 금지
  - 로컬 기본값은 개발 편의를 위한 것으로, 배포 시 반드시 교체

---
이 문서는 저장소의 실제 코드(Flask 라우트, React 코드, 설정 파일)를 기반으로 자동 생성되었습니다. 온보딩 개발자는 위 구조와 플로우를 기준으로 기능 추가/디버깅을 진행하시길 권장합니다.