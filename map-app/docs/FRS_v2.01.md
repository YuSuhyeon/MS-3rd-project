# AI Seoul Tour Planner & Docent 웹 서비스 기능 명세서 (FRS)

버전: 2.01  
작성일: 2025-09-02

## 1. 개요

### 1.1. 문서 목적
본 문서는 ‘AI Seoul Tour Planner & Docent’ 웹 서비스의 기능적/비기능적 요구사항을 상세히 정의한다. 페르소나 분석, 경로 추천 및 편집, 실시간 위치 기반 도슨트(멀티랭·TTS) 등 핵심 기능 구현의 기준을 제공하며, 프로젝트 이해관계자 간 통일된 이해를 돕는다.

### 1.2. 시스템 개요
본 시스템은 다음 두 가지 주요 서비스로 구성된 통합 서울 관광 솔루션이다.
- AI Tour Planner: 사용자의 여행 스타일을 AI로 분석해 6가지 페르소나로 분류하고, 맞춤형 하루 추천 코스를 시각적으로 제공하며, 사용자가 직접 경로를 수정할 수 있는 동적 여행 계획 서비스.
- AI Docent: 사용자의 실시간 GPS 위치를 기반으로 주변 관광지(POI) 정보를 음성(TTS)으로 자동 안내하고, 다국어 번역 및 RAG 기반 챗봇을 통해 상세 정보를 제공하는 실시간 가이드 서비스.

### 1.3. 사용자 프로필
- 대상: 서울을 여행하는 내·외국인 자유여행객(FIT)
- 특징: 개인화된 여행 계획과 깊이 있는 정보를 원함. 모바일 웹 사용에 익숙. 여행 중 실시간 정보(길찾기, 주변 정보) 요구가 높음.

## 2. 기능 요구사항 (Functional Requirements)

### Part A: AI Tour Planner 서비스

#### 2.1. 사용자 입력 페이지 (Home)
- 기능 ID: FR-PLAN-100  
  기능명: 페르소나 분석을 위한 사용자 정보 입력
  - FR-PLAN-101: 질문 1, 2, 4, 5는 단일 선택(Radio) 그룹이며, 선택된 항목을 다시 클릭하여 선택 해제 가능.
  - FR-PLAN-102: 질문 3(관심 활동)은 다중 선택(Checkbox) 그룹, 최대 3개까지. 4개 이상 선택 시 경고 후 선택 취소.
  - FR-PLAN-103: 제출 시 단일 선택 그룹 유효성 검사. 미답변 시 경고 및 제출 차단.

수용 기준(예):
- 단일선택 항목은 토글 해제가 가능해야 하며, 각 문항 상태가 즉시 UI에 반영된다.
- 다중선택 4번째 클릭 시 경고 메시지 표출 및 체크 상태가 유지되지 않는다.
- 제출 시 미답변 문항이 하이라이트되고 안내 문구가 표시된다.

#### 2.2. 추천 결과 페이지 (Result Dashboard)
- 기능 ID: FR-PLAN-200  
  기능명: 페르소나 분석 결과 및 추천 코스 요약 표시
  - FR-RSLT-001: 상단에 예측된 페르소나 이름, 상세 설명, 키워드를 표시.
  - FR-RSLT-002: AI 분석의 근거가 된 사용자의 선택 항목을 표시.
  - TOP 3 활동을 만족도(%)와 함께 목록으로 표시.
  - 추천 하루 코스(오전/오후/저녁)를 타임라인 형태로 시각화.
  - ‘나만의 경로 만들기’ 클릭 시 추천 코스 정보를 포함하여 경로 편집 페이지로 이동.

수용 기준(예):
- 코스 타임라인에 최소 3구간(오전/오후/저녁)이 표현되고, 각 구간은 대표 활동과 요약이 있다.
- 이동 시 Route Editor로 전달되는 초기 경로 데이터(POI 목록, 순서, 메타)가 유지된다.

#### 2.3. 경로 편집 페이지 (Route Editor)
- 기능 ID: FR-PLAN-300  
  기능명: 추천 경로 시각화 및 편집 (2단 구성: 중앙 지도, 우측 요약 패널)

지도 영역 (Map View)
- FR-PLAN-301: 추천된 장소(POI)를 지도 위에 순서 마커(①, ②, ③)와 폴리라인으로 표시.
- FR-PLAN-302: 마커 클릭 시 이름/사진이 포함된 인포윈도우 표시.
- FR-PLAN-303: 경로 순서 마커 드래그 앤 드롭으로 방문 순서 변경. 변경 시 우측 패널 및 폴리라인 실시간 동기화.

