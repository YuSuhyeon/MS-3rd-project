# MS 3rd Project - AI 기반 여행 가이드 플랫폼

## 프로젝트 개요

이 프로젝트는 AI 기술을 활용한 종합 여행 가이드 플랫폼으로, 사용자의 여행 성향을 분석하여 맞춤형 여행 코스를 제공하고, 이미지 인식을 통한 관광지 정보 제공, 음성 가이드, 커뮤니티 기능 등을 포함합니다.

## 기술 스택

### Frontend
- **React 19.1.1** - 메인 프레임워크
- **Tailwind CSS** - 스타일링
- **Mantine UI** - 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션
- **React Router** - 라우팅
- **Papa Parse** - CSV 파싱
- **Hangul Romanization** - 한글 로마자 변환

### Backend
- **Flask 2.3.3** - 웹 프레임워크
- **Flask-CORS** - CORS 처리
- **Pandas, Scikit-learn, XGBoost** - 머신러닝
- **Spotipy** - Spotify API 연동
- **Requests** - HTTP 클라이언트

### AI/ML 서비스
- **Azure Computer Vision** - OCR 및 이미지 분석
- **Azure Custom Vision** - 객체 감지
- **Azure Translator** - 다국어 번역
- **Azure OpenAI** - 자연어 처리
- **Microsoft Cognitive Services Speech SDK** - 음성 처리

### 외부 API
- **Kakao REST API** - 지도 및 경로 안내
- **Naver Maps API** - 지도 및 경로 안내
- **Spotify API** - 음악 플레이리스트

## 프로젝트 구조