요약 정보 패널 (Summary Panel)
- FR-PLAN-304: 이동 순서 목록 제공. 드래그 앤 드롭으로 순서 변경(지도와 동기화), 각 항목 ‘삭제’ 버튼 제공.
- FR-PLAN-305: 검색창을 통해 새로운 장소를 검색·추가. 추가 즉시 지도·목록 반영.
- FR-PLAN-306: 교통수단 선택(대중교통/도보/자전거 등) 옵션 제공.
- FR-PLAN-307: 순서·교통수단 변경 시 카카오 길찾기 API로 총 예상 이동 시간/비용을 실시간 업데이트.
- FR-PLAN-308: 최종 경로 저장/공유(공유 링크 생성) 기능 제공.

수용 기준(예):
- 순서 변경 시 폴리라인 재계산 및 Bounds 자동 맞춤.
- 교통수단 변경 시 API 요청 파라미터가 달라지고, 총 이동 시간/비용이 3초 내 갱신.
- 공유 링크는 동일 경로를 재구성할 수 있는 식별자/파라미터를 포함한다.

### Part B: AI Docent 서비스

#### 2.4. 도슨트 메인 페이지 (Docent View)
- 기능 ID: FR-DOCENT-100  
  기능명: 실시간 위치 기반 주변 정보 제공 (3단 레이아웃)

공통 기능
- FR-DOCENT-101(다국어 지원): 한국어/English/日本語/中文(简体) 선택. UI 텍스트, POI 정보(이름/주소/설명), 챗봇 응답, TTS가 선택 언어로 제공. Azure Translator API 사용.
- FR-DOCENT-102(실시간 위치 추적): Geolocation API로 현재 좌표 수신. 지도에 내 위치 마커(my_walk.png)와 현재 주소 텍스트 표시. ‘현재 위치로 이동’ 버튼 제공.
- FR-DOCENT-103(POI 데이터 로딩): 시작 시 final_visit_seoul.csv에서 모든 POI 로드 및 내부 관리.

좌측 패널 (POI List Panel)
- FR-DOCENT-104: 카테고리 필터(예: 고궁, 미술관&박물관), 이름/주소 검색.
- FR-DOCENT-105: 목록 클릭 시 지도 중앙 이동 + 우측 상세 패널에 정보 표시.

중앙 지도 (Map View)
- FR-DOCENT-106: 모든 POI 위치에 마커(card_blue.png) 표시.
- FR-DOCENT-107: 마커 클릭 시 해당 POI 선택, 인포윈도우(‘길찾기’ 버튼 포함) 표시.
- FR-DOCENT-108: 내 위치(또는 클릭 위치) 중심 반경 50m Circle 표시.

우측 패널 (Detail & Recommendation)
- FR-DOCENT-109: 선택된 POI의 상세(이름·설명·주소)를 언어 설정에 따라 번역 표시.
- FR-DOCENT-110: ‘AI Docent ON/OFF’ 토글 제공. ON일 때 50m 근접 또는 선택 시 Azure Speech TTS로 설명 자동 재생. 재생 중 ‘오디오 중지’, 정지 시 ‘오디오 재생’ 제공. OFF일 때 모든 음성 기능 비활성화.
- FR-DOCENT-111: 현재 위치에서 가장 가까운 POI 3개를 거리와 함께 추천. 각 항목에 ‘설명 보기’/‘길찾기’ 제공.
- FR-DOCENT-112: 반경 50m 내 POI 목록 별도 표시.

수용 기준(예):
- 언어 전환 시 1초 내 UI 텍스트와 선택된 POI 상세가 번역 반영.
- 근접 이벤트 발생 시 1초 내 TTS 재생 시작(네트워크 환경 정상 가정).
- 지도 인터랙션은 60fps에 근접한 반응성을 유지(마커/원 렌더링 최적화).

### Part C: RAG 기반 챗봇 서비스

#### 2.5. 챗봇 (Chatbot)
- 기능 ID: FR-CHAT-100  
  기능명: 서울 관광 정보 질의응답 (Azure Cognitive Search + Azure OpenAI RAG)
  - UX: 우측 하단 플로팅 ‘챗봇에게 질문’ 버튼 → 패널 열림 → 질문 입력 → 전송.
  - 언어 감지/번역: 비한국어 입력 시 Azure Translator로 한국어 번역(검색 정확도 향상).
  - 검색: 한국어 질의로 Search 인덱스(seoul-report-index) 검색.
  - 생성: 검색 결과와 원 질문을 모델 프롬프트로 전달. “검색된 결과만으로 답변” 지시 포함.
  - 응답/재번역: 모델 응답(한국어)을 사용자의 원 언어로 재번역 후 UI 표시.
  - FR-CHAT-101: 검색 결과가 없을 경우 추측 없이 부재 안내.
  - FR-CHAT-102: 대화 초기화/다시 시도 기능 포함.