```
gcp 수정(백엔드)/
├── all/                        # 원본 이미지 파일들 (246개)
│   ├── *.jpg, *.JPG, *.png    # 관광지 이미지 데이터
│   └── HF030001_*.jpg         # 한복 이미지 데이터
├── all_resized/               # 리사이즈된 이미지 파일들 (246개)
│   └── *.jpg, *.JPG, *.png   # 최적화된 이미지 데이터
├── backend/                   # Flask 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py      # API 엔드포인트
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── persona_service.py    # 페르소나 분석 서비스
│   │       └── community_service.py  # 커뮤니티 서비스
│   ├── data/                  # 데이터 파일들
│   │   ├── 2024 외래관광객조사 전처리.csv
│   │   ├── 2024 외래관광객조사_Data.csv
│   │   ├── 2024 외래관광객조사_라벨링_k6.csv
│   │   └── persona_questions.json
│   ├── docs/
│   │   └── naver_api.md       # 네이버 API 문서
│   ├── models/
│   │   └── naver_api.md       # 네이버 API 모델 문서
│   ├── app.py                 # Flask 앱 진입점
│   ├── requirements.txt       # Python 의존성
│   └── seoulpoi-efc1c9e6c116.json  # GCP 서비스 계정 키
├── map-app/                   # React 프론트엔드
│   ├── docs/
│   │   ├── FRS_PROGRESS.md    # FRS 진행 상황
│   │   └── FRS_v2.01.md       # FRS v2.01 문서
│   ├── public/
│   │   ├── assets/
│   │   │   └── landing/       # 랜딩 페이지 에셋
│   │   │       ├── hero.mp4   # 히어로 비디오
│   │   │       └── hero.png   # 히어로 이미지
│   │   ├── course_data/
│   │   │   └── routes_all_simplified.csv  # 코스 데이터
│   │   ├── img/               # 이미지 파일들
│   │   ├── marker_ko/         # 한국어 마커 이미지들
│   │   ├── seoul_data/        # 서울 관광지 데이터 (7개 CSV)
│   │   │   ├── seoul_관광지.csv
│   │   │   ├── seoul_레포츠.csv
│   │   │   ├── seoul_문화시설.csv
│   │   │   ├── seoul_쇼핑.csv
│   │   │   ├── seoul_숙박.csv
│   │   │   ├── seoul_음식점.csv
│   │   │   └── seoul_행사_공연_축제.csv
│   │   ├── final_visit_seoul.csv      # 최종 방문지 데이터
│   │   ├── final_visit_seoul 2.csv    # 최종 방문지 데이터 (백업)
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/        # 재사용 가능한 컴포넌트
│   │   │   ├── community/     # 커뮤니티 관련
│   │   │   │   └── SpotifyPlaylistGenerator.jsx
│   │   │   ├── directions/    # 경로 안내 관련
│   │   │   │   ├── DateRangeModal.jsx
│   │   │   │   ├── MapContainer.jsx
│   │   │   │   ├── PlaceSearchInput.jsx
│   │   │   │   ├── RecentRoutes.jsx
│   │   │   │   └── WaypointList.jsx
│   │   │   ├── docent/        # 가이드 관련
│   │   │   │   ├── DocentChatbot.jsx
│   │   │   │   ├── LocationMap.jsx
│   │   │   │   ├── POIDetails.jsx
│   │   │   │   └── POIList.jsx
│   │   │   ├── itinerary/     # 일정 관리 관련
│   │   │   │   ├── ActivityEditor.jsx
│   │   │   │   ├── ItineraryHeader.jsx
│   │   │   │   └── TimelineDay.jsx
│   │   │   ├── persona/       # 페르소나 분석 관련
│   │   │   │   ├── ProgressIndicator.jsx
│   │   │   │   └── QuestionCard.jsx
│   │   │   ├── result/        # 결과 표시 관련
│   │   │   │   ├── PersonaChart.jsx
│   │   │   │   ├── PersonaResult.jsx
│   │   │   │   └── RecommendationCard.jsx
│   │   │   └── ui/            # UI 컴포넌트
│   │   │       ├── badge.jsx
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       ├── scroll-area.jsx
│   │   │       ├── select.jsx
│   │   │       ├── switch.jsx
│   │   │       └── textarea.jsx
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── CommunityMain.jsx      # 커뮤니티
│   │   │   ├── DirectionsMantine.jsx  # 경로 안내 (Mantine)
│   │   │   ├── DirectionsMantineImproved.jsx  # 개선된 경로 안내
│   │   │   ├── DirectionsMyro.jsx     # 경로 안내 (Myro)
│   │   │   ├── DocentMantine.jsx      # 가이드 기능 (Mantine)
│   │   │   ├── DocentVision.jsx       # 이미지 인식 가이드
│   │   │   ├── Home.jsx               # 랜딩 페이지
│   │   │   ├── ItineraryView.jsx      # 일정 관리
│   │   │   ├── PersonaAnalysis.jsx    # 페르소나 분석
│   │   │   ├── ResultDashboard.jsx    # 결과 대시보드
│   │   │   ├── useIsMobile.jsx        # 모바일 감지 훅
│   │   │   └── VisionOCR.jsx          # OCR 기능
│   │   ├── Entities/          # 데이터 엔티티
│   │   │   ├── Itinerary.js/.json     # 일정 엔티티
│   │   │   ├── POI.js/.json           # 관광지 엔티티
│   │   │   ├── Route.js/.json         # 경로 엔티티
│   │   │   └── TravelProfile.js/.json # 여행 프로필 엔티티
│   │   ├── integrations/      # 외부 서비스 연동
│   │   │   ├── Core.js        # 핵심 통합 서비스
│   │   │   ├── openai.js      # OpenAI 연동
│   │   │   ├── translator.js  # 번역 서비스
│   │   │   └── tts.js         # 음성 합성
│   │   ├── styles/            # 스타일 파일들
│   │   │   ├── directions.css # 경로 안내 스타일
│   │   │   ├── itinerary.css  # 일정 관리 스타일
│   │   │   └── layout.css     # 레이아웃 스타일
│   │   ├── utils/             # 유틸리티 함수
│   │   │   └── index.js
│   │   ├── App.js             # 메인 앱 컴포넌트
│   │   ├── App.css            # 앱 스타일
│   │   ├── index.js           # 앱 진입점
│   │   ├── index.css          # 글로벌 스타일
│   │   ├── kakaoMap.js        # 카카오맵 연동
│   │   ├── main_Layout.js     # 메인 레이아웃
│   │   ├── NaverDirections.jsx # 네이버 경로 안내
│   │   ├── setupProxy.js      # 프록시 설정
│   │   └── tailwind.config.js # Tailwind 설정
│   ├── package.json           # Node.js 의존성
│   ├── package-lock.json      # 의존성 잠금 파일
│   ├── jsconfig.json          # JavaScript 설정
│   ├── postcss.config.js      # PostCSS 설정
│   ├── tailwind.config.js     # Tailwind CSS 설정
│   └── README.md              # 프론트엔드 README
├── batch_results.csv          # 배치 처리 결과
├── check_setupproxy.js        # 프록시 설정 확인 스크립트
├── README.md                  # 메인 README
├── README2.md                 # 상세 README
└── testtt.ipynb              # 테스트 노트북
```

## 주요 기능

### 1. 페르소나 분석 시스템
- 사용자 설문을 통한 여행 성향 분석
- 6가지 페르소나 타입 분류 (미식가, 문화 체험가, 자연 힐링형, 액티브 모험가, 럭셔리 트래블러, 일반)
- XGBoost 기반 머신러닝 모델 사용

### 2. 맞춤형 여행 코스 추천
- 페르소나 기반 관광지 추천
- 거리 및 시간 고려한 경로 최적화
- Kakao/Naver API를 활용한 실시간 경로 안내

### 3. AI 이미지 인식 가이드
- **Azure Custom Vision**을 활용한 관광지 객체 감지
- **Azure Computer Vision**을 활용한 OCR 텍스트 인식
- 메뉴 정보 자동 분석 및 다국어 번역

### 4. 음성 가이드 시스템
- Microsoft Cognitive Services Speech SDK 활용
- 다국어 음성 합성 지원

### 5. 커뮤니티 기능
- Spotify API 연동 음악 플레이리스트 생성
- 여행 경험 공유

## Azure 서비스 사용 현황

### 현재 사용 중인 Azure 서비스
1. **Azure Computer Vision** (`/api/vision/ocr`)
   - OCR 텍스트 인식
   - 이미지 분석
   - 환경변수: `AZURE_VISION_ENDPOINT`, `AZURE_VISION_KEY`

2. **Azure Custom Vision** (`DocentVision.jsx`)
   - 관광지 객체 감지
   - 환경변수: `REACT_APP_CV_URL`, `REACT_APP_CV_KEY`

3. **Azure Translator** (`translator.js`)
   - 다국어 번역 서비스
   - 환경변수: `REACT_APP_AZURE_TRANSLATOR_KEY`, `REACT_APP_AZURE_TRANSLATOR_ENDPOINT`, `REACT_APP_AZURE_TRANSLATOR_REGION`

4. **Azure OpenAI** (`openai.js`)
   - 자연어 처리 및 메뉴 정보 생성
   - 환경변수: `REACT_APP_AZURE_OPENAI_ENDPOINT`, `REACT_APP_AZURE_OPENAI_DEPLOYMENT`, `REACT_APP_AZURE_OPENAI_KEY`, `REACT_APP_AZURE_OPENAI_API_VERSION`

## GCP 연동 변경 계획

### 변경 대상 서비스
1. **Azure Computer Vision → Google Cloud Vision API**
   - OCR 기능 대체
   - 텍스트 감지 및 분석 기능

2. **Azure Custom Vision → Google Cloud AutoML Vision**
   - 객체 감지 모델 대체
   - 관광지 인식 기능

3. **Azure Translator → Google Cloud Translation API**
   - 다국어 번역 기능 대체

4. **Azure OpenAI → Google Cloud Vertex AI**
   - 자연어 처리 기능 대체

### 변경 작업 계획

#### 1단계: Google Cloud Vision API 연동
- **파일**: `backend/app/api/routes.py` (OCR 엔드포인트)
- **변경사항**:
  - Azure Computer Vision API 호출을 Google Cloud Vision API로 변경
  - 환경변수 변경: `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`
  - API 응답 형식 맞춤

#### 2단계: Google Cloud AutoML Vision 연동
- **파일**: `map-app/src/pages/DocentVision.jsx`
- **변경사항**:
  - Azure Custom Vision API 호출을 Google Cloud AutoML Vision으로 변경
  - 환경변수 변경: `REACT_APP_GCP_PROJECT_ID`, `REACT_APP_GCP_MODEL_ID`
  - 예측 결과 파싱 로직 수정