수용 기준(예):
- 첫 응답까지 5초 이내 시작(네트워크 정상 가정, 스트리밍 가능 시 점진 표시).
- 근거 문서/출처(타이틀/링크)를 선택적으로 함께 표기 가능.

## 3. 비기능 요구사항 (NFR)

### 3.1. 성능
- Planner: 페르소나 분석 결과 3초 이내 로드.
- Docent: 지도 로딩 및 POI 마커 표시 2초 이내 완료. 챗봇 첫 응답 5초 이내 시작.

### 3.2. 보안/키 관리
- 모든 Azure/Kakao API 키는 클라이언트 코드에 하드코딩 금지. 서버 또는 환경 변수로 관리.
- Dev 예시: `REACT_APP_KAKAO_JS_KEY`(브라우저), `KAKAO_REST_API_KEY`(서버 프록시). 배포 시 보안 저장소 사용.

### 3.3. 사용성
- 직관적 UI, 다국어 사용자 고려. 명확한 아이콘 및 간결한 텍스트. 모바일 우선/반응형.

### 3.4. 호환성
- 최신 Chrome, Safari, Edge 및 iOS/Android 모바일 웹 환경 지원.

## 4. 데이터/API/환경

### 4.1. 데이터 소스 (POI)
- 원본: `public/final_visit_seoul.csv` 및 `public/seoul_data/*.csv`
- 주요 필드(예): `poi_id, category, name_ko, lat, lon, address_ko, rag_seed_text_ko`
- 통합 API: `GET /api/seoul-data?q=키워드` → `{ count, items: [{ id, name, lat, lng, addr, category, desc }] }`

### 4.2. 외부 API
- Kakao Maps JavaScript SDK: 지도·마커·지오코딩
- Kakao Mobility Directions: 길찾기/경로(서버 프록시 경유)
- Azure Translator: 다국어 번역
- Azure Speech Service: TTS
- Azure Cognitive Search + Azure OpenAI: RAG 챗봇

### 4.3. 프록시/엔드포인트
- 프록시: `src/setupProxy.js`
  - `/api/kakao-directions` → `https://apis-navi.kakaomobility.com/v1/directions`
  - `/api/kakao-waypoints` → 동일 타깃, `Content-Type: application/json`
  - 인증 헤더: `Authorization: KakaoAK ${KAKAO_REST_API_KEY}` (서버 환경 변수)

### 4.4. 라우팅/페이지
- `/docent`(Docent View), `/directions`(Route Editor), `/itinerary`(Itinerary View)

### 4.5. 환경 변수/포트
- 개발 포트: `PORT=5000`
- 브라우저 키: `REACT_APP_KAKAO_JS_KEY`
- 서버 키: `KAKAO_REST_API_KEY`

## 5. 품질 보증/테스트(개요)

### 5.1. 단위/통합 테스트 (예)
- Planner 입력 검증(라디오 토글, 체크박스 3개 제한, 제출 차단) 테스트.
- Route Editor 순서 변경 시 지도 폴리라인/요약 동기화 테스트.
- Docent 위치 권한 부여/거부 플로우 및 50m 반경 판정 테스트.
- 번역/음성 API 오류 시 폴백 메시지/재시도 버튼 동작.

### 5.2. 성능 측정 (예)
- 마커 렌더링 수(최대 500개) 시 초기 로딩 시간 측정(2초 내 목표).
- 챗봇 응답 지연 시간 95퍼센타일 5초 이내.

## 6. 구현 가이드(요약)

- 키 관리: 클라이언트(맵 JS 키), 서버 프록시(REST 키) 분리. 리포에 키 하드코딩 금지.
- 데이터 적재: CSV → 서버에서 정규화 후 `/api/seoul-data`로 제공.
- 경로 계산: 클라이언트는 입력 상태 관리, CAR 모드 시 프록시를 통해 Kakao Directions 호출.
- i18n: UI 사전 + Translator 결합. POI 텍스트는 요청 시 번역/캐시.
- TTS: 선택/근접 트리거 시 Speech SDK 호출. 동시 재생 방지/중지 토글 제공.
- RAG: Translator(입력) → Search → OpenAI(생성) → Translator(출력) 파이프라인.

---

본 FRS는 Ver 2.01 기준으로 작성되었으며, 세부 항목(페르소나 정의, 요금 정책 등)이 확정될 경우 후속 버전에서 보완한다.