#### 3단계: Google Cloud Translation API 연동
- **파일**: `map-app/src/integrations/translator.js`
- **변경사항**:
  - Azure Translator API 호출을 Google Cloud Translation API로 변경
  - 환경변수 변경: `REACT_APP_GOOGLE_TRANSLATE_API_KEY`
  - API 요청/응답 형식 수정

#### 4단계: Google Cloud Vertex AI 연동
- **파일**: `map-app/src/integrations/openai.js`
- **변경사항**:
  - Azure OpenAI API 호출을 Google Cloud Vertex AI로 변경
  - 환경변수 변경: `REACT_APP_GCP_PROJECT_ID`, `REACT_APP_GCP_LOCATION`
  - API 엔드포인트 및 인증 방식 변경

### 필요한 GCP 서비스 설정
1. **Google Cloud Vision API** 활성화
2. **Google Cloud AutoML Vision** 모델 훈련 및 배포
3. **Google Cloud Translation API** 활성화
4. **Google Cloud Vertex AI** 활성화
5. **서비스 계정 키** 생성 및 환경변수 설정

### 예상 이점
- **비용 최적화**: GCP의 더 경쟁력 있는 가격 정책
- **통합성**: Google 생태계와의 더 나은 통합
- **성능**: Google의 AI/ML 서비스 성능 향상
- **확장성**: GCP의 글로벌 인프라 활용

## 설치 및 실행

### Backend 실행
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend 실행
```bash
cd map-app
npm install
npm start
```

### 환경변수 설정
프로젝트 루트에 `.env` 파일 생성:
```env
# Backend
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5001
FLASK_SECRET_KEY=your-secret-key

# Azure (현재)
AZURE_VISION_ENDPOINT=your-azure-vision-endpoint
AZURE_VISION_KEY=your-azure-vision-key
AZURE_TRANSLATOR_KEY=your-azure-translator-key
AZURE_TRANSLATOR_ENDPOINT=your-azure-translator-endpoint
AZURE_TRANSLATOR_REGION=your-azure-translator-region

# GCP (변경 후)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
REACT_APP_GCP_PROJECT_ID=your-gcp-project-id
REACT_APP_GCP_MODEL_ID=your-automl-model-id
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your-google-translate-key

# External APIs
KAKAO_REST_API_KEY=your-kakao-api-key
NAVER_MAPS_API_KEY_ID=your-naver-api-id
NAVER_MAPS_API_KEY=your-naver-api-key
```

## 데이터 구조

### 관광지 데이터
- **위치**: `map-app/public/seoul_data/`
- **포맷**: CSV
- **포함 정보**: 관광지명, 주소, 좌표, 카테고리, 설명

### 페르소나 데이터
- **위치**: `backend/data/persona_questions.json`
- **포맷**: JSON
- **포함 정보**: 설문 질문, 답변 옵션, 가중치

### 코스 데이터
- **위치**: `map-app/public/course_data/routes_all_simplified.csv`
- **포맷**: CSV
- **포함 정보**: 페르소나별 추천 코스, 경유지 순서

## 개발 노트

### 주요 기술적 고려사항
1. **CORS 설정**: 프론트엔드와 백엔드 간 통신을 위한 CORS 설정
2. **파일 업로드**: 이미지 파일 처리 및 임시 저장
3. **상태 관리**: React Context 및 로컬 상태 관리
4. **에러 처리**: API 호출 실패 시 사용자 친화적 에러 메시지
5. **성능 최적화**: 이미지 압축, API 응답 캐싱

### 향후 개선 사항
1. **GCP 연동 완료** 후 성능 및 비용 비교 분석
2. **PWA 지원** 추가로 모바일 앱 경험 향상
3. **실시간 채팅** 기능 추가
4. **AR 기능** 통합으로 더욱 몰입감 있는 가이드 제공
5. **다국어 지원** 확대

## 라이선스

이 프로젝트는 Microsoft AI School 3기 최종 프로젝트로 개발되었습니다.
