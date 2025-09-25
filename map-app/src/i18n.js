import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ko: {
    tour: {
      header: {
        klover: "Klover",
        tour: "Tour",
        subtitle: "Premium Personal Tour",
      },
      list: {
        title: "Klover 투어",
        subtitle:
          "Klover와 제휴한 업체들과 함께 출시한 klover만의 투어 상품을 만나보세요.",
      },
      search: { placeholder: "검색어를 입력하세요" },
      categories: {
        all: "All",
        experience: "Experience",
        it: "IT",
        sports: "Sports",
        beauty: "Beauty",
        culture: "History",
      },
      pagination: { prev: "이전", next: "다음" },
      empty: {
        title: "검색 결과가 없습니다",
        description: "다른 검색어나 필터를 시도해보세요.",
      },
      partners: {
        title: "기업 제휴 파트너",
        subtitle: "신뢰할 수 있는 파트너사",
      },
    },
    tourDetail: {
      products: {
        1: {
          title: "Netflix x Interpark Global",
          description:
            "Everland 자유입장권이 포함된 Kpop Demon Hunters 테마 투어",
          location: "서울 강남구 → 용인 에버랜드",
        },
        2: {
          title: "Microsoft AI Tour Seoul",
          description: "Microsoft AI Tour Seoul - AI 기술과 문화재 복원의 만남",
          location: "서울 중구",
        },
        3: {
          title: "한강버스 X 인스타그램 서울 핫플 투어",
          description:
            "한강버스를 타고 서울 대표 포토스팟과 인스타 핫플을 돌아보는 감성 투어",
          location: "한강 전구간",
        },
        4: {
          title: "LG 트윈스 야구 관람",
          description: "잠실야구장 프리미엄 관람 + 치킨맥주 + 스포츠 체험",
          location: "서울 송파구 (잠실 관광 특구)",
        },
        5: {
          title: "K-뷰티 X 올리브영 프리미엄 뷰티 투어",
          description:
            "피부과 케어 + K-뷰티 브랜드 체험 + 올리브영 쇼핑 + 한방 스파",
          location: "서울 강남구",
        },
        6: {
          title: "서울 전통 문화 투어",
          description:
            "AI 도슨트와 카카오프렌즈 캐릭터가 함께하는 재미있는 박물관 체험",
          location: "서울 종로구",
        },
      },
      data: {
        1: {
          title: "K-Pop 데몬 헌터즈 × 에버랜드 스페셜 콜라보 투어",
          subtitle:
            "넷플릭스 오리지널 시리즈 × 한국 대표 테마파크 완벽 컬래버레이션",
          location: "에버랜드, 낙산공원, N서울타워, 국립중앙박물관",
          duration: "10시간 (에버랜드 입장권 포함)",
          groupSize: "최대 12명",
          language: "한국어, 영어, 중국어",
          partnership: {
            primary: "NETFLIX",
            secondary: "Samsung Everland",
            tertiary: "서울관광재단",
          },
          specialFeatures: [
            "에버랜드 1일 자유이용권 포함",
            "K-Pop 데몬 헌터즈 한정 굿즈 세트",
            "AR 포토존 무제한 이용",
            "드라마 OST 플레이리스트 제공",
            "촬영지 가이드 오디오 투어",
          ],
          itinerary: [
            {
              time: "08:30",
              location: "강남역 집결",
              description: "전용 버스 탑승 및 투어 브리핑",
              duration: "30분",
            },
            {
              time: "09:30",
              location: "에버랜드 입장",
              description: "K-Pop 데몬 헌터즈 테마존 체험 시작",
              duration: "4시간",
            },
            {
              time: "10:00",
              location: "데몬 헌터즈 어트랙션",
              description: "스릴라이드 '악마의 추격전' 체험",
              duration: "45분",
            },
            {
              time: "11:00",
              location: "루미의 마법학교",
              description: "인터랙티브 마법 체험관 & AR 포토존",
              duration: "60분",
            },
            {
              time: "12:30",
              location: "데몬 헌터즈 레스토랑",
              description: "드라마 테마 런치 세트 & 한정 디저트",
              duration: "90분",
            },
            {
              time: "14:00",
              location: "낙산공원 이동",
              description: "루미♥진우 데이트 장면 촬영지 재현",
              duration: "90분",
            },
            {
              time: "16:00",
              location: "N서울타워",
              description: "최종 보스 배틀 촬영지 & 전망대 관람",
              duration: "120분",
            },
            {
              time: "18:00",
              location: "국립중앙박물관",
              description: "고대 유물 에피소드 촬영지 투어",
              duration: "60분",
            },
          ],
          detailSections: [
            {
              title: "에버랜드 X K-Pop 데몬 헌터즈 테마존",
              text: "세계 최초로 공개되는 K-Pop 데몬 헌터즈 테마존에서 드라마 속 스릴 넘치는 액션을 직접 체험하세요. 루미의 마법학교, 진우의 트레이닝 센터, 악마 퇴치 미션까지 완벽 재현된 몰입형 어트랙션이 여러분을 기다립니다.",
            },
            {
              title: "낙산공원 로맨틱 데이트 씬 재현",
              text: "드라마에서 가장 인상 깊었던 루미와 진우의 데이트 장면을 낙산공원에서 직접 재현해보세요. 서울 도심 전망과 함께 드라마틱한 포토타임을 즐길 수 있으며, 전용 포토그래퍼가 인생샷을 선사합니다.",
            },
            {
              title: "N서울타워 최종 결전 무대",
              text: "시즌 피날레를 장식한 N서울타워에서의 최종 보스 배틀을 VR로 체험하고, 드라마 주인공이 된 기분으로 서울의 야경을 감상하세요. 한정판 커플 락커 체험도 포함되어 있습니다.",
            },
          ],
          inclusions: [
            "에버랜드 1일 자유이용권",
            "전용 투어 버스 왕복 교통",
            "K-Pop 데몬 헌터즈 굿즈 세트",
            "드라마 테마 런치 & 디저트",
            "전문 가이드 서비스",
            "N서울타워 전망대 입장료",
            "AR 포토존 이용권",
            "기념품 쇼핑몰 할인 쿠폰 10%",
          ],
          exclusions: [
            "개인 쇼핑 비용",
            "추가 놀이기구 이용료",
            "여행자 보험",
            "개인 간식 및 음료",
          ],
        },
        2: {
          title: "마이크로소프트 AI 투어 서울",
          subtitle: "AI 기술과 문화재 복원의 만남",
          location: "서울 중구 마이크로소프트 코리아",
          duration: "4시간",
          groupSize: "최대 20명",
          language: "한국어, 영어",
          partnership: { primary: "Microsoft Korea", secondary: "국가유산청" },
          itinerary: [
            {
              time: "09:00",
              location: "마이크로소프트 코리아 사무실",
              description: "AI 기술 소개 및 투어 시작",
            },
            {
              time: "10:00",
              location: "AI 데모 센터",
              description: "문화재 복원 AI 기술 체험",
            },
            {
              time: "11:30",
              location: "국가유산청 협업관",
              description: "디지털 문화재 복원 사례 체험",
            },
            {
              time: "13:00",
              location: "마이크로소프트 굿즈샵",
              description: "한정판 기념품 및 AI 체험 키트",
            },
          ],
          detailSections: [
            {
              title: "마이크로소프트 AI 컨퍼런스 2025 - 주요 일정",
              text: "사티아 나델라가 서울에서 열린 마이크로소프트 AI 컨퍼런스에서 AI의 미래를 소개합니다. 기조 세션, 25개의 분과 세션, 12개의 실습 워크샵이 포함된 일정으로 AI 혁신과 산업 변화에 대한 깊은 통찰을 제공합니다.",
            },
            {
              title: "마이크로소프트 AI 컨퍼런스 2025에서 배우고 연결하기",
              text: "사티아 나델라가 소개하는 참가자들은 AI 혁신에 대한 업계 리더들의 통찰을 얻고 클라우드, AI, 보안의 최신 기술을 탐구합니다. 또한 마이크로소프트 임원들과 연결되고, 전문가들과 일대일 토론을 하며, 역동적인 커뮤니티 세션을 통해 네트워크를 확장할 수 있는 기회를 제공합니다.",
            },
            {
              title: "마이크로소프트 AI 컨퍼런스 - 라이브 세션",
              text: "마이크로소프트 AI 컨퍼런스에서 관객들이 AI의 미래에 대한 기조 연설을 듣기 위해 모입니다.",
            },
          ],
          inclusions: [
            "전문가 가이드 투어",
            "AI 기술 체험 세션",
            "한정판 기념품",
            "네트워킹 기회",
          ],
          exclusions: ["교통비", "식사", "개인 비용"],
        },
        3: {
          title: "한강 버스 X 인스타그램 서울 핫플 투어",
          subtitle: "한강을 따라 펼쳐지는 서울 대표 포토스팟 완전 정복",
          location: "한강공원 (여의도-잠실-반포-마포)",
          duration: "3.5시간",
          groupSize: "최대 25명",
          language: "한국어, 영어",
          partnership: { primary: "서울관광재단", secondary: "한강사업본부" },
          itinerary: [
            {
              time: "15:00",
              location: "여의도 한강공원",
              description: "투어 시작 및 인스타그램 포토 팁 강의",
            },
            {
              time: "15:30",
              location: "한강버스 (여의도→잠실)",
              description: "63빌딩 & IFC몰 배경 버스 내 촬영",
            },
            {
              time: "16:00",
              location: "잠실 롯데월드타워 포토존",
              description: "서울 스카이라인 대표 인증샷 촬영",
            },
            {
              time: "16:45",
              location: "한강버스 (잠실→반포)",
              description: "한강 크루즈 감성 동영상 촬영",
            },
            {
              time: "17:15",
              location: "반포 무지개분수",
              description: "골든아워 무지개분수 타임랩스 촬영",
            },
            {
              time: "18:00",
              location: "세빛섬 LED 쇼",
              description: "야경 불꽃놀이 및 단체 기념 촬영",
            },
          ],
          detailSections: [
            {
              title: "여의도 한강공원 투어",
              text: "서울 도심 속 휴식 공간, 여의도 한강공원에서 따릉이를 타고 강변을 따라 달리며 시원한 바람을 느껴보세요. 푸른 잔디밭 위에서 여유로운 피크닉을 즐기며 한강과 스카이라인이 어우러진 특별한 풍경을 감상할 수 있습니다.",
            },
            {
              title: "반포 무지개 분수 투어",
              text: "세계에서 가장 긴 교량분수로 기네스북에 등재된 반포 무지개 분수는 한강의 명소입니다. 낮에는 시원한 물줄기가, 밤에는 형형색색의 조명과 음악이 어우러져 로맨틱한 분위기를 선사하며, 서울의 야경을 즐기기에 최고의 장소로 손꼽힙니다.",
            },
            {
              title: "세빛둥둥섬 투어",
              text: "세계 최초의 인공 부유섬인 세빛둥둥섬은 ‘가빛’, ‘채빛’, ‘솔빛’ 세 개의 섬으로 이루어진 복합 문화 공간입니다. 전시와 공연, 이벤트가 열리며, 레스토랑과 카페에서 한강을 바라보며 특별한 식사를 즐길 수 있습니다. 특히 밤이 되면 LED 조명이 섬 전체를 수놓아 서울의 대표적인 야경 명소로 손꼽히며, 요트와 보트 체험도 가능해 색다른 즐거움을 선사합니다.",
            },
          ],
          inclusions: [
            "한강 버스 탑승권",
            "전문 포토그래퍼 가이드",
            "인생샷 촬영 및 보정 서비스",
            "음료 및 간식 제공",
          ],
          exclusions: ["개인 카메라 장비", "식사 비용", "추가 액티비티 비용"],
        },
        4: {
          title: "LG 트윈스 프리미엄 야구 관람 투어",
          subtitle: "잠실야구장에서 즐기는 완벽한 야구 체험",
          location: "잠실야구장, 롯데월드타워",
          duration: "6시간",
          groupSize: "최대 25명",
          language: "한국어, 영어, 일본어",
          partnership: { primary: "LG 트윈스", secondary: "교촌치킨" },
          itinerary: [
            {
              time: "14:00",
              location: "잠실역 2번 출구",
              description: "투어 시작 및 야구 문화 소개",
            },
            {
              time: "15:00",
              location: "LG 트윈스 팬샵",
              description: "유니폼 착용 및 응원용품 준비",
            },
            {
              time: "18:00",
              location: "교촌치킨 프리미엄 박스석",
              description: "치킨&맥주와 함께 경기 관람",
            },
            {
              time: "20:00",
              location: "포토존",
              description: "경기장 배경 기념 스냅 사진 투어 ",
            },
          ],
          detailSections: [
            {
              title: "잠실 야구 경기",
              text: "서울의 대표적인 스포츠 명소, 잠실 야구 경기장은 LG 트윈스와 두산 베어스의 홈구장으로 국내 프로야구의 열기를 가장 가까이에서 느낄 수 있는 곳입니다. 3만 명 이상을 수용할 수 있는 대규모 구장에서 응원가와 응원봉이 만들어내는 독특한 분위기는 한국 프로야구만의 매력을 전합니다. 특히 LG 트윈스 팬들의 열정적인 응원전은 잠실 야구장을 찾는 이들에게 잊지 못할 경험을 선사합니다.",
            },
            {
              title: "LG트윈스",
              text: "서울에서 열린 LG 트윈스 야구 경기에서 외국인 관광객들이 열정적으로 응원하며 현장의 분위기를 즐기고 있습니다. 치어리더식 응원 문화와 함께하는 한국 프로야구는 이색적인 관광 코스로, 국제 관광객들에게 특별한 추억을 선사합니다.",
            },
          ],
          inclusions: [
            "야구 경기 프리미엄석 티켓",
            "치킨과 맥주 세트",
            "LG 트윈스 응원용품",
            "전문 가이드",
          ],
          exclusions: ["추가 음식 및 음료", "개인 기념품 구매", "교통비"],
        },
        5: {
          title: "K-뷰티 & 웰니스 프리미엄 투어",
          subtitle: "한국 최고의 뷰티 기술과 전통 웰니스의 완벽한 조합",
          location: "강남구 (압구정-청담-신사동 일대)",
          duration: "6시간",
          groupSize: "최대 12명",
          language: "한국어, 영어, 중국어,일본어",
          partnership: { primary: "올리브영", secondary: "강남 피부과 협회" },
          itinerary: [
            {
              time: "10:00",
              location: "퍼스널컬러 진단",
              description: "퍼스널 컬러 진단 + 맞춤형 메이크업 추천",
            },
            {
              time: "11:00",
              location: "압구정 프리미엄 피부과",
              description: "피부 분석 + 하이드라페이셜 케어 (30분)",
            },
            {
              time: "13:00",
              location: "청담동 한정식 레스토랑",
              description: "피부에 좋은 한방 약선 점심",
            },
            {
              time: "14:30",
              location: "신사동 K-뷰티 체험관",
              description: "설화수, 후 등 브랜드별 맞춤 케어 체험",
            },
            {
              time: "15:30",
              location: "압구정 전통 한방 스파",
              description: "황토 찜질 + 아로마 마사지 (90분)",
            },
            {
              time: "17:30",
              location: "올리브영 VIP 쇼핑",
              description: "개인 맞춤 제품 추천 + 면세 쇼핑",
            },
          ],
          partnershipBenefits: [
            {
              icon: "Award",
              title: "프리미엄 피부 케어",
              description: "강남 1급 피부과 하이드라페이셜 + 피부 분석",
              value: "시술가 ₩15만원",
            },
            {
              icon: "Gift",
              title: "K-뷰티 굿즈백",
              description: "설화수, 후, 이니스프리 등 인기 브랜드 샘플 키트",
              value: "₩8만원 상당",
            },
            {
              icon: "Play",
              title: "한방 웰니스 스파",
              description: "황토 찜질방 + 전통 아로마 마사지 90분",
              value: "₩12만원 상당",
            },
          ],
          detailSections: [
            {
              title: "K-뷰티 퍼스널 컬러 진단 체험",
              text: "한국 뷰티 트렌드의 핵심, 퍼스널 컬러 진단을 통해 나만의 이미지에 가장 잘 어울리는 색상을 찾아보세요. 전문 컨설턴트가 피부 톤과 분위기에 맞는 컬러를 분석해주어, 메이크업과 패션 스타일링에 실질적인 도움을 받을 수 있습니다. 외국인 방문객에게는 특별히 한국 K-뷰티 문화를 직접 체험하고 자신만의 새로운 매력을 발견할 수 있는 특별한 시간이 됩니다.",
            },
            {
              title: "K-뷰티 in 올리브영",
              text: "K-뷰티에 관심 많은 외국인 관광객들을 위해 기획된 올리브영 쇼핑 체험 투어입니다. 단순한 매장 방문을 넘어, 트렌드를 가장 잘 아는 퍼스널 쇼퍼가 동행하여 맞춤형 쇼핑을 돕습니다. 글로벌 팬들에게 사랑받는 K-팝 아티스트 뷰티템, SNS에서 화제가 된 핫 아이템까지 현장에서 직접 추천받고 구매할 수 있습니다.",
            },
            {
              title: "한국 피부과",
              text: "첨단 장비와 전문 의료진으로 유명한 한국 피부과는 미용·피부 치료 분야에서 세계적으로 인정받고 있습니다. 외국인 방문객은 여드름·잡티 관리부터 레이저 시술, 스킨케어 프로그램까지 개인 맞춤형 진료를 통해 K-뷰티의 의료 서비스를 직접 경험할 수 있습니다. 안전하고 세심한 진료와 함께, 한국만의 뷰티·헬스케어 문화를 체험할 수 있는 특별한 기회입니다.",
            },
          ],
          inclusions: [
            "퍼스널 컬러 진단",
            "프리미엄 피부 관리",
            "한방 스파 체험",
            "K-뷰티 굿즈백",
            "전문 뷰티 가이드",
            "점심 식사",
          ],
          exclusions: ["추가 시술 비용", "개인 쇼핑 비용", "교통비"],
        },
        6: {
          title: "서울 전통 문화 투어",
          subtitle:
            "경복궁에서 한국의 왕실 문화를 느끼고, 인사동에서 다도로 전통의 멋을 체험한 뒤, 광장시장에서 현지 먹거리를 즐기는 특별한 하루",
          location: "서울 종로구 일대",
          duration: "4.5시간",
          groupSize: "최대 6명",
          language: "한국어, 영어, 중국어",
          partnership: { primary: "서울특별시", secondary: "하나투어" },
          itinerary: [
            {
              time: "10:00",
              location: "경복궁 입구",
              description: "한복 대여 후 경복궁 관람, 여행 스냅 촬영",
            },
            {
              time: "12:00",
              location: "전통 한정식 점심",
              description: "전통 한정식 레스토랑에서 점심 식사",
            },
            {
              time: "14:30",
              location: "인사동 다도 체험 & 전통 거리 산책",
              description:
                "전통 찻집에서 다도 체험 및 전통 공예품, 도장, 한지 기념품 구경",
            },
            {
              time: "17:00",
              location: "광장시장 전통 먹거리 투어",
              description: "빈대떡, 마약김밥, 육회 등 현지인 인기 먹거리 시식",
            },
            {
              time: "19:00",
              location: "청계천 야경 산책",
              description: "한강으로 이어지는 청계천 산책",
            },
          ],
          detailSections: [
            {
              title: "경복궁 여행스냅",
              text: "서울을 대표하는 궁궐, 경복궁에서 전문 사진작가와 함께 여행스냅을 촬영해보세요. 한복을 입고 고궁의 웅장한 전각과 고즈넉한 정원을 배경으로 특별한 순간을 기록할 수 있습니다. 전통과 현대가 어우러진 경복궁의 매력은 잊지 못할 여행의 추억이 됩니다.",
            },
            {
              title: "인사동 다도 체험",
              text: "서울 전통 거리 인사동의 고즈넉한 찻집에서 한국식 다도를 체험해보세요. 전문가의 안내와 함께 전통 차와 다과를 맛보며 한국 차 문화의 깊이를 느낄 수 있습니다.",
            },
            {
              title: "광장시장 먹거리 투어",
              text: "서울에서 가장 활기찬 전통시장 중 하나인 광장시장에서 한국의 대표 먹거리를 즐겨보세요. 바삭한 빈대떡, 마약김밥, 육회 등 현지인과 외국인 모두에게 사랑받는 다양한 길거리 음식을 맛볼 수 있습니다.",
            },
          ],
          inclusions: [
            "한복 대여",
            "경복궁 입장료",
            "다도 체험",
            "광장시장 음식 시식",
            "전문 가이드",
            "여행 스냅 사진",
          ],
          exclusions: ["점심 식사 비용", "개인 기념품 구매", "교통비"],
        },
      },
      offer: {
        expiresIn: "마감까지 남은 시간",
        limitedTime: "⏳ 한정 시간 특가",
        doNotShowToday: "오늘 하루 보지 않기",
        grabDeal: "예약하기",
        grabbed: "확정됨",
        dealGrabbed: "딜이 확정되었습니다!",
        priceSecured: "현재 가격이 잠시 동안 보장됩니다",
        urgencyText: "서두르세요! {{minutes}}분 {{seconds}}초 뒤 종료",
      },
      booking: {
        bookNow: "지금 예약",
        reviews: "개의 리뷰",
        discount: "할인",
      },
      tabs: {
        overview: "일정",
        details: "상세정보",
        reviews: "리뷰",
      },
      overview: {
        itinerary: "일정",
        noItinerary: "일정 정보가 없습니다",
        included: "포함 사항",
        notIncluded: "불포함 사항",
      },
      details: {
        noDetails: "상세 정보가 없습니다",
        specialFeatures: "특별 혜택",
        partnershipBenefits: "제휴 혜택",
      },
      reviews: {
        noReviews: "리뷰가 없습니다",
        verifiedPurchase: "검증된 구매",
      },
      notFound: {
        title: "투어를 찾을 수 없습니다",
        description: "요청하신 투어 정보를 불러올 수 없습니다.",
      },
    },
    common: {
      community: {
        info_reviews_label: "정보 & 후기",
        info_reviews_desc: "여행 정보와 후기를 공유하는 공간",
        labels: {
          notice: "공지",
          editors_pick: "Klover's Pick",
          popular_destinations: "인기 여행지",
        },
        search_placeholder: "검색...",
        live_areas: {
          gangnam: "강남",
          gwanghwamun: "광화문",
          myeongdong: "명동",
          seoul_station: "서울역",
          itaewon: "이태원",
          jamsil: "잠실",
          jongno: "종로",
          hongdae: "홍대",
        },
        info: {
          posts: {
            10001: {
              title: "✈️ 서울 도심공항터미널 스마트 이용 가이드",
              content:
                "공항 가기 전 도심에서 체크인, 수하물 위탁, 출국 심사를 빠르게! 서울역/B2, 광명역 도심공항터미널 이용 정보와 운영시간, 유의사항을 안내합니다.",
            },
            10002: {
              title: "🎆 2025 서울세계불꽃축제 개최 안내",
              content:
                "2025년 10월 4일(토) 19:30~21:00, 여의도 한강공원 일대에서 열리는 서울세계불꽃축제 주요 정보와 교통, 관람 포인트를 확인하세요.",
            },
            10003: {
              title: "🌟 서울 지하철 2025년 추석 단축 운영",
              content:
                "추석 연휴 기간 서울지하철 1~9호선 막차가 오후 11시로 단축 운행됩니다. 자세한 시간표는 서울교통공사 홈페이지 참고.",
            },
            1001: {
              title: "케이팝 데몬 헌터스 – 3일 서울 여행 코스",
              content:
                "웹툰 '케이팝 데몬 헌터스' 배경 명소를 3일에 걸쳐 둘러보는 성지순례 루트. 강남·삼성, 한강·홍대, 광화문·익선동·낙산 일정과 꿀팁 제공.",
            },
            1002: {
              title:
                "K-Pop 아이돌들처럼 먹어보자! 🎤✨ 서울 맛집 완전정복 가이드",
              content:
                "좋아하는 아이돌과 같은 공간에서 같은 메뉴를... 상상만 해도 설레지 않나요? 에디터가 직접 발품 팔아 모은 아이돌들의 진짜 단골집 리스트를 공개합니다! 📍\n\nTV 속 그 맛집들\n🥖 Pachamama Bakery | 용산 HYBE 근처\nLE SSERAFIM이 더 매니저에서 극찬한 그 베이커리! 소금빵과 피스타치오 슬라이스는 필수 주문 아이템. HYBE 구경 후 들르면 일석이조 ✨\n\n🥩 금돼지식당 | 미슐랭 빕 구르망\nZB1, BTS, EXO가 단골인 데에는 이유가 있었어요. 바질쌈에 두툼한 삼겹살 올려 먹으면... 말이 필요 없죠 🤤\n\nSNS 화제의 그 곳들\n🍈 아소또 | 을지로\naespa 윈터가 버블로 인증한 메론빵 전문점! 2024년 오픈 후 지금까지 인기 지속 중. 바닐라크림 메론빵 강력 추천 💛\n\n🌿 카페 수목금토 | 강남\nSEVENTEEN 민규의 무지개 계단 인스타 포토존으로 유명세. 도심 속 자연 친화적 분위기에서 힐링 타임 가져보세요 🌈\n\n🍦 요아정 | 전국 매장\nRIIZE 성찬의 조합 레시피로 유명해진 요거트 아이스크림. 골드망고+허니콤+샤인머스캣 조합은 진짜 맛있어요 (에디터도 인정!)\n\n🍩 피르마 베이커리 | 안국\nTWICE 사나의 슈퍼 얼그레이 도넛. 달지 않은 진한 얼그레이 크림이 포인트! (포장만 가능)\n\n팬들의 성지 순례 필수 코스\n🐑 Lamb NIKUYA | 둔촌2호점\nStray Kids, DAY6 멤버들 사인과 포스트잇이 가득! V-Live 촬영지로도 유명\n\n🥩 곱창파는고기집\nSEVENTEEN 고잉 세븐틴 촬영지. 캐럿세트 메뉴와 생일 이벤트까지! 진짜 팬이라면 필수 방문 📸\n\n🎯수현 에디터의 Tips!\n\n강남라인: 수목금토 → Sunday Burger Club → 아가젤라또\n\n성수라인: 카페 파르벤 → 성수다락\n\n용산라인: Pachamama → 아소또\n\n평일 오후에 방문하면 한적하게 즐길 수 있어요. 아이돌들과 같은 메뉴 주문하고 #아이돌맛집투어 해시태그 잊지 마세요! 💜",
            },
          },
        },
      },
      // Home.jsx
      place1: "명동",
      place2: "광화문",
      place3: "이태원",
      place4: "잠실",
      "features.title1": "AI 페르소나 분석",
      "features.title2": "맞춤 코스 추천",
      "features.title3": "K-Pop 플레이리스트",
      "features.title4": "AI 도슨트",
      "features.desc1": "5가지 질문으로 당신만의 여행 스타일 발견",
      "features.desc2": "AI가 실시간으로 생성하는 완벽한 여행 루트",
      "features.desc3": "여행지별 분위기에 맞는 나만의 K-Pop 음악",
      "features.desc4": "RAG 기반 챗봇으로 현지 문화 깊이 체험",
      "stats.label1": "맞춤 여행 생성",
      "stats.label2": "만족도",
      "stats.label3": "AI 지원",
      "stats.label4": "평균 평점",
      "main.badge": "AI 맞춤형 여행 플래너",
      // "nav.features": "기능",
      // "nav.howto": "사용법",
      // "nav.community": "커뮤니티",
      "login.welcome": " 환영합니다!",
      "login.logout": "로그아웃",
      "login.login": "로그인",
      "main.title.k_travel": "여행",
      "main.title.connector": "을",
      "main.title.ai_creates": "AI가 만들어드려요",
      "main.subtitle":
        "5가지 질문으로 여행 스타일을 분석하고, K-Pop과 함께하는 완벽한 코스를 추천받으세요. 복잡한 계획은 AI에게, 당신은 설렘만 준비하세요.",
      "main.start.persona": "페르소나 분석 시작",
      "main.start.start": "시작하기",
      // "now.playing": "Now Playing",
      // "main.recommend.spot": "추천 스팟",
      // "main.recommend.spot.name": "홍대 K-Pop 스퀘어",
      "main.title.ai_action": "AI가 만드는",
      "main.title.experience": "특별한 경험",
      "main.subtitle.ai_action":
        "혁신적인 AI 기술로 당신만의 완벽한 한국 여행을 설계합니다",
      "main.more.view": "자세히 보기",
      "steps.title": "간단한 3단계로",
      "steps.completion": "완성",
      "steps.step1.title": "페르소나 분석",
      "steps.step1.description": "5가지 질문으로 여행 스타일 분석",
      "steps.step2.title": "AI 맞춤 추천",
      "steps.step2.description": "분석 결과 기반 완벽한 코스 생성",
      "steps.step3.title": "자유로운 편집",
      "steps.step3.description": "드래그 & 드롭으로 나만의 플랜 완성",
      "popular.title": "실시간 인기",
      "popular.highlight": "여행지",
      "popular.action.join": "를",
      "popular.action": "만나보세요",
      "popular.description": "다른 여행자들이 선택한 인기 코스를 확인해보세요",
      "footer.slogan": "AI와 함께하는 완벽한 한국 여행을 경험해보세요",
      "footer.privacy_policy": "개인정보처리방침",
      "footer.terms_of_service": "이용약관",
      "footer.customer_center": "고객센터",
      "footer.partnership": "파트너십",
      "footer.copyright": "© 2025 Klover. All rights reserved.",
      "modal.welcome": "Klover에 오신 것을 환영합니다",
      "modal.instruction": "AI 맞춤 여행 플래너를 시작하려면 로그인하세요",
      "modal.continue_google": "Google로 계속하기",
      "modal.continue_microsoft": "Microsoft로 계속하기",
      "modal.disclaimer.prefix": "계속 진행하시면",
      "modal.disclaimer.terms": "이용약관",
      "modal.disclaimer.and": "과",
      "modal.disclaimer.privacy": "개인정보처리방침",
      "modal.disclaimer.suffix": "에 동의하는 것으로 간주됩니다.",
      "cta.title": "이제, 당신의 완벽한 여행을 시작할 시간",
      "cta.start": "5가지 질문으로 시작하기",

      // Home.jsx 추가 번역 키들
      "home.persona.title": "당신만의 여행 페르소나를 발견하세요",
      "home.persona.desc":
        "5가지 질문으로 여행 스타일을 분석하고, AI가 맞춤형 코스를 추천해드립니다.",
      "home.persona.cta": "페르소나 분석 시작하기",
      "home.persona.card1.title": "여행 스타일은?",
      "home.persona.card1.pill1": "모험 추구형",
      "home.persona.card1.pill2": "여유 만끽형",
      "home.persona.card1.pill3": "계획적 탐방형",
      "home.persona.card2.title": "관심 있는 활동은?",
      "home.persona.card2.pill1": "문화 체험",
      "home.persona.card2.pill2": "음식 탐방",
      "home.persona.card2.pill3": "쇼핑",
      "home.persona.card3.title": "선호하는 분위기는?",
      "home.persona.card3.pill1": "트렌디한",
      "home.persona.card3.pill2": "전통적인",
      "home.persona.card3.pill3": "자연친화적",

      "home.ai_reco.title": "AI가 만드는 완벽한 여행 코스",
      "home.ai_reco.desc":
        "개인 맞춤 분석을 바탕으로 최적의 여행 루트를 실시간으로 생성합니다.",
      "home.ai_reco.tag1": "실시간 생성",
      "home.ai_reco.tag2": "맞춤형 추천",
      "home.ai_reco.tag3": "최적 경로",
      "home.ai_reco.tag4": "시간 효율",
      "home.ai_reco.tag5": "현지 정보",

      "home.editing.title": "자유롭게 편집하고 완성하세요",
      "home.editing.desc":
        "드래그 앤 드롭으로 여행 일정을 자유롭게 수정하고 나만의 완벽한 플랜을 만들어보세요.",

      "home.map.preview_label": "맞춤 여행 루트",

      "home.itinerary.title": "여행 일정",
      "home.itinerary.item1": "경복궁 관람",
      "home.itinerary.item2": "북촌 한옥마을",
      "home.itinerary.item3": "인사동 문화거리",
      "home.itinerary.item4": "명동 쇼핑",

      "home.controls.undo": "실행취소",
      "home.controls.save": "저장하기",
    },
    QuickTranslator: {
      all: "전체",
      greeting: "인사",
      location: "위치",
      price: "가격",
      help: "도움",
      transport: "교통",
      food: "음식",
      status: "상태",
      payment: "결제",
      menu: "메뉴",
      language_detection_error: "언어 감지 중 오류가 발생했습니다.",
      speech_recognition_error: "음성 인식 오류",
      real_time_translator: "실시간 번역기",
      stop_listening: "음성 인식 중지",
      processing_listening: "음성 인식 처리 중...",
      start_listening: "음성 인식 시작",
      listening: "음성을 듣고 있습니다... 말씀해주세요",
      processing_text_conversion: "음성을 텍스트로 변환하고 있습니다...",
      input_text: "번역할 텍스트를 입력하세요... (언어가 자동으로 감지됩니다)",
      detecting_language: "언어를 감지하고 있습니다...",
      detected_language: "감지된 언어",
      translating: "번역 중...",
      translate: "번역하기",
      translation_results: "번역 결과",
      listen_to_audio: "음성으로 듣기",
      frequently_used_expressions: "자주 쓰는 표현",
      phrases1: "Hello",
      phrases2: "Thank you",
      phrases3: "Sorry",
      phrases4: "Where is the bathroom?",
      phrases5: "How much is it?",
      phrases6: "Help me",
      phrases7: "Where is the subway station?",
      phrases8: "It's delicious",
      phrases9: "I've arrived",
      phrases10: "Can I pay by card?",
      phrases11: "Please give me a receipt",
      phrases12: "Please give me the menu",
      phrases13: "Please give me water",
      phrases14: "Please give me the bill",
      phrases15: "Please wrap it up",
    },
    Navigation: {
      persona_analysis: "페르소나 분석",
      result_dashboard: "결과 대시보드",
      itinerary_planner: "여행 일정 계획",
      ai_docent: "AI 도슨트",
      community: "커뮤니티",
      tour: "여행상품",
      survival: "서바이벌",
      survival_kit: "서바이벌 키트",
      playlists: "플레이리스트",
      menu: "메뉴",
      personalized_travel_planning: "맞춤형 여행 계획",
      live_info: "실시간 정보",
      exchange_rate_krw: "환율 (원)",
      seoul_weather: "서울 날씨",
      temp: "온도",
      humidity: "습도",
      wind: "바람",
      refresh_data: "데이터 새로고침",
      expand: "펼치기",
      collapse: "접기",
      welcome_traveler: "여행자님, 환영합니다!",
      plan_your_trip_with_ai: "AI와 함께 여행을 계획하세요",
      log_out: "로그아웃",
      log_in: "로그인",
      mypage: "마이 페이지",
    },
    SurvivalKit: {
      // Hero 섹션
      hero_tagline: "여행자 필수 도구",
      hero_title: "서바이벌 키트",
      hero_subtitle:
        "한국 여행 중 필요한 모든 도구와 정보를 한 곳에서 만나보세요",

      // 섹션 설명
      section_vision_benefit: "이미지 텍스트 인식 및 번역",
      section_translator_benefit: "실시간 음성 및 텍스트 번역",
      section_culture_benefit: "한국 문화와 예절 가이드",

      vision_ocr: "비전 OCR",
      quick_translator: "빠른 통역",
      culture_guide: "한국 문화 가이드",
      // 문화 가이드 번역
      greeting: "인사 예절",
      greeting_content:
        "한국에서는 나이가 많은 사람에게 먼저 인사하고, 고개를 숙여 인사합니다.",
      greeting_extra:
        "보통 가벼운 목례만으로도 충분하며, 두 손으로 악수하면 더 공손하게 보입니다.",
      greeting_modal_title: "한국의 존댓말과 기본 인사 표현",
      greeting_modal_paragraphs:
        "한국에는 존댓말과 반말이 있어서 인사 표현도 상황에 따라 달라집니다.",
      greeting_modal_paragraphs_2:
        "친구끼리는 '안녕'이라고 하지만, 어른이나 처음 만난 사람에게는 반드시 '안녕하세요'라고 해야 예의입니다.",
      greeting_modal_list_1: "안녕하세요 (일상 존댓말)",
      greeting_modal_list_2: "안녕하십니까 (격식)",
      greeting_modal_list_3: "안녕 (친한 사이, 반말)",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해",
      greeting_modal_link_1: "한국 사람들에게 인사하는 방법",

      meal: "식사 예절",
      meal_content:
        "어른이 먼저 수저를 들고, 밥그릇을 들고 먹지 않습니다. 술은 양손으로 받습니다.",
      meal_extra:
        "밥을 다 먹은 후에는 젓가락을 그릇 위에 가지런히 올려두는 것이 예의입니다.",
      meal_modal_title: "한국의 식사 예절",
      meal_modal_paragraphs:
        "한국에서 식사는 단순히 음식을 먹는 것이 아니라 상대방을 존중하는 중요한 자리입니다.",
      meal_modal_paragraphs_2:
        "식사 전에는 '잘 먹겠습니다', 식사 후에는 '잘 먹었습니다'라고 인사하며, 이는 준비한 사람과 함께한 사람 모두에 대한 존중을 의미합니다.",
      meal_modal_list_1: "자리에 앉을 때는 연장자나 손님이 먼저 앉습니다.",
      meal_modal_list_2: "젓가락을 밥그릇에 꽂지 않습니다.",
      meal_modal_list_3: "술을 마실 때는 고개를 살짝 돌려서 마십니다.",
      meal_modal_list_4:
        "큰 소리로 씹거나 젓가락으로 사람을 가리키는 것은 실례입니다.",
      meal_modal_list_5: "그릇은 식탁 위에 놓고 먹습니다.",
      meal_modal_link_1: "한국인의 식사 예절",

      transportation: "대중교통",
      transportation_content:
        "지하철에서는 노약자석을 양보하고, 큰 소리로 통화하지 않습니다.",
      transportation_extra:
        "혼잡한 시간대에는 가방을 앞으로 메는 것이 배려하는 태도입니다.",
      transportation_modal_title: "한국의 대중교통",
      transportation_modal_paragraphs:
        "한국의 지하철과 버스는 매우 편리하지만, 좌석과 행동 예절을 지키는 것이 중요합니다.",
      transportation_modal_paragraphs_2:
        "특히 노약자석과 임산부 배려석은 외국인들이 헷갈리기 쉬운데, 비어 있어도 앉지 않는 것이 일반적인 문화입니다.",
      transportation_modal_list_1:
        "노약자석은 노인, 장애인, 임산부 전용 좌석으로, 젊은 사람은 사용하지 않습니다.",
      transportation_modal_list_2:
        "임산부 배려석(핑크좌석)은 임산부가 언제든 사용할 수 있도록 비워둡니다.",
      transportation_modal_list_3:
        "대중교통 내에서는 큰 소리로 통화하지 않습니다.",
      transportation_modal_list_4:
        "가방은 앞으로 메거나 내려놓아 다른 승객을 배려합니다.",
      transportation_modal_list_5:
        "탑승 시에는 하차 승객이 먼저 내린 후 차례대로 승차합니다.",
      transportation_modal_link_1: "한국 대중교통 이용",
      transportation_modal_link_2: "서울에서 지하철 이용하기",

      tip: "팁 문화",
      tip_content:
        "한국은 팁 문화가 없습니다. 서비스 요금이 이미 포함되어 있어요.",
      tip_extra:
        "관광지 일부 호텔은 예외적으로 소액의 팁을 주기도 하지만 필수는 아닙니다.",
      tip_modal_title: "한국의 팁 문화",
      tip_modal_paragraphs:
        "한국의 팁 문화는 서양과 달리 거의 존재하지 않습니다.",
      tip_modal_list_1: "식당·카페: 팁 불필요",
      tip_modal_list_2: "택시: 정해진 요금만 지불",
      tip_modal_list_3: "미용실·마사지 등 서비스업: 팁 문화 없음",

      footwear: "신발 벗기",
      footwear_content: "한국 가정이나 일부 식당에서는 신발을 벗고 들어갑니다.",
      footwear_extra:
        "신발장은 보통 입구에 있으며, 실내화가 준비되어 있는 경우가 많습니다.",
      footwear_modal_title: "한국의 신발 벗기 문화",
      footwear_modal_paragraphs:
        "한국에서는 집에 들어갈 때 신발을 벗는 것이 당연한 문화로 자리 잡고 있습니다.",
      footwear_modal_paragraphs_2:
        "이는 실내를 청결하게 유지하고 가족의 건강을 지키기 위한 전통적인 습관입니다.",
      footwear_modal_paragraphs_3:
        "실내에서는 신발 대신 슬리퍼를 신거나 양말만 신고 생활하는 경우가 많습니다.",
      footwear_modal_list_1: "가정집: 현관에서 신발을 벗고 들어감",
      footwear_modal_list_2:
        "전통 한식당·한옥: 좌식 구조 때문에 신발 벗는 경우 많음.",

      gift: "선물 예절",
      gift_content:
        "선물을 받을 때는 양손으로 받고, 바로 뜯지 않는 것이 예의입니다.",
      gift_extra:
        "특히 어른이나 상사에게는 술, 건강식품, 차 등이 무난한 선물입니다.",
      gift_modal_title: "한국의 선물 예절",
      gift_modal_paragraphs:
        "한국에서 선물은 단순한 물건이 아니라 관계와 존중의 의미를 담습니다.",
      gift_modal_paragraphs_2:
        "선물을 줄 때와 받을 때는 반드시 양손을 사용하는 것이 예의입니다.",
      gift_modal_list_1: "양손으로 주고받기",
      gift_modal_list_2:
        "명절·집들이·감사 인사 등 다양한 상황에서 선물 주고받음",
      modal_close: "닫기",
    },
    VisionOCR: {
      image_upload: "이미지 업로드",
      image_support: "JPG, PNG 파일을 지원합니다",
      image_preview: "이미지 미리보기",
      image_preview_desc: "분석할 이미지를 확인하세요",
      cancel: "취소",
      analyzing: "분석 중...",
      analyze_start: "분석 시작",
      analyze_result: "분석 결과",
      analyze_result_desc: "텍스트를 클릭해보세요",
      analyze_result_image: "분석된 이미지",
      menu_info: "메뉴 정보",
      ai_generating_answer: "AI가 답변을 생성하고 있습니다...",
      ai_analyze_result: "AI 분석 결과",
      ai_generated_answer_desc: "이 정보는 AI가 생성한 참고용 답변입니다",
      source_info: "출처: 한식진흥원, '한식메뉴 외국어표기 길라잡이 800선'",
      menu_name: "메뉴명",
      description: "설명",
      source_info_2: "출처: 한국국제교류재단 한국음식정보",
      food_name: "음식명",
      translating: "번역 중...",
      source_info_3:
        "출처: AI Hub (한국지능정보사회진흥원), 관광 음식메뉴판 데이터",
      main_ingredients: "주요 성분",
      allergy_info: "알러지 정보",
      menu_select: "메뉴를 선택해주세요",
      menu_select_desc: "이미지에서 메뉴 텍스트를 터치하면",
      menu_select_desc_2: "AI가 분석한 상세한 메뉴 정보",
      menu_select_desc_3: "가",
      menu_select_desc_4: "표시됩니다",
      new_start: "새로 시작하기",
      // 파일 선택 관련 번역
      file_select: "파일 선택",
      no_file_selected: "선택된 파일 없음",
      // 안내 문구
      disclaimer:
        "※ 제공되는 정보는 참고용입니다. 성분, 알러지 등 메뉴에 대한 정확한 정보는 매장에 문의해 주세요!",
      file_selected: "선택된 파일",
    },
    cultureGuide: {
      greeting: "인사 예절",
      greeting_content:
        "한국에서는 나이가 많은 사람에게 먼저 인사하고, 고개를 숙여 인사합니다.",
      greeting_extra:
        "보통 가벼운 목례만으로도 충분하며, 두 손으로 악수하면 더 공손하게 보입니다.",
      greeting_modal_title: "한국의 존댓말과 기본 인사 표현",
      greeting_modal_paragraphs:
        "한국에는 존댓말과 반말이 있어서 인사 표현도 상황에 따라 달라집니다.",
      greeting_modal_paragraphs_2:
        "친구끼리는 '안녕'이라고 하지만, 어른이나 처음 만난 사람에게는 반드시 '안녕하세요'라고 해야 예의입니다.",
      greeting_modal_list_1: "안녕하세요 (일상 존댓말)",
      greeting_modal_list_2: "안녕하십니까 (격식)",
      greeting_modal_list_3: "안녕 (친한 사이, 반말)",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해",
      greeting_modal_link_1: "한국 사람들에게 인사하는 방법",
      meal: "식사 예절",
      meal_content:
        "어른이 먼저 수저를 들고, 밥그릇을 들고 먹지 않습니다. 술은 양손으로 받습니다.",
      meal_extra:
        "밥을 다 먹은 후에는 젓가락을 그릇 위에 가지런히 올려두는 것이 예의입니다.",
      meal_modal_title: "한국의 식사 예절",
      meal_modal_paragraphs:
        "한국에서 식사는 단순히 음식을 먹는 것이 아니라 상대방을 존중하는 중요한 자리입니다.",
      meal_modal_paragraphs_2:
        "식사 전에는 '잘 먹겠습니다', 식사 후에는 '잘 먹었습니다'라고 인사하며, 이는 준비한 사람과 함께한 사람 모두에 대한 존중을 의미합니다.",
      meal_modal_list_1: "자리에 앉을 때는 연장자나 손님이 먼저 앉습니다.",
      meal_modal_list_2: "젓가락을 밥그릇에 꽂지 않습니다.",
      meal_modal_list_3: "술을 마실 때는 고개를 살짝 돌려서 마십니다.",
      meal_modal_list_4:
        "큰 소리로 씹거나 젓가락으로 사람을 가리키는 것은 실례입니다.",
      meal_modal_list_5: "그릇은 식탁 위에 놓고 먹습니다.",
      meal_modal_link_1: "한국인의 식사 예절",
      transportation: "대중교통",
      transportation_content:
        "지하철에서는 노약자석을 양보하고, 큰 소리로 통화하지 않습니다.",
      transportation_extra:
        "혼잡한 시간대에는 가방을 앞으로 메는 것이 배려하는 태도입니다.",
      transportation_modal_title: "한국의 대중교통",
      transportation_modal_paragraphs:
        "한국의 지하철과 버스는 매우 편리하지만, 좌석과 행동 예절을 지키는 것이 중요합니다.",
      transportation_modal_paragraphs_2:
        "특히 노약자석과 임산부 배려석은 외국인들이 헷갈리기 쉬운데, 비어 있어도 앉지 않는 것이 일반적인 문화입니다.",
      transportation_modal_list_1:
        "노약자석은 노인, 장애인, 임산부 전용 좌석으로, 젊은 사람은 사용하지 않습니다.",
      transportation_modal_list_2:
        "임산부 배려석(핑크좌석)은 임산부가 언제든 사용할 수 있도록 비워둡니다.",
      transportation_modal_list_3:
        "대중교통 내에서는 큰 소리로 통화하지 않습니다.",
      transportation_modal_list_4:
        "가방은 앞으로 메거나 내려놓아 다른 승객을 배려합니다.",
      transportation_modal_list_5:
        "탑승 시에는 하차 승객이 먼저 내린 후 차례대로 승차합니다.",
      transportation_modal_link_1: "한국 대중교통 이용",
      transportation_modal_link_2: "서울에서 지하철 이용하기",
      tip: "팁 문화",
      tip_content:
        "한국은 팁 문화가 없습니다. 서비스 요금이 이미 포함되어 있어요.",
      tip_extra:
        "관광지 일부 호텔은 예외적으로 소액의 팁을 주기도 하지만 필수는 아닙니다.",
      tip_modal_title: "한국의 팁 문화",
      tip_modal_paragraphs:
        "한국의 팁 문화는 서양과 달리 거의 존재하지 않습니다.",
      tip_modal_list_1: "식당·카페: 팁 불필요",
      tip_modal_list_2: "택시: 정해진 요금만 지불",
      tip_modal_list_3: "미용실·마사지 등 서비스업: 팁 문화 없음",
      footwear: "신발 벗기",
      footwear_content: "한국 가정이나 일부 식당에서는 신발을 벗고 들어갑니다.",
      footwear_extra:
        "신발장은 보통 입구에 있으며, 실내화가 준비되어 있는 경우가 많습니다.",
      footwear_modal_title: "한국의 신발 벗기 문화",
      footwear_modal_paragraphs:
        "한국에서는 집에 들어갈 때 신발을 벗는 것이 당연한 문화로 자리 잡고 있습니다.",
      footwear_modal_paragraphs_2:
        "이는 실내를 청결하게 유지하고 가족의 건강을 지키기 위한 전통적인 습관입니다.",
      footwear_modal_paragraphs_3:
        "실내에서는 신발 대신 슬리퍼를 신거나 양말만 신고 생활하는 경우가 많습니다.",
      footwear_modal_list_1: "가정집: 현관에서 신발을 벗고 들어감",
      footwear_modal_list_2:
        "전통 한식당·한옥: 좌식 구조 때문에 신발 벗는 경우 많음.",
      gift: "선물 예절",
      gift_content:
        "선물을 받을 때는 양손으로 받고, 바로 뜯지 않는 것이 예의입니다.",
      gift_extra:
        "특히 어른이나 상사에게는 술, 건강식품, 차 등이 무난한 선물입니다.",
      gift_modal_title: "한국의 선물 예절",
      gift_modal_paragraphs:
        "한국에서 선물은 단순한 물건이 아니라 관계와 존중의 의미를 담습니다.",
      gift_modal_paragraphs_2:
        "선물을 줄 때와 받을 때는 반드시 양손을 사용하는 것이 예의입니다.",
      gift_modal_list_1: "양손으로 주고받기",
      gift_modal_list_2:
        "명절·집들이·감사 인사 등 다양한 상황에서 선물 주고받음",
    },
    playlists: {
      themes1: "도시여행",
      themes1_desc: "활기찬 도심 탐험을 위한 에너지 넘치는 K-pop",
      themes2: "여름 바캉스",
      themes2_desc: "시원한 바다와 따뜻한 햇살을 느낄 수 있는 청량한 음악",
      themes3: "야시장",
      themes3_desc: "화려한 네온사인 아래 흥겨운 밤거리 분위기",
      themes4: "차분한 여행",
      themes4_desc: "마음을 편안하게 하는 잔잔하고 감성적인 멜로디",
      themes5: "운동/워크아웃",
      themes5_desc: "강렬한 비트로 운동 효과를 극대화하는 파워풀한 음악",
      themes6: "카페/독서",
      themes6_desc: "집중력을 높이는 차분하고 감각적인 어쿠스틱 사운드",
      kpop_artists1: "4세대 걸그룹",
      kpop_artists2: "4세대 보이그룹",
      kpop_artists3: "3세대 레전드",
      kpop_artists4: "솔로 아티스트",
      mock_playlists1: "서울 도시 바이브",
      mock_playlists1_desc: "서울 도심 여행할 때 듣기 좋은 어반 K-pop",
      mock_playlists2: "여름 바람",
      mock_playlists2_desc: "청량한 여름 바캉스 K-pop",
      play: "재생",
      title: "K-pop 여행 플레이리스트",
      description:
        "Spotify에 로그인하고 AI가 만든 플레이리스트를 생성하세요. 지금 바로 경험해보세요! ✨",
      login: "Spotify 로그인",
      my_playlist: "내 플레이리스트",
      playlist_preview: "플레이리스트 미리보기",
      your_playlist: "AI가 만든 당신만의 특별한 플레이리스트",
      make_playlist: "Spotify에 로그인한 후 당신만의 플레이리스트를 만드세요",
      preview: "미리보기",
      create_playlist: "첫 번째 플레이리스트 만들기",
      create_playlist_description:
        "AI가 당신을 위해 완벽한 K-pop 플레이리스트를 생성합니다",
      start_now: "지금 시작하기",
      create_new_playlist: "새 플레이리스트 만들기",
      create_new_playlist_description:
        "다른 테마나 아티스트로 새로운 플레이리스트를 만드세요",
      featured_youtube_mix: "추천 YouTube 믹스",
      latest_k_pop_travel_playlists:
        "당신의 여행을 위해 엄선된 최신 K-pop 여행 플레이리스트",
      view_full_playlist: "전체 플레이리스트 보기",
      create_your_own_playlist: "나만의 플레이리스트 만들기",
      create_your_own_playlist_description:
        "AI가 당신의 취향과 여행 테마에 맞는 완벽한 K-pop 플레이리스트를 생성합니다. 수천 곡의 데이터베이스에서 최적의 조합을 찾아 Spotify에 바로 저장하세요.",
      ai_custom_recommend: "AI 맞춤 추천",
      unlimited_creation: "무제한 생성",
      spotify_auto_save: "Spotify 자동 저장",
    },
    DocentMantine: {
      title: "AI 도슨트",
      subtitle: "실시간 위치 기반 가이드",
      aiDocent: "AI 도슨트",
      stopVoice: "음성 중지",
      current: "현재 위치",
      directions: "길찾기",
      chatbot: "관광 챗봇",
      askQuestion: "궁금한 것을 물어보세요",
      send: "전송",
      examples: {
        title: "예시 질문:",
        items: [
          "케이팝 데몬 헌터스 촬영지",
          "명동 맛집 추천",
          "북촌한옥마을 정보",
        ],
      },
      chatbotPlaceholder: "궁금한 것을 물어보세요...",
      chatbotInitialMessage:
        "안녕하세요! 저는 당신의 AI 여행 도슨트입니다. 궁금한 장소나 여행 정보를 물어보세요. 사진을 보내주시면 그 장소에 대한 자세한 설명도 드릴 수 있어요!",
      imageQueryText: "이 장소에 대해 알려주세요",
      voiceRecStart: "음성 녹음을 시작합니다...",
      voiceRecResult: "음성 인식 결과:",
      voiceRecStop: "음성 녹음을 중지합니다.",
      errorReply:
        "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      filePick: "파일",
      categories: {
        all: "전체",
        museum: "미술관&박물관",
        palace: "고궁",
        landmark: "랜드마크",
        historic: "역사적 장소",
      },
      allTourismSpots: "전체 관광지",
      detailedInfo: "상세 정보",
      tourismList: "관광지 목록",
      locationTracking: "위치 추적",
      location: "위치",
      voiceGuide: "음성 안내",
      tourDetection: {
        message:
          "🎯 투어 관련 질문이시군요! 전문 가이드 투어 서비스와 맞춤 코스 추천은 투어 페이지에서 확인하실 수 있습니다.",
        buttonText: "🎯 투어 서비스 페이지로 이동",
      },
      viewDetails: "📝 상세 정보 보기",
      selectPlace: "장소를 선택하세요",
    },
    persona: {
      choice: "선택",
      checking_login_status: "로그인 상태를 확인하고 있습니다...",
      login_required: "로그인이 필요합니다",
      login_required_description:
        "페르소나 분성 기능을 사용하려면 Google 또는 Microsoft 계정으로 로그인해주세요.",
      google_login: "Google로 로그인",
      microsoft_login: "Microsoft로 로그인",
      loading_questions: "질문을 불러오고 있습니다...",
      loading_questions_failed: "질문 로드 실패",
      retry: "다시 시도",
      empty_questions: "질문 목록이 비어 있습니다",
      empty_questions_description:
        "백엔드가 실행 중인지, 질문 데이터가 정상적으로 반환되는지 확인해주세요.",
      refresh: "새로고침",
      your_ai_travel_persona: "당신의 AI 여행 페르소나",
      your_ai_travel_persona_description:
        "몇 가지 질문에 답하면 AI가 당신의 여행 스타일에 맞는 코스를 추천해드릴게요.",
      previous: "이전",
      next: "다음",
      analyzing: "분석 중...",
      check_result: "결과 확인하기",
      // --- [추가 시작] 페르소나 질문 번역 ---
      questions: {
        rvit: {
          title: "한국 방문 횟수가 어떻게 되시나요?",
          options: {
            v1: {
              label: "처음이에요",
              description: "이번이 첫 한국 여행입니다.",
            },
            v2: {
              label: "2번째 방문",
              description: "한 번 와본 경험이 있습니다.",
            },
            v3: { label: "3번째 방문", description: "이제는 조금 익숙합니다." },
            v4plus: {
              label: "4번 이상",
              description: "자주 방문하는 편입니다.",
            },
          },
        },
        q1_purpose: {
          title: "이번 여행의 주된 목적은 무엇인가요?",
          options: {
            leisure: {
              label: "휴가/여가",
              description: "개인적인 휴식과 즐거움을 위해 방문합니다.",
            },
            friends: {
              label: "친구/가족 방문",
              description: "가까운 사람들을 만나러 왔습니다.",
            },
          },
        },
        r19hap: {
          title: "얼마나 머무를 예정이신가요?",
          options: {
            h1: {
              label: "1~3일",
              description: "최고급 시설과 서비스를 선호합니다.",
            },
            h2: {
              label: "4~10일",
              description: "합리적인 가격의 깔끔한 호텔을 선호합니다.",
            },
            h3: {
              label: "11~18일",
              description: "다른 여행객과 교류하는 것을 즐깁니다.",
            },
            h4: {
              label: "19~29일",
              description: "현지인처럼 살아보는 경험을 중시합니다.",
            },
            h5: {
              label: "30일 이상",
              description: "친구 집 등 다른 숙소를 이용합니다.",
            },
          },
        },
        cost: {
          title: "여행 예산은 어느 정도인가요? (1인기준)",
          options: {
            c1: {
              label: "140만원 미만",
              description: "알뜰하고 실속 있는 여행을 계획합니다.",
            },
            c2: {
              label: "140만원 ~ 280만원",
              description: "합리적인 소비를 선호합니다.",
            },
            c3: {
              label: "280만원 ~ 420만원",
              description: "다양한 경험에 투자하는 것을 즐깁니다.",
            },
            c4: {
              label: "420만원 ~ 560만원",
              description: "비용에 구애받지 않고 즐기는 편입니다.",
            },
            c5: {
              label: "560만원 이상",
              description: "럭셔리한 경험과 쇼핑을 선호합니다.",
            },
          },
        },
        considered: {
          title: "어떤 활동에 관심이 있으신가요?",
          options: {
            nature: {
              label: "자연",
              description: "산, 바다, 공원 등 자연 경관 즐기기",
            },
            heritage: {
              label: "문화유산",
              description: "고궁, 박물관, 역사 유적지 탐방",
            },
            food: {
              label: "미식",
              description: "맛집, 카페, 길거리 음식 탐방",
            },
            shopping: {
              label: "쇼핑",
              description: "패션, 뷰티, 기념품 등 쇼핑 즐기기",
            },
            relaxation: {
              label: "휴양",
              description: "스파, 해변, 조용한 곳에서 휴식",
            },
            tradition: {
              label: "전통문화",
              description: "한복, 전통공연, 한옥마을 체험",
            },
            museum: {
              label: "미술관/박물관",
              description: "예술 작품 및 전시 관람",
            },
            kpop: {
              label: "K-POP",
              description: "콘서트, 팬미팅, 성지순례 등",
            },
            arts: {
              label: "공연/예술",
              description: "뮤지컬, 연극, 전시회 관람",
            },
            festival: {
              label: "축제/이벤트",
              description: "지역 축제 및 계절 이벤트 참여",
            },
            nightlife: {
              label: "나이트라이프",
              description: "클럽, 바, 야시장 등 밤문화 즐기기",
            },
            themepark: {
              label: "테마파크",
              description: "놀이공원 및 테마파크 방문",
            },
            beauty: {
              label: "뷰티/미용",
              description: "헤어, 네일, 피부 관리 등 K-뷰티 체험",
            },
            medical: {
              label: "의료",
              description: "건강검진 등 의료 서비스 이용",
            },
            sports_view: {
              label: "스포츠 관람",
              description: "야구, 축구 등 프로 스포츠 경기 관람",
            },
            sports_play: {
              label: "스포츠 체험",
              description: "스키, 서핑 등 직접 스포츠 활동 참여",
            },
          },
        },
      },
      // --- [추가 끝] ---
    },
    dashboard: {
      edit_route: "경로 편집",
      detail: "상세",
      checking_login_status: "로그인 상태를 확인하고 있습니다...",
      login_required: "로그인이 필요합니다",
      google_login: "Google로 로그인",
      microsoft_login: "Microsoft로 로그인",
      no_analysis_result: "분석 결과가 없습니다",
      no_analysis_result_description:
        "최근 생성된 페르소나 분석 결과를 찾을 수 없어, 새로운 여행 계획을 다시 분석해보세요.",
      start_analysis: "분석 시작하기",
      // 섹션 1: 상단 (페르소나 결과 카드)
      login_required_description:
        "여행 페르소나 분석 및 추천 코스를 확인하려면 로그인해주세요.",
      your_ai_travel_persona: "당신의 AI 여행 페르소나",
      analyzing: "분석 중...",
      // 섹션 2: 중간 (여행 페르소나 분석 패널)
      travel_persona: "여행 페르소나",
      // 섹션 3: 하단 (추천 스팟, 추천 코스)
      custom_recommended_spots: "맞춤 추천 스팟",
      custom_recommended_spots_description:
        "페르소나에 맞는 서울의 장소들을 랜덤으로 골라 보여드릴게요.",
      refresh: "새로고침",
      no_recommended_spots: "추천 스팟을 불러오지 못했어요.",
      custom_recommended_courses: "맞춤 코스",
      course_search_placeholder: "코스 이름, 장소 검색...",
      card_view: "카드 뷰",
      list_view: "리스트 뷰",
      no_recommended_courses: "추천 코스가 없거나 검색 결과가 없습니다.",
      // Travel Persona 라벨들
      visit_count: "방문 횟수",
      stay_period: "체류 기간",
      travel_budget: "여행 예산",
      visit_purpose: "방문 목적",
      interests_activities: "관심 활동",
    },
    directions: {
      days: "일차",
      add_recommended_course: "에 추천 코스를 추가했어요.",
      delete_day: "일정을 삭제하시겠어요?",
      search_start: "출발지 검색",
      search_end: "도착지 검색",
      search_waypoint: "경유지 검색",
      route_planner: "경로 플래너",
      calculate_route: "경로 계산",
      calculating_route: "경로 계산 중...",
      save_route: "경로 저장",
      more: "더보기",
      duplicate_day: "일정 복제",
      add_day_menu: "일차 추가 메뉴",
      add_day: "새 일차 추가",
      add_recommended_course: "추천 코스 추가",
      set_start: "출발지를 설정하세요",
      set_end: "도착지를 설정하세요",
      add_waypoint: "경유지 추가",
      remove_waypoint: "경유지 삭제",
      add_waypoint_description:
        "경유지를 추가하면 더 정교한 경로를 만들 수 있어요.",
      map_provider: "지도 제공자",
      kakao_map: "카카오맵",
      t_map: "T map",
      car: "자동차",
      pedestrian: "도보",
      transit: "대중교통",
      transportation_mode: "이동 수단",
      route_order_adjustment: "경로 순서 조정",
      drag_to_adjust_order: "드래그하여 순서를 변경하세요",
      start: "출발",
      end: "도착",
      waypoint: "경유",
      add_start: "출발지 추가",
      add_end: "도착지 추가",
      add_waypoint: "경유지 추가",
      select_start: "출발지를 선택하세요",
      select_end: "도착지를 선택하세요",
      select_waypoint: "경유지를 선택하세요",
      travel_summary: "이동 요약",
      total_distance: "총 이동거리",
      estimated_duration: "예상 소요시간",
      minutes: "분",
      stay_time: "체류 시간(분)",
      load_recommended_course: "추천 코스 불러오기",
      load_recommended_course_description:
        "추가하고 싶은 코스를 선택하면 새 일차로 준비됩니다.",
      loading_recommended_course: "추천 코스를 불러오는 중입니다...",
      load_recommended_course_failed: "추천 코스를 불러오지 못했어요.",
      try_again: "다시 시도",
      no_recommended_course: "사용할 수 있는 추천 코스가 없습니다.",
      stops: "곳",
      keyword_input: "키워드를 입력하세요",
      search_result_select_place: "검색된 목록에서 장소를 선택하면",
      waypoint_added: "경유지가 추가됩니다.",
      start_set: "출발지가 설정됩니다.",
      end_set: "도착지가 설정됩니다.",
    },
    planner: {
      new_activity: "새로운 활동",
      no_saved_plans: "저장된 여행 계획이 없습니다.",
      create_or_modify_plan:
        "새로운 계획을 만들거나 기존 계획을 수정하여 관리하세요.",
      new_plan: "새로운 여행",
      places: "장소",
      days: "일",
      load_plan: "이 계획 불러오기",
      delete_plan: "이 계획 삭제",
      login_to_start_plan: "로그인하여 여행 계획을 시작하세요.",
      login: "로그인",
      creating_sample_plan: "샘플 여행을 만드는 중...",
      no_plan: "여행 계획이 없습니다.",
      create_sample_plan: "샘플 여행 만들기",
      saved_schedule: "저장된 일정",
      travel_planner: "여행 일정 플래너",
      saving: "저장 중...",
      travel_plan: "여행 계획",
      saved_plans: "저장된 계획",
      activity_editor: "활동 편집",
      time_info: "시간 정보",
      time: "시간",
      stay_time: "체류 시간 (분)",
      place_info: "장소 정보",
      place_name: "장소명",
      search_place_placeholder: "검색어를 입력하면 장소를 추천해드려요",
      place_type: "장소 유형",
      road_address: "도로명 주소",
      address: "지번 주소",
      latitude: "위도",
      longitude: "경도",
      additional_info: "추가 정보",
      description: "설명",
      description_placeholder: "활동과 관련된 메모를 입력하세요",
      cost_estimate: "예상 비용 (원)",
      cancel: "취소",
      save: "저장",
      add_activity: "활동 추가",
      total_days_travel: "총 {{days}}일 여행",
    },
    data: {
      live_info: "live_info",
      now: "실시간",
      is: "",
      data_update: "데이터 업데이트",
      real_time_population: "실시간 인구",
      about: "약",
      people: "명",
      real_time_commercial: "실시간 상권",
      overall_commercial: "전체 상권",
      subway_arrival_info: "지하철 도착 정보",
      recommended_tour_products: "추천 투어 상품",
      nearby_cultural_events: "주변 문화행사",
      traffic_conditions: "교통 상황",
      weather: "날씨",
      humidity: "습도",
      wind_speed: "풍속",
      precipitation: "강수량",
      feels_like: "체감",
    },
    mypage: {
      mypage: "마이 페이지",
      mypage_description: "Klover와 함께한 여행 일정과 글을 관리해보세요",
      logout: "로그아웃",
      saved_travel_plans: "저장한 여행 계획",
      liked_travel_products: "좋아요한 여행 상품",
      my_posts: "내가 작성한 글",
      liked_posts: "내가 좋아요 누른 글",
      travel_plans: "여행계획",
      travel_products: "여행상품",
      likes: "좋아요",
      loading_travel_plans: "여행 계획을 불러오는 중입니다...",
      no_saved_travel_plans: "저장한 여행 계획이 없습니다",
      create_travel_plan_message: "여행 계획을 세우고 저장해보세요!",
      no_liked_products: "좋아요한 여행 상품이 없습니다",
      like_products_message: "마음에 드는 여행 상품에 좋아요를 눌러보세요!",
      loading: "로딩 중...",
      no_posts_written: "작성한 글이 없습니다",
      write_first_post: "첫 번째 글을 작성해보세요!",
      no_liked_posts: "좋아요한 글이 없습니다",
      like_posts_message: "마음에 드는 글에 좋아요를 눌러보세요!",
      delete: "삭제",
      travel_plan: "여행 계획",
      destination_undecided: "목적지 미정",
      day_schedule: "일 일정",
      saved: "저장",
      last_updated: "최근 업데이트",
      loading_details: "상세 정보를 불러오는 중입니다...",
      time_undecided: "시간 미정",
      activity: "활동",
      no_registered_activities: "등록된 활동이 없습니다",
      no_saved_schedule_info: "저장된 일정 정보가 없습니다",
      alert_mypage_h: "마이페이지 접근 제한",
      alert_mypage_1: "마이페이지를 이용하시려면 먼저 로그인이 필요합니다.",
      alert_mypage_2: "소셜 계정으로 간편하게 로그인하세요",
    },
  },
  en: {
    tour: {
      header: {
        klover: "Klover",
        tour: "Tour",
        subtitle: "Premium Personal Tour",
      },
      list: {
        title: "Klover Tour",
        subtitle:
          "This is Klover's exclusive tour package launched in partnership with our affiliated companies, a special travel product available exclusively for Klover users.",
      },
      search: { placeholder: "Search tours..." },
      categories: {
        all: "All",
        experience: "Experience",
        it: "IT",
        sports: "Sports",
        beauty: "Beauty",
        culture: "History",
      },
      pagination: { prev: "Prev", next: "Next" },
      empty: {
        title: "No results",
        description: "Try a different search or filter.",
      },
      partners: { title: "Partners", subtitle: "Trusted partners" },
    },
    tourDetail: {
      products: {
        1: {
          title: "Netflix x Interpark Global",
          description:
            "K-Pop Demon Hunters themed tour including a free pass to Everland.",
          location: "Gangnam, Seoul → Everland, Yongin",
        },
        2: {
          title: "Microsoft AI Tour Seoul",
          description:
            "Microsoft AI Tour Seoul - where AI technology meets cultural heritage restoration.",
          location: "Jung-gu, Seoul",
        },
        3: {
          title: "Han River Bus X Instagram Seoul Hot Spots Tour",
          description:
            "An atmospheric tour exploring Seoul's iconic photo spots and Instagram hot places via the Han River Bus.",
          location: "All sections of the Han River",
        },
        4: {
          title: "LG Twins Baseball Game Experience",
          description:
            "Premium viewing at Jamsil Baseball Stadium + chicken & beer + sports experience.",
          location: "Songpa-gu, Seoul (Jamsil Special Tourist Zone)",
        },
        5: {
          title: "K-Beauty X OLIVE YOUNG Premium Beauty Tour",
          description:
            "Dermatology Care + K-Beauty Brand Experience + OLIVE YOUNG Shopping + Hanbang Spa.",
          location: "Gangnam-gu, Seoul",
        },
        6: {
          title: "Seoul Traditional Culture Tour",
          description:
            "A fun museum experience with an AI docent and Kakao Friends characters.",
          location: "Jongno-gu, Seoul",
        },
      },
      data: {
        1: {
          title: "K-Pop Demon Hunters × Everland Special Collaboration Tour",
          subtitle:
            "A perfect collaboration between the Netflix original series and Korea's top theme park.",
          location:
            "Everland, Naksan Park, N Seoul Tower, National Museum of Korea",
          duration: "10 hours (Includes Everland admission)",
          groupSize: "Up to 12 people",
          language: "Korean, English, Chinese",
          partnership: {
            primary: "NETFLIX",
            secondary: "Samsung Everland",
            tertiary: "Seoul Tourism Organization",
          },
          specialFeatures: [
            "Includes 1-day free pass to Everland",
            "Limited edition K-Pop Demon Hunters merchandise set",
            "Unlimited access to AR photo zones",
            "Drama OST playlist provided",
            "Guided audio tour of filming locations",
          ],
          itinerary: [
            {
              time: "08:30",
              location: "Gangnam Station Meetup",
              description: "Board private bus & tour briefing",
              duration: "30 min",
            },
            {
              time: "09:30",
              location: "Enter Everland",
              description:
                "Begin the K-Pop Demon Hunters theme zone experience",
              duration: "4 hours",
            },
            {
              time: "10:00",
              location: "Demon Hunters Attraction",
              description: "Experience the thrill ride 'Devil's Chase'",
              duration: "45 min",
            },
            {
              time: "11:00",
              location: "Lumi's School of Magic",
              description: "Interactive magic experience & AR photo zone",
              duration: "60 min",
            },
            {
              time: "12:30",
              location: "Demon Hunters Restaurant",
              description: "Drama-themed lunch set & limited edition dessert",
              duration: "90 min",
            },
            {
              time: "14:00",
              location: "Move to Naksan Park",
              description: "Reenact the Lumi ♥ Jinwoo date scene",
              duration: "90 min",
            },
            {
              time: "16:00",
              location: "N Seoul Tower",
              description:
                "Final boss battle filming location & observatory visit",
              duration: "120 min",
            },
            {
              time: "18:00",
              location: "National Museum of Korea",
              description:
                "Tour of the ancient artifact episode filming location",
              duration: "60 min",
            },
          ],
          detailSections: [
            {
              title: "Everland X K-Pop Demon Hunters Theme Zone",
              text: "Experience the thrilling action from the drama firsthand at the world's first K-Pop Demon Hunters theme zone. Immersive attractions perfectly recreating Lumi's School of Magic, Jinwoo's Training Center, and demon-slaying missions await you.",
            },
            {
              title: "Recreate the Romantic Date Scene at Naksan Park",
              text: "Recreate the most memorable date scene between Lumi and Jinwoo from the drama at Naksan Park. Enjoy a dramatic photo time with panoramic views of Seoul, with a dedicated photographer to capture your perfect shot.",
            },
            {
              title: "The Final Battle Stage at N Seoul Tower",
              text: "Experience the season finale's final boss battle at N Seoul Tower in VR, and enjoy the night view of Seoul as if you were the drama's protagonist. A limited-edition couple's locker experience is also included.",
            },
          ],
          inclusions: [
            "Everland 1-day free pass",
            "Round-trip private tour bus",
            "K-Pop Demon Hunters merchandise set",
            "Drama-themed lunch & dessert",
            "Professional guide service",
            "N Seoul Tower observatory ticket",
            "AR photo zone pass",
            "10% discount coupon for souvenir shop",
          ],
          exclusions: [
            "Personal shopping expenses",
            "Fees for additional rides",
            "Traveler's insurance",
            "Personal snacks and drinks",
          ],
        },
        2: {
          title: "Microsoft AI Tour Seoul",
          subtitle: "Where AI Technology Meets Cultural Heritage Restoration",
          location: "Microsoft Korea, Jung-gu, Seoul",
          duration: "4 hours",
          groupSize: "Up to 20 people",
          language: "Korean, English",
          partnership: {
            primary: "Microsoft Korea",
            secondary: "Cultural Heritage Administration",
          },
          itinerary: [
            {
              time: "09:00",
              location: "Microsoft Korea Office",
              description: "Introduction to AI technology and tour start",
            },
            {
              time: "10:00",
              location: "AI Demo Center",
              description: "Experience AI for cultural heritage restoration",
            },
            {
              time: "11:30",
              location: "Cultural Heritage Admin. Collaboration Hall",
              description: "See case studies of digital restoration",
            },
            {
              time: "13:00",
              location: "Microsoft Goods Shop",
              description: "Limited edition souvenirs and AI experience kits",
            },
          ],
          detailSections: [
            {
              title: "Microsoft AI Conference 2025 - Key Agenda",
              text: "Satya Nadella introduces the future of AI at the Microsoft AI Conference in Seoul. The agenda, including a keynote, 25 breakout sessions, and 12 hands-on workshops, provides deep insights into AI innovation and industrial change.",
            },
            {
              title: "Learn and Connect at Microsoft AI Conference 2025",
              text: "Attendees introduced by Satya Nadella will gain insights from industry leaders on AI innovation and explore the latest technologies in cloud, AI, and security. It also offers opportunities to connect with Microsoft executives, have one-on-one discussions with experts, and expand networks through dynamic community sessions.",
            },
            {
              title: "Microsoft AI Conference - Live Session",
              text: "Audiences gather at the Microsoft AI Conference to listen to a keynote on the future of AI.",
            },
          ],
          inclusions: [
            "Expert-led guided tour",
            "AI technology experience session",
            "Limited edition souvenir",
            "Networking opportunities",
          ],
          exclusions: ["Transportation costs", "Meals", "Personal expenses"],
        },
        3: {
          title: "Han River Bus X Instagram Seoul Hot Spots Tour",
          subtitle: "Conquer Seoul's top photo spots along the Han River",
          location: "Han River Parks (Yeouido-Jamsil-Banpo-Mapo)",
          duration: "3.5 hours",
          groupSize: "Up to 25 people",
          language: "Korean, English",
          partnership: {
            primary: "Seoul Tourism Foundation",
            secondary: "Hangang Project Headquarters",
          },
          itinerary: [
            {
              time: "15:00",
              location: "Yeouido Han River Park",
              description: "Tour start & Instagram photo tips lecture",
            },
            {
              time: "15:30",
              location: "Han River Bus (Yeouido→Jamsil)",
              description:
                "On-bus photoshoot with 63 Building & IFC Mall background",
            },
            {
              time: "16:00",
              location: "Jamsil Lotte World Tower Photo Zone",
              description: "Take iconic Seoul skyline shots",
            },
            {
              time: "16:45",
              location: "Han River Bus (Jamsil→Banpo)",
              description:
                "Shoot cinematic videos with a Han River cruise vibe",
            },
            {
              time: "17:15",
              location: "Banpo Rainbow Fountain",
              description: "Capture golden hour time-lapse of the fountain",
            },
            {
              time: "18:00",
              location: "Sebitseom LED Show",
              description:
                "Night view fireworks and group commemorative photos",
            },
          ],
          detailSections: [
            {
              title: "Yeouido Han River Park Tour",
              text: "Feel the cool breeze cycling along the river at Yeouido Han River Park, a recreational space in the heart of Seoul. Enjoy a leisurely picnic on the green lawn and admire the unique scenery of the Han River and skyline.",
            },
            {
              title: "Banpo Rainbow Fountain Tour",
              text: "Listed in the Guinness Book of Records as the world's longest bridge fountain, the Banpo Rainbow Fountain is a landmark of the Han River. During the day, cool streams of water gush out, and at night, colorful lights and music create a romantic atmosphere, making it one of the best spots to enjoy Seoul's night view.",
            },
            {
              title: "Sebitseom (Floating Islands) Tour",
              text: "As the world's first artificial floating islands, Sebitseom is a multipurpose cultural space consisting of three islands: 'Gavit,' 'Chavit,' and 'Solvit.' It hosts exhibitions, performances, and events, and you can enjoy a special meal at restaurants and cafes overlooking the Han River. Especially at night, LED lights adorn the entire island, making it a representative night view spot in Seoul. Yacht and boat experiences are also available for a unique pleasure.",
            },
          ],
          inclusions: [
            "Han River Bus ticket",
            "Professional photographer guide",
            "Photo shooting and editing service",
            "Beverages and snacks",
          ],
          exclusions: [
            "Personal camera equipment",
            "Meal costs",
            "Additional activity fees",
          ],
        },
        4: {
          title: "LG Twins Premium Baseball Viewing Tour",
          subtitle:
            "The perfect baseball experience at Jamsil Baseball Stadium",
          location: "Jamsil Baseball Stadium, Lotte World Tower",
          duration: "6 hours",
          groupSize: "Up to 25 people",
          language: "Korean, English, Japanese",
          partnership: { primary: "LG Twins", secondary: "Kyochon Chicken" },
          itinerary: [
            {
              time: "14:00",
              location: "Jamsil Station, Exit 2",
              description: "Tour start & introduction to baseball culture",
            },
            {
              time: "15:00",
              location: "LG Twins Fan Shop",
              description: "Try on uniforms and prepare cheering gear",
            },
            {
              time: "18:00",
              location: "Kyochon Chicken Premium Box Seats",
              description: "Watch the game with chicken & beer",
            },
            {
              time: "20:00",
              location: "Photo Zone",
              description:
                "Commemorative snap photo tour with the stadium background",
            },
          ],
          detailSections: [
            {
              title: "Jamsil Baseball Game",
              text: "As a representative sports landmark in Seoul, Jamsil Baseball Stadium is the home of the LG Twins and Doosan Bears, where you can feel the excitement of Korean professional baseball up close. The unique atmosphere created by chants and cheering sticks in this large stadium, which can accommodate over 30,000 people, conveys the charm of Korean pro baseball. Especially, the passionate cheering of LG Twins fans offers an unforgettable experience for visitors to Jamsil.",
            },
            {
              title: "LG Twins",
              text: "International tourists are enthusiastically cheering and enjoying the atmosphere at an LG Twins baseball game in Seoul. Korean professional baseball, with its cheerleader-style cheering culture, offers a unique tourist course, providing special memories for international visitors.",
            },
          ],
          inclusions: [
            "Premium baseball game ticket",
            "Chicken and beer set",
            "LG Twins cheering gear",
            "Professional guide",
          ],
          exclusions: [
            "Additional food and drinks",
            "Personal souvenir purchases",
            "Transportation costs",
          ],
        },
        5: {
          title: "K-Beauty & Wellness Premium Tour",
          subtitle:
            "The perfect combination of Korea's top beauty technology and traditional wellness",
          location: "Gangnam area (Apgujeong-Cheongdam-Sinsa)",
          duration: "6 hours",
          groupSize: "Up to 12 people",
          language: "Korean, English, Chinese, Japanese",
          partnership: {
            primary: "OLIVE YOUNG",
            secondary: "Gangnam Dermatology Association",
          },
          itinerary: [
            {
              time: "10:00",
              location: "Personal Color Diagnosis",
              description:
                "Personal color analysis + customized makeup recommendation",
            },
            {
              time: "11:00",
              location: "Apgujeong Premium Dermatology Clinic",
              description: "Skin analysis + HydraFacial care (30 min)",
            },
            {
              time: "13:00",
              location: "Cheongdam-dong Korean Restaurant",
              description: "Herbal medicinal lunch for healthy skin",
            },
            {
              time: "14:30",
              location: "Sinsa-dong K-Beauty Experience Center",
              description:
                "Customized care experience from brands like Sulwhasoo, The History of Whoo",
            },
            {
              time: "15:30",
              location: "Apgujeong Traditional Hanbang Spa",
              description: "Loess soil jjimjil + aroma massage (90 min)",
            },
            {
              time: "17:30",
              location: "OLIVE YOUNG VIP Shopping",
              description:
                "Personalized product recommendations + duty-free shopping",
            },
          ],
          partnershipBenefits: [
            {
              icon: "Award",
              title: "Premium Skin Care",
              description: "Top Gangnam clinic HydraFacial + skin analysis",
              value: "Valued at ₩150,000",
            },
            {
              icon: "Gift",
              title: "K-Beauty Goodie Bag",
              description:
                "Sample kits from popular brands like Sulwhasoo, The History of Whoo, Innisfree",
              value: "Worth ₩80,000",
            },
            {
              icon: "Play",
              title: "Hanbang Wellness Spa",
              description:
                "Loess soil jjimjilbang + 90-min traditional aroma massage",
              value: "Worth ₩120,000",
            },
          ],
          detailSections: [
            {
              title: "K-Beauty Personal Color Diagnosis Experience",
              text: "Discover the colors that best suit your image through a personal color diagnosis, a core trend in Korean beauty. A professional consultant analyzes colors that match your skin tone and mood, providing practical help for makeup and fashion styling. For foreign visitors, it is a special time to directly experience Korean K-beauty culture and discover their new charm.",
            },
            {
              title: "K-Beauty in OLIVE YOUNG",
              text: "This is an OLIVE YOUNG shopping experience tour designed for foreign tourists interested in K-beauty. Beyond a simple store visit, a personal shopper who knows the trends best accompanies you to help with customized shopping. You can get recommendations and purchase hot items loved by global fans, K-pop artist beauty items, and viral products on social media on the spot.",
            },
            {
              title: "Korean Dermatology",
              text: "Famous for its advanced equipment and professional medical staff, Korean dermatology is globally recognized in the field of beauty and skin treatment. Foreign visitors can directly experience K-beauty's medical services through personalized treatments ranging from acne and blemish care to laser procedures and skincare programs. It is a special opportunity to experience Korea's unique beauty and healthcare culture along with safe and meticulous treatment.",
            },
          ],
          inclusions: [
            "Personal color diagnosis",
            "Premium skin care treatment",
            "Hanbang spa experience",
            "K-Beauty goodie bag",
            "Professional beauty guide",
            "Lunch",
          ],
          exclusions: [
            "Additional treatment costs",
            "Personal shopping expenses",
            "Transportation costs",
          ],
        },
        6: {
          title: "Seoul Traditional Culture Tour",
          subtitle:
            "A special day enjoying royal culture at Gyeongbokgung, traditional elegance with a tea ceremony in Insadong, and local food at Gwangjang Market.",
          location: "Jongno-gu area, Seoul",
          duration: "4.5 hours",
          groupSize: "Up to 6 people",
          language: "Korean, English, Chinese",
          partnership: {
            primary: "Seoul Metropolitan Government",
            secondary: "Hana Tour",
          },
          itinerary: [
            {
              time: "10:00",
              location: "Gyeongbokgung Palace Entrance",
              description:
                "Rent Hanbok, tour the palace, and have a travel photoshoot",
            },
            {
              time: "12:00",
              location: "Traditional Korean Set Menu Lunch",
              description: "Lunch at a traditional Korean restaurant",
            },
            {
              time: "14:30",
              location: "Insadong Tea Ceremony & Traditional Street Walk",
              description:
                "Experience a tea ceremony at a traditional teahouse and browse traditional crafts, seals, and Hanji souvenirs",
            },
            {
              time: "17:00",
              location: "Gwangjang Market Traditional Food Tour",
              description:
                "Taste local favorites like Bindaetteok (mung bean pancake), Mayak Gimbap, and Yukhoe (beef tartare)",
            },
            {
              time: "19:00",
              location: "Cheonggyecheon Stream Night Walk",
              description:
                "A stroll along Cheonggyecheon Stream, which flows to the Han River",
            },
          ],
          detailSections: [
            {
              title: "Gyeongbokgung Palace Travel Photoshoot",
              text: "Capture your travel moments with a professional photographer at Gyeongbokgung, Seoul's representative palace. Wearing Hanbok against the backdrop of the grand palace halls and serene gardens, you can record special moments. The blend of tradition and modernity at Gyeongbokgung will become an unforgettable travel memory.",
            },
            {
              title: "Insadong Tea Ceremony Experience",
              text: "Experience a Korean tea ceremony in a serene teahouse on the traditional streets of Insadong, Seoul. With expert guidance, you can taste traditional tea and snacks, feeling the depth of Korean tea culture.",
            },
            {
              title: "Gwangjang Market Food Tour",
              text: "Enjoy representative Korean street food at Gwangjang Market, one of Seoul's most vibrant traditional markets. You can taste various street foods loved by both locals and foreigners, such as crispy Bindaetteok, Mayak Gimbap, and Yukhoe.",
            },
          ],
          inclusions: [
            "Hanbok rental",
            "Gyeongbokgung Palace admission",
            "Tea ceremony experience",
            "Gwangjang Market food tasting",
            "Professional guide",
            "Travel snapshot photos",
          ],
          exclusions: [
            "Lunch cost",
            "Personal souvenir purchases",
            "Transportation costs",
          ],
        },
      },
      offer: {
        expiresIn: "Time left",
        limitedTime: "⏳ Limited-time offer",
        doNotShowToday: "Don't show today",
        grabDeal: "Grab deal",
        grabbed: "Secured",
        dealGrabbed: "Deal secured!",
        priceSecured: "Current price is secured for a moment",
        urgencyText: "Hurry! Ends in {{minutes}}m {{seconds}}s",
      },
      booking: {
        bookNow: "Book now",
        reviews: " reviews",
        discount: "off",
      },
      tabs: {
        overview: "Overview",
        details: "Details",
        reviews: "Reviews",
      },
      overview: {
        itinerary: "Itinerary",
        noItinerary: "No itinerary available",
        included: "Inclusions",
        notIncluded: "Exclusions",
      },
      details: {
        noDetails: "No details available",
        specialFeatures: "Special Features",
        partnershipBenefits: "Partnership Benefits",
      },
      reviews: {
        noReviews: "No reviews yet",
        verifiedPurchase: "Verified Purchase",
      },
      notFound: {
        title: "Tour not found",
        description: "We couldn't load the requested tour information.",
      },
    },
    common: {
      community: {
        info_reviews_label: "Info & Reviews",
        info_reviews_desc: "A space to share travel information and reviews",
        labels: {
          notice: "Notice",
          editors_pick: "Klover's Pick",
          popular_destinations: "Popular Destinations",
        },
        search_placeholder: "Search...",
        live_areas: {
          gangnam: "Gangnam",
          gwanghwamun: "Gwanghwamun",
          myeongdong: "Myeongdong",
          seoul_station: "Seoul Station",
          itaewon: "Itaewon",
          jamsil: "Jamsil",
          jongno: "Jongno",
          hongdae: "Hongdae",
        },
        info: {
          posts: {
            10001: {
              title: "✈️ Seoul City Airport Terminal Smart Usage Guide",
              content:
                "Check in, drop baggage, and complete immigration in the city before heading to the airport. Details on Seoul Station/Gwangmyeong CAT hours, services, and notes.",
            },
            10002: {
              title: "🎆 2025 Seoul International Fireworks Festival",
              content:
                "Oct 4, 2025 (Sat) 19:30–21:00 around Yeouido Hangang Park. See viewing spots, transport tips, and event highlights.",
            },
            10003: {
              title: "🌟 Seoul Subway Early Closing during 2025 Chuseok",
              content:
                "Lines 1–9 operate until 23:00 during Chuseok. Refer to Seoul Metro website for detailed timetable.",
            },
            1001: {
              title: "K‑pop Demon Hunters – 3‑day Seoul Pilgrimage Course",
              content:
                "Visit the series' iconic spots over 3 days: Day1 Gangnam/Samseong, Day2 Hangang/Hongdae, Day3 Gwanghwamun/Ikseon/Naksan, plus pro tips.",
            },
            1002: {
              title: "Eat Like K-Pop Idols! 🎤✨ Complete Seoul Food Guide",
              content:
                "Imagine eating the same menu in the same space as your favorite idols... Exciting just thinking about it, right? We reveal the real regular spots of idols that our editor personally researched! 📍\n\nThose Famous Restaurants from TV\n🥖 Pachamama Bakery | Near HYBE in Yongsan\nThat bakery LE SSERAFIM praised on 'The Manager'! Salt bread and pistachio slices are must-order items. Perfect for a visit after touring HYBE ✨\n\n🥩 Geumdoeji Sikdang | Michelin Bib Gourmand\nThere's a reason ZB1, BTS, and EXO are regulars here. Eating thick pork belly with basil wraps... No words needed 🤤\n\nSNS Trending Spots\n🍈 Asotto | Euljiro\naespa Winter's bubble-verified melon bread specialty store! Popular since opening in 2024. Strongly recommend vanilla cream melon bread 💛\n\n🌿 Cafe Sumokgeumto | Gangnam\nFamous for SEVENTEEN Mingyu's rainbow staircase Instagram photo zone. Enjoy healing time in a nature-friendly atmosphere in the city 🌈\n\n🍦 Yoajung | Nationwide locations\nFamous for RIIZE Seungchan's combination recipe yogurt ice cream. Gold mango + honeycomb + shine muscat combination is really delicious (editor approved!)\n\n🍩 Pirma Bakery | Anguk\nTWICE Sana's super earl grey donut. The point is the not-too-sweet, rich earl grey cream! (Takeout only)\n\nEssential Pilgrimage Spots for Fans\n🐑 Lamb NIKUYA | Duncheon Branch 2\nFull of Stray Kids and DAY6 member signatures and post-its! Also famous as a V-Live filming location\n\n🥩 Gopchang Paneun Gogi Jip\nSEVENTEEN Going Seventeen filming location. Carat set menu and birthday events included! Must-visit for real fans 📸\n\n🎯 Editor Suhyeon's Tips!\n\nGangnam Line: Sumokgeumto → Sunday Burger Club → Agagelato\n\nSeongsu Line: Cafe Parven → Seongsu Darak\n\nYongsan Line: Pachamama → Asotto\n\nVisit on weekday afternoons for a peaceful experience. Order the same menu as idols and don't forget the #idolfoodtour hashtag! 💜",
            },
          },
        },
      },
      // Home.jsx
      place1: "Myeongdong",
      place2: "Gwanghwamun",
      place3: "Itaewon",
      place4: "Jamsil",
      "features.title1": "AI Persona Analysis",
      "features.title2": "Custom Course Recommendation",
      "features.title3": "K-Pop Playlist",
      "features.title4": "AI Docent",
      "features.desc1": "Discover your unique travel style with 5 questions",
      "features.desc2": "AI generates a perfect course in real-time.",
      "features.desc3": "K-Pop playlist for each travel destination.",
      "features.desc4": "RAG-based chatbot for deep cultural experience.",
      "stats.label1": "Custom trips created",
      "stats.label2": "Satisfaction",
      "stats.label3": "AI Support",
      "stats.label4": "Average Rating",
      "main.badge": "AI Custom Travel Planner",
      "nav.features": "Features",
      "nav.howto": "How to Use",
      "nav.community": "Community",
      "login.welcome": "Welcome!",
      "login.logout": "Logout",
      "login.login": "Login",
      "main.title.k_travel": "Travel",
      "main.title.connector": "",
      "main.title.ai_creates": "AI creates for you",
      "main.subtitle":
        "Analyze your travel style with 5 questions and receive a perfect course with K-Pop. Let AI handle the complex planning, and you just prepare for the excitement.",
      "main.start.persona": "Persona Analysis Start",
      "main.start.start": "Start",
      "now.playing": "Now Playing",
      "main.recommend.spot": "Recommended Spot",
      "main.recommend.spot.name": "Hongdae K-Pop Square",
      "main.title.ai_action": "AI creates",
      "main.title.experience": "special experiences",
      "main.subtitle.ai_action":
        "Innovative AI technology to design your perfect Korean trip.",
      "main.more.view": "View more",
      "steps.title": "Complete in",
      "steps.completion": "3 Simple Steps",
      "steps.step1.title": "Persona Analysis",
      "steps.step1.description": "Analyze travel style with 5 questions",
      "steps.step2.title": "AI Custom Recommendation",
      "steps.step2.description": "Generate perfect course based on analysis",
      "steps.step3.title": "Free Editing",
      "steps.step3.description": "Complete your plan with drag & drop",
      "popular.title": "Discover Real-time",
      "popular.highlight": "Popular Destinations",
      "popular.action.join": "",
      "popular.action": "meet",
      "popular.description":
        "Check out popular courses chosen by other travelers",
      "footer.slogan": "Experience the perfect Korean trip with AI",
      "footer.privacy_policy": "Privacy Policy",
      "footer.terms_of_service": "Terms of Service",
      "footer.customer_center": "Customer Center",
      "footer.partnership": "Partnership",
      "footer.copyright": "© 2025 Klover. All rights reserved.",
      "modal.welcome": "Welcome to Klover",
      "modal.instruction":
        "Please log in to start your AI custom travel planner",
      "modal.continue_google": "Continue with Google",
      "modal.continue_microsoft": "Continue with Microsoft",
      "modal.disclaimer.prefix": "By continuing, you agree to our",
      "modal.disclaimer.terms": "Terms of Service",
      "modal.disclaimer.and": "and",
      "modal.disclaimer.privacy": "Privacy Policy",
      "modal.disclaimer.suffix": ".",
      "cta.title": "Now, it's time to start your perfect trip",
      "cta.start": "Start with 5 questions",

      // Home.jsx 추가 번역 키들
      "home.persona.title": "Discover Your Travel Persona",
      "home.persona.desc":
        "Analyze your travel style with 5 questions and get AI-customized course recommendations.",
      "home.persona.cta": "Start Persona Analysis",
      "home.persona.card1.title": "Travel Style?",
      "home.persona.card1.pill1": "Adventure Seeker",
      "home.persona.card1.pill2": "Leisure Enjoyer",
      "home.persona.card1.pill3": "Planned Explorer",
      "home.persona.card2.title": "Interests?",
      "home.persona.card2.pill1": "Cultural Experience",
      "home.persona.card2.pill2": "Food Tour",
      "home.persona.card2.pill3": "Shopping",
      "home.persona.card3.title": "Preferred Atmosphere?",
      "home.persona.card3.pill1": "Trendy",
      "home.persona.card3.pill2": "Traditional",
      "home.persona.card3.pill3": "Nature-friendly",

      "home.ai_reco.title": "Perfect Travel Course Created by AI",
      "home.ai_reco.desc":
        "Generate optimal travel routes in real-time based on personalized analysis.",
      "home.ai_reco.tag1": "Real-time Generation",
      "home.ai_reco.tag2": "Customized Recommendations",
      "home.ai_reco.tag3": "Optimal Routes",
      "home.ai_reco.tag4": "Time Efficient",
      "home.ai_reco.tag5": "Local Information",

      "home.editing.title": "Edit Freely and Complete",
      "home.editing.desc":
        "Freely modify your travel itinerary with drag and drop to create your perfect plan.",

      "home.map.preview_label": "Custom Travel Route",

      "home.itinerary.title": "Travel Itinerary",
      "home.itinerary.item1": "Gyeongbokgung Tour",
      "home.itinerary.item2": "Bukchon Hanok Village",
      "home.itinerary.item3": "Insadong Culture Street",
      "home.itinerary.item4": "Myeongdong Shopping",

      "home.controls.undo": "Undo",
      "home.controls.save": "Save",
    },
    QuickTranslator: {
      all: "All",
      greeting: "Greeting",
      location: "Location",
      price: "Price",
      help: "Help",
      transport: "Transport",
      food: "Food",
      status: "Status",
      payment: "Payment",
      menu: "Menu",
      language_detection_error: "An error occurred while detecting language.",
      speech_recognition_error: "Speech recognition error",
      real_time_translator: "Real-time Translator",
      stop_listening: "Stop listening",
      processing_listening: "Processing speech recognition...",
      start_listening: "Start listening",
      listening: "Listening... Please speak",
      processing_text_conversion: "Converting speech to text...",
      input_text:
        "Enter text to translate... (language will be detected automatically)",
      detecting_language: "Detecting language...",
      detected_language: "Detected language",
      translating: "Translating...",
      translate: "Translate",
      translation_results: "Translation Results",
      listen_to_audio: "Listen to audio",
      frequently_used_expressions: "Frequently Used Expressions",
      use: "Use",
      phrases1: "Hello",
      phrases2: "Thank you",
      phrases3: "Sorry",
      phrases4: "Where is the bathroom?",
      phrases5: "How much is it?",
      phrases6: "Help me",
      phrases7: "Where is the subway station?",
      phrases8: "It's delicious",
      phrases9: "I've arrived",
      phrases10: "Can I pay by card?",
      phrases11: "Please give me a receipt",
      phrases12: "Please give me the menu",
      phrases13: "Please give me water",
      phrases14: "Please give me the bill",
      phrases15: "Please wrap it up",
    },
    Navigation: {
      persona_analysis: "Persona Analysis",
      result_dashboard: "Result Dashboard",
      itinerary_planner: "Itinerary Planner",
      ai_docent: "AI Docent",
      community: "Community",
      tour: "Tour",
      mypage: "My Page",
      survival: "Survival",
      survival_kit: "Survival Kit",
      playlists: "Playlists",
      menu: "Menu",
      personalized_travel_planning: "Personalized Travel Planning",
      live_info: "Live Info",
      exchange_rate_krw: "Exchange Rate (KRW)",
      seoul_weather: "Seoul Weather",
      temp: "Temp",
      humidity: "Humidity",
      wind: "Wind",
      refresh_data: "Refresh Data",
      expand: "Expand",
      collapse: "Collapse",
      welcome_traveler: "Welcome, Traveler!",
      plan_your_trip_with_ai: "Plan your trip with AI",
      log_out: "Log Out",
      log_in: "Log In",
    },
    dashboard: {
      edit_route: "Edit Route",
      detail: "Detail",
      checking_login_status: "Checking login status...",
      login_required: "Login Required",
      google_login: "Login with Google",
      microsoft_login: "Login with Microsoft",
      no_analysis_result: "No Analysis Results",
      no_analysis_result_description:
        "No recent persona analysis results found. Please analyze your travel plan again.",
      start_analysis: "Start Analysis",
      login_required_description:
        "Please log in to view your travel persona analysis and recommended courses.",
      your_ai_travel_persona: "Your AI Travel Persona",
      analyzing: "Analyzing...",
      travel_persona: "Travel Persona",
      custom_recommended_spots: "Custom Recommended Spots",
      custom_recommended_spots_description:
        "I'll randomly select places in Seoul that match your persona.",
      refresh: "Refresh",
      no_recommended_spots: "Failed to load recommended spots.",
      custom_recommended_courses: "Custom Courses",
      course_search_placeholder: "Search course name, places...",
      card_view: "Card View",
      list_view: "List View",
      no_recommended_courses: "No recommended courses or search results found.",
      visit_count: "Visit Count",
      stay_period: "Stay Period",
      travel_budget: "Travel Budget",
      visit_purpose: "Visit Purpose",
      interests_activities: "Interests & Activities",
    },
    persona: {
      choice: "selected",
      checking_login_status: "Checking login status...",
      login_required: "Login Required",
      login_required_description:
        "Please log in with Google or Microsoft account to use the persona analysis feature.",
      google_login: "Login with Google",
      microsoft_login: "Login with Microsoft",
      loading_questions: "Loading questions...",
      loading_questions_failed: "Failed to load questions",
      retry: "Retry",
      empty_questions: "Question list is empty",
      empty_questions_description:
        "Please check if the backend is running and question data is returned properly.",
      refresh: "Refresh",
      your_ai_travel_persona: "Find Your AI Travel Persona",
      your_ai_travel_persona_description:
        "Answer a few questions and AI will recommend courses that match your travel style.",
      previous: "Previous",
      next: "Next",
      analyzing: "Analyzing...",
      check_result: "Check Results",
      custom_recommended_spots: "Custom Recommended Spots",
      custom_recommended_spots_description:
        "We'll randomly select places in Seoul that match your persona.",
      refresh: "Refresh",
      no_recommended_spots: "Failed to load recommended spots.",
      custom_recommended_courses: "Custom Courses",
      course_search_placeholder: "Search course names, places...",
      card_view: "Card View",
      list_view: "List View",
      no_recommended_courses: "No recommended courses or search results found.",
      // Travel Persona 라벨들
      visit_count: "Number of Visits",
      stay_period: "Stay Period",
      travel_budget: "Travel Budget",
      visit_purpose: "Purpose of Visit",
      interests_activities: "Interests/Activities",
      // --- [Add Start] Persona Question Translations ---
      questions: {
        rvit: {
          title: "How many times have you visited Korea?",
          options: {
            v1: {
              label: "First time",
              description: "This is my first trip to Korea.",
            },
            v2: {
              label: "Second time",
              description: "I have been here once before.",
            },
            v3: {
              label: "Third time",
              description: "I'm getting familiar with it now.",
            },
            v4plus: {
              label: "4 or more times",
              description: "I visit quite often.",
            },
          },
        },
        q1_purpose: {
          title: "What is the main purpose of your visit?",
          options: {
            leisure: {
              label: "Holiday/Leisure",
              description: "Visiting for personal relaxation and enjoyment.",
            },
            friends: {
              label: "Visiting friends/family",
              description: "I came to meet people I know.",
            },
          },
        },
        r19hap: {
          title: "How long are you planning to stay?",
          options: {
            h1: {
              label: "1-3 days",
              description: "Just staying for a short while.",
            },
            h2: {
              label: "4-10 days",
              description: "Just visiting the famous tourist spots.",
            },
            h3: {
              label: "11-18 days",
              description: "I enjoy interacting with other travelers.",
            },
            h4: {
              label: "19-29 days",
              description: "I value the experience of living like a local.",
            },
            h5: {
              label: "30 days or more",
              description:
                "I'm very interested in life in Korea, like a month-long stay.",
            },
          },
        },
        cost: {
          title: "What is your travel budget? (per person)",
          options: {
            c1: {
              label: "Less than $1,000",
              description: "Planning a frugal and value-oriented trip.",
            },
            c2: {
              label: "$1,000 ~ $2,000",
              description: "I prefer reasonable spending.",
            },
            c3: {
              label: "$2,000 ~ $3,000",
              description: "I enjoy investing in diverse experiences.",
            },
            c4: {
              label: "$3,000 ~ $4,000",
              description:
                "I tend to enjoy my trip without being restricted by cost.",
            },
            c5: {
              label: "$4,000 or more",
              description: "I prefer luxury experiences and shopping.",
            },
          },
        },
        considered: {
          title: "What activities are you interested in?",
          options: {
            nature: {
              label: "Nature",
              description: "Enjoying scenery like mountains, sea, parks",
            },
            heritage: {
              label: "Cultural Heritage",
              description: "Exploring palaces, museums, historical sites",
            },
            food: {
              label: "Gastronomy",
              description: "Visiting famous restaurants, cafes, street food",
            },
            shopping: {
              label: "Shopping",
              description: "Enjoying shopping for fashion, beauty, souvenirs",
            },
            relaxation: {
              label: "Relaxation",
              description: "Resting at spas, beaches, quiet places",
            },
            tradition: {
              label: "Traditional Culture",
              description:
                "Experiencing Hanbok, traditional performances, Hanok villages",
            },
            museum: {
              label: "Art/Museum",
              description: "Viewing artworks and exhibitions",
            },
            kpop: {
              label: "K-POP",
              description: "Concerts, fan meetings, pilgrimage tours",
            },
            arts: {
              label: "Performance/Arts",
              description: "Watching musicals, plays, exhibitions",
            },
            festival: {
              label: "Festivals/Events",
              description:
                "Participating in local festivals and seasonal events",
            },
            nightlife: {
              label: "Nightlife",
              description: "Enjoying clubs, bars, night markets",
            },
            themepark: {
              label: "Theme Park",
              description: "Visiting amusement parks and theme parks",
            },
            beauty: {
              label: "Beauty/Wellness",
              description: "Experiencing K-beauty like hair, nail, skin care",
            },
            medical: {
              label: "Medical",
              description: "Using medical services like health check-ups",
            },
            sports_view: {
              label: "Spectator Sports",
              description: "Watching pro sports like baseball, soccer",
            },
            sports_play: {
              label: "Active Sports",
              description: "Participating in sports like skiing, surfing",
            },
          },
        },
      },
      // --- [Add End] ---
    },
    SurvivalKit: {
      // Hero 섹션
      hero_tagline: "Essential Travel Tools",
      hero_title: "Survival Kit",
      hero_subtitle:
        "Meet all the tools and information you need during your trip to Korea in one place",

      // 섹션 설명
      section_vision_benefit: "Image text recognition and translation",
      section_translator_benefit: "Real-time voice and text translation",
      section_culture_benefit: "Korean culture and etiquette guide",

      vision_ocr: "Vision OCR",
      quick_translator: "Quick Translator",
      culture_guide: "Culture Guide",
      // 문화 가이드 번역
      greeting: "Greeting Etiquette",
      greeting_content:
        "In Korea, greet older people first and bow your head when greeting.",
      greeting_extra:
        "Usually a light nod is sufficient, and shaking hands with both hands appears more polite.",
      greeting_modal_title: "Korean Honorifics and Basic Greeting Expressions",
      greeting_modal_paragraphs:
        "Korea has honorifics and informal speech, so greeting expressions vary depending on the situation.",
      greeting_modal_paragraphs_2:
        "Friends say 'annyeong' to each other, but you must say 'annyeonghaseyo' to adults or people you meet for the first time to be polite.",
      greeting_modal_list_1: "안녕하세요 (Daily honorific)",
      greeting_modal_list_2: "안녕하십니까 (Formal)",
      greeting_modal_list_3: "안녕 (Close friends, informal)",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워 (Thank you)",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해 (Sorry)",
      greeting_modal_link_1: "How to greet Korean people",

      meal: "Dining Etiquette",
      meal_content:
        "Adults pick up utensils first, don't hold the rice bowl while eating. Receive alcohol with both hands.",
      meal_extra:
        "After finishing your meal, it's polite to place chopsticks neatly on the bowl.",
      meal_modal_title: "Korean Dining Etiquette",
      meal_modal_paragraphs:
        "In Korea, dining is not just about eating food but an important occasion to respect others.",
      meal_modal_paragraphs_2:
        "Before eating, say 'jal meokgesseumnida' (I will eat well), and after eating, say 'jal meogeosseumnida' (I ate well), which shows respect for both the person who prepared the food and those who shared the meal.",
      meal_modal_list_1: "Elders or guests sit first when taking seats.",
      meal_modal_list_2: "Don't stick chopsticks into the rice bowl.",
      meal_modal_list_3: "When drinking alcohol, turn your head slightly.",
      meal_modal_list_4:
        "Chewing loudly or pointing at people with chopsticks is impolite.",
      meal_modal_list_5: "Place bowls on the table and eat.",
      meal_modal_link_1: "Korean dining etiquette",

      transportation: "Public Transportation",
      transportation_content:
        "Give up priority seats on the subway and don't talk loudly on the phone.",
      transportation_extra:
        "During rush hours, carrying bags in front is a considerate attitude.",
      transportation_modal_title: "Korean Public Transportation",
      transportation_modal_paragraphs:
        "Korean subways and buses are very convenient, but it's important to follow seat and behavior etiquette.",
      transportation_modal_paragraphs_2:
        "Especially priority seats and pregnant women's seats are confusing for foreigners - it's common culture not to sit even if they're empty.",
      transportation_modal_list_1:
        "Priority seats are for elderly, disabled, and pregnant women only - young people don't use them.",
      transportation_modal_list_2:
        "Pregnant women's seats (pink seats) are kept empty so pregnant women can use them anytime.",
      transportation_modal_list_3:
        "Don't talk loudly on public transportation.",
      transportation_modal_list_4:
        "Carry bags in front or put them down to be considerate of other passengers.",
      transportation_modal_list_5:
        "When boarding, let passengers exit first, then board in order.",
      transportation_modal_link_1: "Using Korean public transportation",
      transportation_modal_link_2: "Using Seoul subway",

      tip: "Tipping Culture",
      tip_content:
        "Korea has no tipping culture. Service charges are already included.",
      tip_extra:
        "Some hotels in tourist areas may accept small tips as an exception, but it's not mandatory.",
      tip_modal_title: "Korean Tipping Culture",
      tip_modal_paragraphs:
        "Korea's tipping culture is very different from the West and barely exists.",
      tip_modal_list_1: "Restaurants/Cafes: No tip needed",
      tip_modal_list_2: "Taxis: Pay only the set fare",
      tip_modal_list_3: "Hair salons/Massage services: No tipping culture",

      footwear: "Removing Shoes",
      footwear_content:
        "In Korean homes or some restaurants, you take off your shoes before entering.",
      footwear_extra:
        "Shoe cabinets are usually at the entrance, and indoor slippers are often prepared.",
      footwear_modal_title: "Korean Shoe Removal Culture",
      footwear_modal_paragraphs:
        "In Korea, removing shoes when entering homes is a natural cultural practice.",
      footwear_modal_paragraphs_2:
        "This is a traditional habit to keep the interior clean and protect family health.",
      footwear_modal_paragraphs_3:
        "Indoors, people often wear slippers instead of shoes or just socks.",
      footwear_modal_list_1: "Homes: Remove shoes at the entrance",
      footwear_modal_list_2:
        "Traditional Korean restaurants/Hanok: Often remove shoes due to floor seating structure",

      gift: "Gift Etiquette",
      gift_content:
        "When receiving gifts, accept them with both hands and don't open them immediately.",
      gift_extra:
        "Especially for adults or superiors, alcohol, health foods, and tea are safe gift choices.",
      gift_modal_title: "Korean Gift Etiquette",
      gift_modal_paragraphs:
        "In Korea, gifts carry meaning of relationship and respect, not just objects.",
      gift_modal_paragraphs_2:
        "When giving and receiving gifts, you must use both hands as etiquette.",
      gift_modal_list_1: "Give and receive with both hands",
      gift_modal_list_2:
        "Exchange gifts in various situations like holidays, housewarming, gratitude",
      modal_close: "Close",
    },
    VisionOCR: {
      image_upload: "Image Upload",
      image_support: "Supports JPG, PNG files",
      image_preview: "Image Preview",
      image_preview_desc: "Check the image to analyze",
      cancel: "Cancel",
      analyzing: "Analyzing...",
      analyze_start: "Start Analysis",
      analyze_result: "Analysis Result",
      analyze_result_desc: "Click the text",
      analyze_result_image: "Analyzed Image",
      menu_info: "Menu Information",
      ai_generating_answer: "AI is generating an answer...",
      ai_analyze_result: "AI Analysis Result",
      ai_generated_answer_desc:
        "This information is a reference answer generated by AI",
      source_info:
        "Source: Korean Food Promotion Institute, 'Guide to Foreign Language Notation of Korean Menus 800 Selections'",
      menu_name: "Menu Name",
      description: "Description",
      source_info_2: "Source: Korea Foundation Korean Food Information",
      food_name: "Food Name",
      translating: "Translating...",
      source_info_3:
        "Source: AI Hub (Korea National Information Society Agency), Tourism Food Menu Board Data",
      main_ingredients: "Main Ingredients",
      allergy_info: "Allergy Information",
      menu_select: "Please select a menu",
      menu_select_desc: "Touch the menu text in the image",
      menu_select_desc_2: "Detailed menu information analyzed by AI",
      menu_select_desc_3: "will",
      menu_select_desc_4: "be displayed",
      new_start: "Start New",
      // 파일 선택 관련 번역
      file_select: "File Select",
      no_file_selected: "No file selected",
      // 안내 문구
      disclaimer:
        "※ The provided information is for reference only. For accurate information about ingredients, allergies, and other menu details, please contact the restaurant!",
      file_selected: "Selected file",
    },
    cultureGuide: {
      greeting: "Greeting Etiquette",
      greeting_content:
        "In Korea, greet older people first and bow your head when greeting.",
      greeting_extra:
        "Usually a light nod is sufficient, and shaking hands with both hands appears more polite.",
      greeting_modal_title: "Korean Honorifics and Basic Greeting Expressions",
      greeting_modal_paragraphs:
        "Korea has honorifics and informal speech, so greeting expressions vary depending on the situation.",
      greeting_modal_paragraphs_2:
        "Friends say 'annyeong' to each other, but you must say 'annyeonghaseyo' to adults or people you meet for the first time to be polite.",
      greeting_modal_list_1: "안녕하세요 (Daily honorific)",
      greeting_modal_list_2: "안녕하십니까 (Formal)",
      greeting_modal_list_3: "안녕 (Close friends, informal)",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워 (Thank you)",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해 (Sorry)",
      greeting_modal_link_1: "How to greet Korean people",
      meal: "Dining Etiquette",
      meal_content:
        "Adults pick up utensils first, don't hold the rice bowl while eating. Receive alcohol with both hands.",
      meal_extra:
        "After finishing your meal, it's polite to place chopsticks neatly on the bowl.",
      meal_modal_title: "Korean Dining Etiquette",
      meal_modal_paragraphs:
        "In Korea, dining is not just about eating food but an important occasion to respect others.",
      meal_modal_paragraphs_2:
        "Before eating, say 'jal meokgesseumnida' (I will eat well), and after eating, say 'jal meogeosseumnida' (I ate well), which shows respect for both the person who prepared the food and those who shared the meal.",
      meal_modal_list_1: "Elders or guests sit first when taking seats.",
      meal_modal_list_2: "Don't stick chopsticks into the rice bowl.",
      meal_modal_list_3: "When drinking alcohol, turn your head slightly.",
      meal_modal_list_4:
        "Chewing loudly or pointing at people with chopsticks is impolite.",
      meal_modal_list_5: "Place bowls on the table and eat.",
      meal_modal_link_1: "Korean dining etiquette",
      transportation: "Public Transportation",
      transportation_content:
        "Give up priority seats on the subway and don't talk loudly on the phone.",
      transportation_extra:
        "During rush hours, carrying bags in front is a considerate attitude.",
      transportation_modal_title: "Korean Public Transportation",
      transportation_modal_paragraphs:
        "Korean subways and buses are very convenient, but it's important to follow seat and behavior etiquette.",
      transportation_modal_paragraphs_2:
        "Especially priority seats and pregnant women's seats are confusing for foreigners - it's common culture not to sit even if they're empty.",
      transportation_modal_list_1:
        "Priority seats are for elderly, disabled, and pregnant women only - young people don't use them.",
      transportation_modal_list_2:
        "Pregnant women's seats (pink seats) are kept empty so pregnant women can use them anytime.",
      transportation_modal_list_3:
        "Don't talk loudly on public transportation.",
      transportation_modal_list_4:
        "Carry bags in front or put them down to be considerate of other passengers.",
      transportation_modal_list_5:
        "When boarding, let passengers exit first, then board in order.",
      transportation_modal_link_1: "Using Korean public transportation",
      transportation_modal_link_2: "Using Seoul subway",
      tip: "Tipping Culture",
      tip_content:
        "Korea has no tipping culture. Service charges are already included.",
      tip_extra:
        "Some hotels in tourist areas may accept small tips as an exception, but it's not mandatory.",
      tip_modal_title: "Korean Tipping Culture",
      tip_modal_paragraphs:
        "Korea's tipping culture is very different from the West and barely exists.",
      tip_modal_list_1: "Restaurants/Cafes: No tip needed",
      tip_modal_list_2: "Taxis: Pay only the set fare",
      tip_modal_list_3: "Hair salons/Massage services: No tipping culture",
      footwear: "Removing Shoes",
      footwear_content:
        "In Korean homes or some restaurants, you take off your shoes before entering.",
      footwear_extra:
        "Shoe cabinets are usually at the entrance, and indoor slippers are often prepared.",
      footwear_modal_title: "Korean Shoe Removal Culture",
      footwear_modal_paragraphs:
        "In Korea, removing shoes when entering homes is a natural cultural practice.",
      footwear_modal_paragraphs_2:
        "This is a traditional habit to keep the interior clean and protect family health.",
      footwear_modal_paragraphs_3:
        "Indoors, people often wear slippers instead of shoes or just socks.",
      footwear_modal_list_1: "Homes: Remove shoes at the entrance",
      footwear_modal_list_2:
        "Traditional Korean restaurants/Hanok: Often remove shoes due to floor seating structure",
      gift: "Gift Etiquette",
      gift_content:
        "When receiving gifts, accept them with both hands and don't open them immediately.",
      gift_extra:
        "Especially for adults or superiors, alcohol, health foods, and tea are safe gift choices.",
      gift_modal_title: "Korean Gift Etiquette",
      gift_modal_paragraphs:
        "In Korea, gifts carry meaning of relationship and respect, not just objects.",
      gift_modal_paragraphs_2:
        "When giving and receiving gifts, you must use both hands as etiquette.",
      gift_modal_list_1: "Give and receive with both hands",
      gift_modal_list_2:
        "Exchange gifts in various situations like holidays, housewarming, gratitude",
    },
    directions: {
      days: "Day",
      add_recommended_course: "Added recommended course to",
      delete_day: "Delete this day?",
      search_start: "Search departure point",
      search_end: "Search destination",
      search_waypoint: "Search waypoint",
      route_planner: "Route Planner",
      calculate_route: "Calculate Route",
      calculating_route: "Calculating route...",
      save_route: "Save Route",
      more: "More",
      duplicate_day: "Duplicate Day",
      add_day_menu: "Add Day Menu",
      add_day: "Add New Day",
      add_recommended_course: "Add Recommended Course",
      set_start: "Set departure point",
      set_end: "Set destination",
      add_waypoint: "Add Waypoint",
      remove_waypoint: "Remove Waypoint",
      add_waypoint_description:
        "Adding waypoints allows you to create more precise routes.",
      map_provider: "Map Provider",
      kakao_map: "Kakao Map",
      t_map: "T Map",
      car: "Car",
      pedestrian: "Walking",
      transit: "Public Transit",
      transportation_mode: "Transportation Mode",
      route_order_adjustment: "Route Order Adjustment",
      drag_to_adjust_order: "Drag to change order",
      start: "Start",
      end: "End",
      waypoint: "Waypoint",
      add_start: "Add Start Point",
      add_end: "Add End Point",
      add_waypoint: "Add Waypoint",
      select_start: "Select departure point",
      select_end: "Select destination",
      select_waypoint: "Select waypoint",
      travel_summary: "Travel Summary",
      total_distance: "Total Distance",
      estimated_duration: "Estimated Duration",
      minutes: "minutes",
      stay_time: "Stay Time (minutes)",
      load_recommended_course: "Load Recommended Course",
      load_recommended_course_description:
        "Select a course to add as a new day.",
      loading_recommended_course: "Loading recommended course...",
      load_recommended_course_failed: "Failed to load recommended course.",
      try_again: "Try Again",
      no_recommended_course: "No recommended courses available.",
      stops: "places",
      keyword_input: "Enter keyword",
      search_result_select_place: "Select a place from the search results",
      waypoint_added: "Waypoint will be added.",
      start_set: "Departure point will be set.",
      end_set: "Destination will be set.",
    },
    playlists: {
      title: "K-pop Travel Playlist",
      description:
        "Log in to Spotify and create AI-generated playlists. Experience it now! ✨",
      login: "Spotify Login",
      my_playlist: "My Playlist",
      playlist_preview: "Playlist Preview",
      your_playlist: "Your own special playlist created by AI",
      make_playlist: "Create your own playlist after logging in to Spotify",
      preview: "Preview",
      create_playlist: "Create Your First Playlist",
      create_playlist_description:
        "AI creates a perfect K-pop playlist tailored for you",
      start_now: "Start Now",
      create_new_playlist: "Create New Playlist",
      create_new_playlist_description:
        "Create a new playlist with different themes or artists",
      featured_youtube_mix: "Featured YouTube Mix",
      latest_k_pop_travel_playlists:
        "Latest K-pop travel playlists curated for your journey",
      view_full_playlist: "View Full Playlist",
      create_your_own_playlist: "Create Your Own Playlist",
      create_your_own_playlist_description:
        "AI generates the perfect K-pop playlist that matches your taste and travel theme. Find the optimal combination from thousands of songs and save directly to Spotify.",
      ai_custom_recommend: "AI Custom Recommendation",
      unlimited_creation: "Unlimited Creation",
      spotify_auto_save: "Spotify Auto Save",
      themes1: "City Travel",
      themes1_desc: "Energetic K-pop for vibrant urban exploration",
      themes2: "Summer Vacation",
      themes2_desc:
        "Refreshing music that captures cool ocean breezes and warm sunshine",
      themes3: "Night Market",
      themes3_desc: "Exciting night street vibes under colorful neon signs",
      themes4: "Peaceful Travel",
      themes4_desc: "Calm and emotional melodies that soothe the mind",
      themes5: "Exercise/Workout",
      themes5_desc:
        "Powerful music with intense beats to maximize workout effects",
      themes6: "Cafe/Reading",
      themes6_desc: "Calm and sophisticated acoustic sounds that enhance focus",
      kpop_artists1: "4th Gen Girl Groups",
      kpop_artists2: "4th Gen Boy Groups",
      kpop_artists3: "3rd Gen Legends",
      kpop_artists4: "Solo Artists",
      mock_playlists1: "Seoul City Vibes",
      mock_playlists1_desc:
        "Urban K-pop perfect for exploring Seoul's city center",
      mock_playlists2: "Summer Breeze",
      mock_playlists2_desc: "Refreshing summer vacation K-pop",
      play: "Play",
    },
    DocentMantine: {
      title: "AI Docent",
      subtitle: "Real-time location guide",
      aiDocent: "AI Docent",
      stopVoice: "Stop voice",
      current: "Current location",
      directions: "Directions",
      chatbot: "Tourism Chatbot",
      askQuestion: "Ask me anything",
      send: "Send",
      examples: {
        title: "Example questions:",
        items: [
          "K-pop Demon Hunters filming locations",
          "Myeongdong restaurant recommendations",
          "Bukchon Hanok Village info",
          "Squid Game filming locations",
        ],
      },
      chatbotPlaceholder: "Ask me anything...",
      chatbotInitialMessage:
        "Hello! I am your AI travel docent. Ask me about places or travel information. You can also send a photo for a detailed explanation of the location!",
      imageQueryText: "Tell me about this place",
      voiceRecStart: "Starting voice recording...",
      voiceRecResult: "Voice recognition result:",
      voiceRecStop: "Stopping voice recording.",
      errorReply:
        "Sorry, an error occurred while generating a response. Please try again later.",
      filePick: "File",
      categories: {
        all: "All",
        museum: "Museum",
        palace: "Palace",
        landmark: "Landmark",
        historic: "Historic",
      },
      allTourismSpots: "All Tourism Spots",
      detailedInfo: "Detailed Information",
      tourismList: "Tourism List",
      locationTracking: "Location Tracking",
      location: "Location",
      voiceGuide: "Voice Guide",
      tourDetection: {
        message:
          "🎯 I see you're asking about tours! Professional guided tour services and custom course recommendations are available on our tour page.",
        buttonText: "🎯 Go to Tour Service Page",
      },
      viewDetails: "📝 View Details",
      selectPlace: "Select a place",
    },
    planner: {
      new_activity: "New Activity",
      no_saved_plans: "No saved travel plans.",
      create_or_modify_plan:
        "Create a new plan or modify an existing plan to manage.",
      new_plan: "New Trip",
      places: "Places",
      days: "Days",
      load_plan: "Load This Plan",
      delete_plan: "Delete This Plan",
      login_to_start_plan: "Please log in to start planning your trip.",
      login: "Login",
      creating_sample_plan: "Creating sample trip...",
      no_plan: "No travel plan.",
      create_sample_plan: "Create Sample Trip",
      saved_schedule: "Saved Schedule",
      travel_planner: "Travel Itinerary Planner",
      saving: "Saving...",
      travel_plan: "Travel Plan",
      saved_plans: "Saved Plans",
      activity_editor: "Activity Editor",
      time_info: "Time Information",
      time: "Time",
      stay_time: "Stay Duration (minutes)",
      place_info: "Place Information",
      place_name: "Place Name",
      search_place_placeholder:
        "Enter search terms to get place recommendations",
      place_type: "Place Type",
      road_address: "Road Address",
      address: "Address",
      latitude: "Latitude",
      longitude: "Longitude",
      additional_info: "Additional Information",
      description: "Description",
      description_placeholder: "Enter notes related to the activity",
      cost_estimate: "Estimated Cost (KRW)",
      cancel: "Cancel",
      save: "Save",
      add_activity: "Add Activity",
      day: "Day",
      activity: "Activity",
      transport: "Transport",
      total_days_travel: "Total {{days}} days travel",
    },
    data: {
      live_info: "Live Info",
      now: "Now",
      is: " is",
      data_update: "Data Update",
      real_time_population: "Real-time Population",
      about: "About",
      people: " people",
      real_time_commercial: "Real-time Commercial",
      overall_commercial: "Overall Commercial",
      subway_arrival_info: "Subway Arrival Info",
      recommended_tour_products: "Recommended Tour Products",
      nearby_cultural_events: "Nearby Cultural Events",
      traffic_conditions: "Traffic Conditions",
      weather: "Weather",
      humidity: "Humidity",
      wind_speed: "Wind Speed",
      precipitation: "Precipitation",
      feels_like: "Feels Like",
    },
    mypage: {
      mypage: "My Page",
      mypage_description:
        "Organize travel itineraries and memories with Klover",
      logout: "Logout",
      saved_travel_plans: "Saved Travel Plans",
      liked_travel_products: "Liked Travel Products",
      my_posts: "My Posts",
      liked_posts: "Liked Posts",
      travel_plans: "Travel Plans",
      travel_products: "Travel Products",
      likes: "Likes",
      loading_travel_plans: "Loading travel plans...",
      no_saved_travel_plans: "No saved travel plans",
      create_travel_plan_message: "Create and save your travel plan!",
      no_liked_products: "No liked travel products",
      like_products_message: "Like travel products you're interested in!",
      loading: "Loading...",
      no_posts_written: "No posts written",
      write_first_post: "Write your first post!",
      no_liked_posts: "No liked posts",
      like_posts_message: "Like posts you find interesting!",
      delete: "Delete",
      travel_plan: "Travel Plan",
      destination_undecided: "Destination Undecided",
      day_schedule: "-day schedule",
      saved: "Saved",
      last_updated: "Last Updated",
      loading_details: "Loading details...",
      time_undecided: "Time Undecided",
      activity: "Activity",
      no_registered_activities: "No registered activities",
      no_saved_schedule_info: "No saved schedule information",
      alert_mypage_h: "Login Required",
      alert_mypage_1: "Please log in to access your My Page.",
      alert_mypage_2: "Sign in quickly with your social account",
    },
  },
  ja: {
    tour: {
      header: {
        klover: "Klover",
        tour: "ツアー",
        subtitle: "プレミアムパーソナルツアー",
      },
      list: { title: "K-lover ツアー" },
      search: { placeholder: "ツアーを検索..." },
      categories: {
        all: "すべて",
        experience: "体験",
        it: "IT",
        sports: "スポーツ",
        beauty: "ビューティー",
        culture: "歴史",
      },
      pagination: { prev: "前へ", next: "次へ" },
      empty: {
        title: "結果がありません",
        description: "他の検索語やフィルターをお試しください。",
      },
      partners: { title: "提携パートナー", subtitle: "信頼できるパートナー" },
    },
    tourDetail: {
      products: {
        1: {
          title: "Netflix x Interpark Global",
          description:
            "エバーランド自由利用券付き Kpop Demon Hunters テーマツアー。",
          location: "ソウル江南区 → 龍仁エバーランド",
        },
        2: {
          title: "Microsoft AI Tour Seoul",
          description: "Microsoft AI Tour Seoul - AI技術と文化財復元の出会い。",
          location: "ソウル中区",
        },
        3: {
          title: "漢江バス X インスタグラム ソウルホットプレイスツアー",
          description:
            "漢江バスに乗ってソウルの代表的なフォトスポットやインスタ映えスポットを巡る感性ツアー。",
          location: "漢江全区間",
        },
        4: {
          title: "LGツインズ 野球観戦",
          description:
            "蚕室野球場プレミアム観覧 + チキン＆ビール + スポーツ体験。",
          location: "ソウル松坡区（蚕室観光特区）",
        },
        5: {
          title: "K-ビューティー X OLIVE YOUNG プレミアムビューティーツアー",
          description:
            "皮膚科ケア + K-ビューティーブランド体験 + OLIVE YOUNGショッピング + 韓方スパ。",
          location: "ソウル江南区",
        },
        6: {
          title: "ソウル伝統文化ツアー",
          description:
            "AIドーセントとカカオフレンズキャラクターが共にする楽しい博物館体験。",
          location: "ソウル鐘路区",
        },
      },
      data: {
        1: {
          title:
            "K-POPデーモンハンターズ × エバーランド スペシャルコラボツアー",
          subtitle:
            "Netflixオリジナルシリーズ × 韓国代表テーマパークの完璧なコラボレーション。",
          location: "エバーランド、駱山公園、Nソウルタワー、国立中央博物館",
          duration: "10時間（エバーランド入場券付き）",
          groupSize: "最大12名",
          language: "韓国語、英語、中国語",
          partnership: {
            primary: "NETFLIX",
            secondary: "Samsung Everland",
            tertiary: "ソウル観光財団",
          },
          specialFeatures: [
            "エバーランド1日自由利用券付き",
            "K-POPデーモンハンターズ限定グッズセット",
            "ARフォトゾーン無制限利用",
            "ドラマOSTプレイリスト提供",
            "撮影地ガイドオーディオツアー",
          ],
          itinerary: [
            {
              time: "08:30",
              location: "江南駅集合",
              description: "専用バス乗車およびツアーブリーフィング",
              duration: "30分",
            },
            {
              time: "09:30",
              location: "エバーランド入場",
              description: "K-POPデーモンハンターズテーマゾーン体験開始",
              duration: "4時間",
            },
            {
              time: "10:00",
              location: "デーモンハンターズアトラクション",
              description: "スリルライド「悪魔の追撃戦」体験",
              duration: "45分",
            },
            {
              time: "11:00",
              location: "ルミの魔法学校",
              description: "インタラクティブ魔法体験館 & ARフォトゾーン",
              duration: "60分",
            },
            {
              time: "12:30",
              location: "デーモンハンターズレストラン",
              description: "ドラマテーマのランチセット & 限定デザート",
              duration: "90分",
            },
            {
              time: "14:00",
              location: "駱山公園へ移動",
              description: "ルミ♥ジヌのデートシーン撮影地再現",
              duration: "90分",
            },
            {
              time: "16:00",
              location: "Nソウルタワー",
              description: "最終ボスバトル撮影地 & 展望台観覧",
              duration: "120分",
            },
            {
              time: "18:00",
              location: "国立中央博物館",
              description: "古代遺物エピソード撮影地ツアー",
              duration: "60分",
            },
          ],
          detailSections: [
            {
              title: "エバーランド X K-POPデーモンハンターズ テーマゾーン",
              text: "世界初公開のK-POPデーモンハンターズテーマゾーンで、ドラマのスリリングなアクションを直接体験してください。ルミの魔法学校、ジヌのトレーニングセンター、悪魔退治ミッションまで完璧に再現された没入型アトラクションがあなたを待っています。",
            },
            {
              title: "駱山公園 ロマンチックデートシーン再現",
              text: "ドラマで最も印象的だったルミとジヌのデートシーンを駱山公園で直接再現してみてください。ソウルの都心の景色と共にドラマチックなフォトタイムを楽しめ、専用フォトグラファーが最高のショットを提供します。",
            },
            {
              title: "Nソウルタワー 最終決戦の舞台",
              text: "シーズンフィナーレを飾ったNソウルタワーでの最終ボスバトルをVRで体験し、ドラマの主人公になった気分でソウルの夜景を鑑賞してください。限定版カップルロッカー体験も含まれています。",
            },
          ],
          inclusions: [
            "エバーランド1日自由利用券",
            "専用ツアーバス往復交通",
            "K-POPデーモンハンターズグッズセット",
            "ドラマテーマのランチ＆デザート",
            "専門ガイドサービス",
            "Nソウルタワー展望台入場料",
            "ARフォトゾーン利用券",
            "記念品ショップ10%割引クーポン",
          ],
          exclusions: [
            "個人でのショッピング費用",
            "追加のアトラクション利用料",
            "旅行者保険",
            "個人的な軽食や飲み物",
          ],
        },
        2: {
          title: "マイクロソフト AI ツアー ソウル",
          subtitle: "AI技術と文化財復元の出会い",
          location: "ソウル中区マイクロソフトコリア",
          duration: "4時間",
          groupSize: "最大20名",
          language: "韓国語、英語",
          partnership: { primary: "Microsoft Korea", secondary: "国家遺産庁" },
          itinerary: [
            {
              time: "09:00",
              location: "マイクロソフトコリアオフィス",
              description: "AI技術紹介およびツアー開始",
            },
            {
              time: "10:00",
              location: "AIデモセンター",
              description: "文化財復元AI技術体験",
            },
            {
              time: "11:30",
              location: "国家遺産庁協力館",
              description: "デジタル文化財復元事例体験",
            },
            {
              time: "13:00",
              location: "マイクロソフトグッズショップ",
              description: "限定版記念品およびAI体験キット",
            },
          ],
          detailSections: [
            {
              title: "マイクロソフトAIカンファレンス2025 - 主要日程",
              text: "サティア・ナデラがソウルで開催されたマイクロソフトAIカンファレンスでAIの未来を紹介します。基調セッション、25の分科会セッション、12の実践ワークショップが含まれた日程で、AI革新と産業変化に関する深い洞察を提供します。",
            },
            {
              title: "マイクロソフトAIカンファレンス2025で学び、繋がる",
              text: "サティア・ナデラが紹介する参加者は、AI革新に関する業界リーダーの洞察を得て、クラウド、AI、セキュリティの最新技術を探求します。また、マイクロソフトの役員と繋がり、専門家との1対1の討論を行い、ダイナミックなコミュニティセッションを通じてネットワークを拡大する機会を提供します。",
            },
            {
              title: "マイクロソフトAIカンファレンス - ライブセッション",
              text: "マイクロソフトAIカンファレンスで、観客がAIの未来に関する基調講演を聞くために集まります。",
            },
          ],
          inclusions: [
            "専門家によるガイドツアー",
            "AI技術体験セッション",
            "限定記念品",
            "ネットワーキングの機会",
          ],
          exclusions: ["交通費", "食事", "個人的な費用"],
        },
        3: {
          title: "漢江バス X インスタグラム ソウルホットプレイスツアー",
          subtitle:
            "漢江に沿って広がるソウルの代表的なフォトスポットを完全制覇",
          location: "漢江公園（汝矣島-蚕室-盤浦-麻浦）",
          duration: "3.5時間",
          groupSize: "最大25名",
          language: "韓国語、英語",
          partnership: { primary: "ソウル観光財団", secondary: "漢江事業本部" },
          itinerary: [
            {
              time: "15:00",
              location: "汝矣島漢江公園",
              description: "ツアー開始およびインスタグラムフォトのコツ講座",
            },
            {
              time: "15:30",
              location: "漢江バス（汝矣島→蚕室）",
              description: "63ビル＆IFCモールを背景にバス内撮影",
            },
            {
              time: "16:00",
              location: "蚕室ロッテワールドタワーフォトゾーン",
              description: "ソウルスカイライン代表認証ショット撮影",
            },
            {
              time: "16:45",
              location: "漢江バス（蚕室→盤浦）",
              description: "漢江クルーズ感性の動画撮影",
            },
            {
              time: "17:15",
              location: "盤浦虹の噴水",
              description: "ゴールデンアワーの虹の噴水タイムラプス撮影",
            },
            {
              time: "18:00",
              location: "セピッソムLEDショー",
              description: "夜景花火および団体記念撮影",
            },
          ],
          detailSections: [
            {
              title: "汝矣島漢江公園ツアー",
              text: "ソウルの都心にある休息の空間、汝矣島漢江公園でレンタル自転車に乗って川沿いを走り、涼しい風を感じてみてください。青々とした芝生の上でゆったりとしたピクニックを楽しみながら、漢江とスカイラインが調和した特別な風景を鑑賞できます。",
            },
            {
              title: "盤浦虹の噴水ツアー",
              text: "世界で最も長い橋梁噴水としてギネスブックに登録された盤浦虹の噴水は、漢江の名所です。昼には涼しげな水しぶきが、夜には色とりどりの照明と音楽が調和し、ロマンチックな雰囲気を演出し、ソウルの夜景を楽しむのに最高の場所として知られています。",
            },
            {
              title: "セピッソム（フローティングアイランド）ツアー",
              text: "世界初の人工浮島であるセピッソムは、「ガピッ」、「チェピッ」、「ソルピッ」の3つの島からなる複合文化空間です。展示や公演、イベントが開催され、レストランやカフェで漢江を眺めながら特別な食事を楽しめます。特に夜になるとLED照明が島全体を彩り、ソウルの代表的な夜景スポットとして有名です。ヨットやボート体験も可能で、一味違った楽しみを提供します。",
            },
          ],
          inclusions: [
            "漢江バス乗車券",
            "プロフォトグラファーガイド",
            "記念写真撮影および編集サービス",
            "飲み物および軽食",
          ],
          exclusions: ["個人用カメラ機材", "食事代", "追加アクティビティ費用"],
        },
        4: {
          title: "LGツインズ プレミアム野球観戦ツアー",
          subtitle: "蚕室野球場で楽しむ完璧な野球体験",
          location: "蚕室野球場、ロッテワールドタワー",
          duration: "6時間",
          groupSize: "最大25名",
          language: "韓国語、英語、日本語",
          partnership: { primary: "LGツインズ", secondary: "キョチョンチキン" },
          itinerary: [
            {
              time: "14:00",
              location: "蚕室駅2番出口",
              description: "ツアー開始および野球文化紹介",
            },
            {
              time: "15:00",
              location: "LGツインズファンショップ",
              description: "ユニフォーム着用および応援グッズ準備",
            },
            {
              time: "18:00",
              location: "キョチョンチキンプレミアムボックス席",
              description: "チキン＆ビールと共に試合観戦",
            },
            {
              time: "20:00",
              location: "フォトゾーン",
              description: "球場を背景に記念スナップ写真ツアー",
            },
          ],
          detailSections: [
            {
              title: "蚕室野球試合",
              text: "ソウルの代表的なスポーツ名所、蚕室野球場はLGツインズと斗山ベアーズのホーム球場で、韓国プロ野球の熱気を最も近くで感じられる場所です。3万人以上を収容できる大規模な球場で、応援歌と応援棒が作り出す独特の雰囲気は、韓国プロ野球ならではの魅力を伝えます。特にLGツインズファンの情熱的な応援は、蚕室野球場を訪れる人々に忘れられない経験を提供します。",
            },
            {
              title: "LGツインズ",
              text: "ソウルで開かれたLGツインズの野球試合で、外国人観光客が情熱的に応援し、現場の雰囲気を楽しんでいます。チアリーダー式の応援文化と共にある韓国プロ野球は、ユニークな観光コースとして、国際的な観光客に特別な思い出を提供します。",
            },
          ],
          inclusions: [
            "野球試合プレミアム席チケット",
            "チキンとビールのセット",
            "LGツインズ応援グッズ",
            "専門ガイド",
          ],
          exclusions: ["追加の食べ物や飲み物", "個人のお土産購入", "交通費"],
        },
        5: {
          title: "K-ビューティー＆ウェルネス プレミアムツアー",
          subtitle:
            "韓国最高のビューティー技術と伝統ウェルネスの完璧な組み合わせ",
          location: "江南区（狎鴎亭-清潭-新沙洞一帯）",
          duration: "6時間",
          groupSize: "最大12名",
          language: "韓国語、英語、中国語、日本語",
          partnership: { primary: "OLIVE YOUNG", secondary: "江南皮膚科協会" },
          itinerary: [
            {
              time: "10:00",
              location: "パーソナルカラー診断",
              description: "パーソナルカラー診断＋カスタムメイク提案",
            },
            {
              time: "11:00",
              location: "狎鴎亭プレミアム皮膚科",
              description: "肌分析＋ハイドラフェイシャルケア（30分）",
            },
            {
              time: "13:00",
              location: "清潭洞の韓国料理レストラン",
              description: "肌に良い韓方薬膳ランチ",
            },
            {
              time: "14:30",
              location: "新沙洞K-ビューティー体験館",
              description: "雪花秀、后などブランド別カスタムケア体験",
            },
            {
              time: "15:30",
              location: "狎鴎亭伝統韓方スパ",
              description: "黄土サウナ＋アロママッサージ（90分）",
            },
            {
              time: "17:30",
              location: "OLIVE YOUNG VIPショッピング",
              description: "パーソナル製品推薦＋免税ショッピング",
            },
          ],
          partnershipBenefits: [
            {
              icon: "Award",
              title: "プレミアムスキンケア",
              description: "江南の一流皮膚科でのハイドラフェイシャル＋肌分析",
              value: "施術価格 ₩150,000",
            },
            {
              icon: "Gift",
              title: "K-ビューティーグッズバッグ",
              description:
                "雪花秀、后、イニスフリーなど人気ブランドのサンプルキット",
              value: "₩80,000相当",
            },
            {
              icon: "Play",
              title: "韓方ウェルネススパ",
              description: "黄土サウナ＋伝統アロママッサージ90分",
              value: "₩120,000相当",
            },
          ],
          detailSections: [
            {
              title: "K-ビューティー パーソナルカラー診断体験",
              text: "韓国ビューティートレンドの核心、パーソナルカラー診断を通じて、自分のイメージに最も似合う色を見つけてみましょう。専門コンサルタントが肌のトーンや雰囲気に合ったカラーを分析し、メイクやファッションスタイリングに実質的な助けとなります。外国人訪問者には、韓国のK-ビューティー文化を直接体験し、自分だけの新しい魅力を発見できる特別な時間となります。",
            },
            {
              title: "K-ビューティー in OLIVE YOUNG",
              text: "K-ビューティーに興味のある外国人観光客のために企画されたOLIVE YOUNGショッピング体験ツアーです。単なる店舗訪問を超え、トレンドを最もよく知るパーソナルショッパーが同行し、カスタマイズされたショッピングをサポートします。グローバルなファンに愛されるK-POPアーティストのビューティーアイテム、SNSで話題のホットアイテムまで、現場で直接推薦されて購入できます。",
            },
            {
              title: "韓国の皮膚科",
              text: "最先端の設備と専門医療スタッフで有名な韓国の皮膚科は、美容・皮膚治療分野で世界的に認められています。外国人訪問者は、ニキビ・シミの管理からレーザー施術、スキンケアプログラムまで、個人に合わせた診療を通じてK-ビューティーの医療サービスを直接体験できます。安全で丁寧な診療と共に、韓国ならではのビューティー・ヘルスケア文化を体験できる特別な機会です。",
            },
          ],
          inclusions: [
            "パーソナルカラー診断",
            "プレミアムスキンケアトリートメント",
            "韓方スパ体験",
            "K-ビューティーグッズバッグ",
            "専門ビューティーガイド",
            "昼食",
          ],
          exclusions: ["追加の施術費用", "個人でのショッピング費用", "交通費"],
        },
        6: {
          title: "ソウル伝統文化ツアー",
          subtitle:
            "景福宮で韓国の王室文化を感じ、仁寺洞で茶道を通じて伝統の趣を体験し、広蔵市場で地元の味を楽しむ特別な一日。",
          location: "ソウル鐘路区一帯",
          duration: "4.5時間",
          groupSize: "最大6名",
          language: "韓国語、英語、中国語",
          partnership: { primary: "ソウル特別市", secondary: "ハナツアー" },
          itinerary: [
            {
              time: "10:00",
              location: "景福宮入口",
              description: "韓服レンタル後、景福宮観覧、旅行スナップ撮影",
            },
            {
              time: "12:00",
              location: "伝統韓定食ランチ",
              description: "伝統的な韓国料理レストランで昼食",
            },
            {
              time: "14:30",
              location: "仁寺洞茶道体験＆伝統通り散策",
              description:
                "伝統的な茶屋で茶道体験、伝統工芸品、印鑑、韓紙のお土産探し",
            },
            {
              time: "17:00",
              location: "広蔵市場伝統食べ物ツアー",
              description:
                "ピンデトッ、麻薬キンパ、ユッケなど、地元で人気の食べ物を試食",
            },
            {
              time: "19:00",
              location: "清渓川夜景散策",
              description: "漢江に続く清渓川を散策",
            },
          ],
          detailSections: [
            {
              title: "景福宮旅行スナップ",
              text: "ソウルを代表する宮殿、景福宮でプロのカメラマンと一緒に旅行スナップを撮影してみましょう。韓服を着て、古宮の壮大な殿閣や静かな庭園を背景に特別な瞬間を記録できます。伝統と現代が調和した景福宮の魅力は、忘れられない旅の思い出となります。",
            },
            {
              title: "仁寺洞茶道体験",
              text: "ソウルの伝統的な街、仁寺洞の静かな茶屋で韓国式の茶道を体験してみましょう。専門家の案内のもと、伝統的なお茶とお菓子を味わいながら、韓国の茶文化の深さを感じることができます。",
            },
            {
              title: "広蔵市場食べ物ツアー",
              text: "ソウルで最も活気のある伝統市場の一つである広蔵市場で、韓国の代表的な食べ物を楽しんでみましょう。サクサクのピンデトッ、麻薬キンパ、ユッケなど、地元の人々や外国人に愛されるさまざまなストリートフードを味わうことができます。",
            },
          ],
          inclusions: [
            "韓服レンタル",
            "景福宮入場料",
            "茶道体験",
            "広蔵市場での食べ物試食",
            "専門ガイド",
            "旅行スナップ写真",
          ],
          exclusions: ["昼食代", "個人のお土産購入", "交通費"],
        },
      },
      offer: {
        expiresIn: "終了までの時間",
        limitedTime: "⏳ 期間限定オファー",
        doNotShowToday: "今日は表示しない",
        grabDeal: "今すぐ獲得",
        grabbed: "確定",
        dealGrabbed: "ディールが確定しました！",
        priceSecured: "現在の価格がしばらく保証されます",
        urgencyText: "お急ぎください！残り {{minutes}}分 {{seconds}}秒",
      },
      booking: {
        bookNow: "今すぐ予約",
        reviews: "件のレビュー",
        discount: "割引",
      },
      tabs: {
        overview: "日程",
        details: "詳細",
        reviews: "レビュー",
      },
      overview: {
        itinerary: "日程",
        noItinerary: "日程情報がありません",
        included: "含まれるもの",
        notIncluded: "含まれないもの",
      },
      details: {
        noDetails: "詳細情報がありません",
        specialFeatures: "特別特典",
        partnershipBenefits: "提携特典",
      },
      reviews: {
        noReviews: "レビューはまだありません",
        verifiedPurchase: "認証済み購入",
      },
      notFound: {
        title: "ツアーが見つかりません",
        description: "リクエストされたツアー情報を読み込めませんでした。",
      },
    },
    common: {
      community: {
        info_reviews_label: "情報 & レビュー",
        info_reviews_desc: "旅行情報とレビューを共有するスペース",
        labels: {
          notice: "お知らせ",
          editors_pick: "Klover's Pick",
          popular_destinations: "人気の旅行先",
        },
        search_placeholder: "検索...",
        live_areas: {
          gangnam: "江南",
          gwanghwamun: "光化門",
          myeongdong: "明洞",
          seoul_station: "ソウル駅",
          itaewon: "梨泰院",
          jamsil: "蚕室",
          jongno: "鍾路・清渓",
          hongdae: "弘大",
        },
        info: {
          posts: {
            10001: {
              title: "✈️ ソウル都心空港ターミナル スマート利用ガイド",
              content:
                "出発前に都心でチェックイン・手荷物預け・出国審査を完了！ソウル駅/光明駅CATの営業時間・サービス・注意事項を案内。",
            },
            10002: {
              title: "🎆 2025 ソウル世界花火祭 開催案内",
              content:
                "2025年10月4日(土) 19:30〜21:00、汝矣島漢江公園一帯で開催。観覧ポイントや交通情報をチェック。",
            },
            10003: {
              title: "🌟 2025年秋夕期間 ソウル地下鉄の終電繰り上げ",
              content:
                "秋夕期間、地下鉄1〜9号線は23:00まで短縮運行。詳細はソウル交通公社HPをご確認ください。",
            },
            1001: {
              title: "K‑pop デーモンハンターズ 3日間ソウル巡礼コース",
              content:
                "作品の舞台となった名所を3日で巡るルート。1日目: 江南/三成、2日目: 漢江/弘大、3日目: 光化門/益善洞/駱山。旅のコツ付き。",
            },
            1002: {
              title:
                "K-Popアイドルみたいに食べよう！🎤✨ ソウルグルメ完全ガイド",
              content:
                "好きなアイドルと同じ空間で同じメニューを...想像するだけでワクワクしませんか？編集者が直接足を運んで調べたアイドルの本当の常連店リストを公開します！📍\n\nTVで話題のあの店\n🥖 Pachamama Bakery | 龍山HYBE近く\nLE SSERAFIMが「ザ・マネージャー」で絶賛したあのベーカリー！塩パンとピスタチオスライスは必注アイテム。HYBE見学後に立ち寄れば一石二鳥 ✨\n\n🥩 クムドジシクタン | ミシュラン ビブグルマン\nZB1、BTS、EXOが常連なのには理由がありました。バジルサムに厚いサムギョプサルを乗せて食べると...言葉はいりません 🤤\n\nSNSで話題のあの場所\n🍈 アソット | 乙支路\naespaウィンターがバブルで認証したメロンパン専門店！2024年オープン後、今でも人気継続中。バニラクリームメロンパン強力おすすめ 💛\n\n🌿 カフェ スモッグムト | 江南\nSEVENTEEN ミンギュの虹階段インスタフォトゾーンで有名。都心の自然親和的な雰囲気でヒーリングタイムを過ごしてください 🌈\n\n🍦 ヨアジョン | 全国店舗\nRIIZE ソンチャンの組み合わせレシピで有名になったヨーグルトアイスクリーム。ゴールドマンゴー+ハニーコム+シャインマスカットの組み合わせは本当においしいです（編集者も認める！）\n\n🍩 ピルマベーカリー | 安国\nTWICE サナのスーパーアールグレイドーナツ。甘くない濃いアールグレイクリームがポイント！（テイクアウトのみ）\n\nファンの聖地巡礼必須コース\n🐑 Lamb NIKUYA | 屯村2号店\nStray Kids、DAY6メンバーのサインとポストイットが満載！V-Live撮影地としても有名\n\n🥩 コプチャンパヌンゴギジプ\nSEVENTEEN ゴーイングセブンティーン撮影地。キャラットセットメニューと誕生日イベントまで！本当のファンなら必須訪問 📸\n\n🎯 スヒョン編集者のTips！\n\n江南ライン：スモッグムト → Sunday Burger Club → アガジェラート\n\n聖水ライン：カフェ パルベン → 聖水ダラク\n\n龍山ライン：Pachamama → アソット\n\n平日午後に訪問すると静かに楽しめます。アイドルと同じメニューを注文して #アイドルグルメツアー ハッシュタグを忘れずに！💜",
            },
          },
        },
      },
      // Home.jsx
      place1: "明洞",
      place2: "光化門",
      place3: "梨泰院",
      place4: "蚕室",
      "features.title1": "AIペルソナ分析",
      "features.title2": "カスタムコース推薦",
      "features.title3": "K-Popプレイリスト",
      "features.title4": "AIドーセント",
      "features.desc1": "5つの質問であなただけの旅行スタイルを発見",
      "features.desc2": "AIがリアルタイムで生成する完璧な旅行ルート",
      "features.desc3": "旅行先別の雰囲気に合ったあなただけのK-Pop音楽",
      "features.desc4": "RAGベースのチャットボットで現地文化を深く体験",
      "stats.label1": "カスタム旅行作成",
      "stats.label2": "満足度",
      "stats.label3": "AIサポート",
      "stats.label4": "平均評価",
      "main.badge": "AIカスタム旅行プランナー",
      "nav.features": "機能",
      "nav.howto": "使い方",
      "nav.community": "コミュニティ",
      "login.welcome": "ようこそ！",
      "login.logout": "ログアウト",
      "login.login": "ログイン",
      "main.title.k_travel": "旅行",
      "main.title.connector": "を",
      "main.title.ai_creates": "AIが作ります",
      "main.subtitle":
        "5つの質問であなただけの旅行スタイルを発見し、K-Popとともに完璧なコースを受け取りましょう。複雑な計画はAIに任せて、あなたは興奮だけを準備してください。",
      "main.start.persona": "ペルソナ分析開始",
      "main.start.start": "開始",
      "now.playing": "Now Playing",
      "main.recommend.spot": "おすすめスポット",
      "main.recommend.spot.name": "弘大K-Popスクエア",
      "main.title.ai_action": "AIが作ります",
      "main.title.experience": "特別な体験",
      "main.subtitle.ai_action":
        "革新的なAI技術で、あなただけの完璧な韓国旅行を設計します。",
      "main.more.view": "詳細を見る",
      "steps.title": "簡単な3ステップで",
      "steps.completion": "完成",
      "steps.step1.title": "ペルソナ分析",
      "steps.step1.description": "5つの質問で旅行スタイルを分析",
      "steps.step2.title": "AIカスタム推薦",
      "steps.step2.description": "分析結果に基づく完璧なコース生成",
      "steps.step3.title": "自由な編集",
      "steps.step3.description": "ドラッグ&ドロップで自分のプラン完成",
      "popular.title": "リアルタイム人気",
      "popular.highlight": "観光地",
      "popular.action.join": "を",
      "popular.action": "を発見",
      "popular.description":
        "他の旅行者が選んだ人気コースをチェックしてみてください",
      "footer.slogan": "AIと一緒に完璧な韓国旅行を体験してください",
      "footer.privacy_policy": "プライバシーポリシー",
      "footer.terms_of_service": "利用規約",
      "footer.customer_center": "カスタマーセンター",
      "footer.partnership": "パートナーシップ",
      "footer.copyright": "© 2024 Klover. All rights reserved.",
      "modal.welcome": "Kloverへようこそ",
      "modal.instruction":
        "AIカスタム旅行プランナーを開始するにはログインしてください",
      "modal.continue_google": "Googleで続行",
      "modal.continue_microsoft": "Microsoftで続行",
      "modal.disclaimer.prefix": "続行することで、",
      "modal.disclaimer.terms": "利用規約",
      "modal.disclaimer.and": "と",
      "modal.disclaimer.privacy": "プライバシーポリシー",
      "modal.disclaimer.suffix": "に同意したものとみなされます。",
      "cta.title": "今こそ、あなたの完璧な旅行を始める時",
      "cta.start": "5つの質問で始める",

      // Home.jsx 추가 번역 키들
      "home.persona.title": "あなただけの旅行ペルソナを発見",
      "home.persona.desc":
        "5つの質問で旅行スタイルを分析し、AIがカスタマイズされたコースを推薦します。",
      "home.persona.cta": "ペルソナ分析開始",
      "home.persona.card1.title": "旅行スタイルは？",
      "home.persona.card1.pill1": "冒険追求型",
      "home.persona.card1.pill2": "余裕満喫型",
      "home.persona.card1.pill3": "計画的探訪型",
      "home.persona.card2.title": "興味のある活動は？",
      "home.persona.card2.pill1": "文化体験",
      "home.persona.card2.pill2": "グルメ探訪",
      "home.persona.card2.pill3": "ショッピング",
      "home.persona.card3.title": "好みの雰囲気は？",
      "home.persona.card3.pill1": "トレンディー",
      "home.persona.card3.pill2": "伝統的",
      "home.persona.card3.pill3": "自然親和的",

      "home.ai_reco.title": "AIが作る完璧な旅行コース",
      "home.ai_reco.desc":
        "個人カスタマイズ分析に基づいて最適な旅行ルートをリアルタイムで生成します。",
      "home.ai_reco.tag1": "リアルタイム生成",
      "home.ai_reco.tag2": "カスタマイズ推薦",
      "home.ai_reco.tag3": "最適経路",
      "home.ai_reco.tag4": "時間効率",
      "home.ai_reco.tag5": "現地情報",

      "home.editing.title": "自由に編集して完成させましょう",
      "home.editing.desc":
        "ドラッグ＆ドロップで旅行日程を自由に修正し、あなただけの完璧なプランを作ってみてください。",

      "home.map.preview_label": "カスタム旅行ルート",

      "home.itinerary.title": "旅行日程",
      "home.itinerary.item1": "景福宮観覧",
      "home.itinerary.item2": "北村韓屋村",
      "home.itinerary.item3": "仁寺洞文化街",
      "home.itinerary.item4": "明洞ショッピング",

      "home.controls.undo": "元に戻す",
      "home.controls.save": "保存",
    },
    QuickTranslator: {
      all: "すべて",
      greeting: "挨拶",
      location: "場所",
      price: "価格",
      help: "ヘルプ",
      transport: "交通",
      food: "食べ物",
      status: "状態",
      payment: "支払い",
      menu: "メニュー",
      language_detection_error: "言語検出中にエラーが発生しました。",
      speech_recognition_error: "音声認識エラー",
      real_time_translator: "リアルタイム翻訳機",
      stop_listening: "音声認識停止",
      processing_listening: "音声認識処理中...",
      start_listening: "音声認識開始",
      listening: "音声を聞いています... 話してください",
      processing_text_conversion: "音声をテキストに変換しています...",
      input_text:
        "翻訳するテキストを入力してください... (言語は自動検出されます)",
      detecting_language: "言語を検出しています...",
      detected_language: "検出された言語",
      translating: "翻訳中...",
      translate: "翻訳",
      translation_results: "翻訳結果",
      listen_to_audio: "音声で聞く",
      frequently_used_expressions: "よく使う表現",
      use: "使用",
      phrases1: "こんにちは",
      phrases2: "ありがとうございます",
      phrases3: "すみません",
      phrases4: "トイレはどこですか？",
      phrases5: "いくらですか？",
      phrases6: "助けてください",
      phrases7: "地下鉄駅はどこですか？",
      phrases8: "美味しいです",
      phrases9: "到着しました",
      phrases10: "カードで支払えますか？",
      phrases11: "領収書をください",
      phrases12: "メニューをください",
      phrases13: "水をください",
      phrases14: "お会計をお願いします",
      phrases15: "持ち帰りにしてください",
    },
    Navigation: {
      persona_analysis: "ペルソナ分析",
      result_dashboard: "結果ダッシュボード",
      itinerary_planner: "旅行計画",
      ai_docent: "AIドーセント",
      community: "コミュニティ",
      tour: "ツアー",
      survival: "サバイバル",
      survival_kit: "サバイバル キット",
      playlists: "プレイリスト",
      menu: "メニュー",
      personalized_travel_planning: "パーソナライズされた旅行計画",
      live_info: "ライブ情報",
      exchange_rate_krw: "為替レート (KRW)",
      seoul_weather: "ソウル天気",
      temp: "気温",
      humidity: "湿度",
      wind: "風",
      refresh_data: "データ更新",
      expand: "展開",
      collapse: "折りたたみ",
      welcome_traveler: "旅行者さん、ようこそ！",
      plan_your_trip_with_ai: "AIと一緒に旅行を計画しましょう",
      log_out: "ログアウト",
      log_in: "ログイン",
    },
    dashboard: {
      edit_route: "ルート編集",
      detail: "詳細",
      checking_login_status: "ログイン状態を確認中...",
      login_required: "ログインが必要です",
      google_login: "Googleでログイン",
      microsoft_login: "Microsoftでログイン",
      no_analysis_result: "分析結果がありません",
      no_analysis_result_description:
        "最近作成されたペルソナ分析結果が見つかりません。新しい旅行計画を再度分析してください。",
      start_analysis: "分析開始",
      login_required_description:
        "旅行ペルソナ分析とおすすめコースを確認するにはログインしてください。",
      your_ai_travel_persona: "あなたのAI旅行ペルソナ",
      analyzing: "分析中...",
      travel_persona: "旅行ペルソナ",
      custom_recommended_spots: "カスタムおすすめスポット",
      custom_recommended_spots_description:
        "あなたのペルソナに合ったソウルの場所をランダムに選んでお見せします。",
      refresh: "更新",
      no_recommended_spots: "おすすめスポットの読み込みに失敗しました。",
      custom_recommended_courses: "カスタムコース",
      course_search_placeholder: "コース名、場所を検索...",
      card_view: "カードビュー",
      list_view: "リストビュー",
      no_recommended_courses:
        "おすすめコースがないか、検索結果が見つかりません。",
      visit_count: "訪問回数",
      stay_period: "滞在期間",
      travel_budget: "旅行予算",
      visit_purpose: "訪問目的",
      interests_activities: "興味・活動",
    },
    persona: {
      choice: "選択",
      checking_login_status: "ログイン状態を確認中...",
      login_required: "ログインが必要です",
      login_required_description:
        "ペルソナ分析機能を使用するには、GoogleまたはMicrosoftアカウントでログインしてください。",
      google_login: "Googleでログイン",
      microsoft_login: "Microsoftでログイン",
      loading_questions: "質問を読み込み中...",
      loading_questions_failed: "質問の読み込みに失敗しました",
      retry: "再試行",
      empty_questions: "質問リストが空です",
      empty_questions_description:
        "バックエンドが実行中か、質問データが正常に返されているか確認してください。",
      refresh: "更新",
      your_ai_travel_persona: "あなたのAI旅行ペルソナを見つける",
      your_ai_travel_persona_description:
        "いくつかの質問に答えると、AIがあなたの旅行スタイルに合ったコースを推薦します。",
      previous: "前へ",
      next: "次へ",
      analyzing: "分析中...",
      check_result: "結果を確認",
      custom_recommended_spots: "カスタムおすすめスポット",
      custom_recommended_spots_description:
        "あなたのペルソナに合ったソウルの場所をランダムに選んでお見せします。",
      refresh: "更新",
      no_recommended_spots: "おすすめスポットの読み込みに失敗しました。",
      custom_recommended_courses: "カスタムコース",
      course_search_placeholder: "コース名、場所を検索...",
      card_view: "カードビュー",
      list_view: "リストビュー",
      no_recommended_courses:
        "おすすめコースがないか、検索結果が見つかりません。",
      // Travel Persona 라벨들
      visit_count: "訪問回数",
      stay_period: "滞在期間",
      travel_budget: "旅行予算",
      visit_purpose: "訪問目的",
      interests_activities: "関心活動",
      // --- [Add Start] Persona Question Translations ---
      questions: {
        rvit: {
          title: "韓国への訪問回数は何回ですか？",
          options: {
            v1: {
              label: "初めてです",
              description: "今回が初めての韓国旅行です。",
            },
            v2: { label: "2回目", description: "一度来たことがあります。" },
            v3: { label: "3回目", description: "少し慣れてきました。" },
            v4plus: { label: "4回以上", description: "頻繁に訪れる方です。" },
          },
        },
        q1_purpose: {
          title: "今回の旅行の主な目的は何ですか？",
          options: {
            leisure: {
              label: "休暇/レジャー",
              description: "個人的な休息と楽しみのために訪れます。",
            },
            friends: {
              label: "友人/家族訪問",
              description: "知人に会いに来ました。",
            },
          },
        },
        r19hap: {
          title: "どのくらい滞在する予定ですか？",
          options: {
            h1: {
              label: "1～3日",
              description: "少しだけ滞在します。",
            },
            h2: {
              label: "4～10日",
              description: "有名な観光地だけを訪れます。",
            },
            h3: {
              label: "11～18日",
              description: "他の旅行者との交流を楽しみます。",
            },
            h4: {
              label: "19～29日",
              description: "現地の人みたいに暮らす経験を重視します。",
            },
            h5: {
              label: "30日以上",
              description: "一ヶ月滞在など、韓国での生活に深い関心があります。",
            },
          },
        },
        cost: {
          title: "旅行の予算はどのくらいですか？（1人あたり）",
          options: {
            c1: {
              label: "13万円未満",
              description: "節約志向で実用的な旅行を計画します。",
            },
            c2: {
              label: "13万円～25万円",
              description: "合理的な消費を好みます。",
            },
            c3: {
              label: "25万円～38万円",
              description: "多様な経験に投資することを楽しんでいます。",
            },
            c4: {
              label: "38万円～50万円",
              description: "費用にこだわらずに楽しむタイプです。",
            },
            c5: {
              label: "50万円以上",
              description: "ラグジュアリーな体験とショッピングを好みます。",
            },
          },
        },
        considered: {
          title: "どのようなアクティビティに興味がありますか？",
          options: {
            nature: {
              label: "自然",
              description: "山、海、公園などの自然景観を楽しむ",
            },
            heritage: {
              label: "文化遺産",
              description: "古宮、博物館、歴史的遺跡の探訪",
            },
            food: {
              label: "美食",
              description: "有名なレストラン、カフェ、屋台料理巡り",
            },
            shopping: {
              label: "ショッピング",
              description: "ファッション、コスメ、お土産などの買い物",
            },
            relaxation: {
              label: "リラクゼーション",
              description: "スパ、ビーチ、静かな場所での休息",
            },
            tradition: {
              label: "伝統文化",
              description: "韓服、伝統公演、韓屋村の体験",
            },
            museum: {
              label: "美術館/博物館",
              description: "芸術作品や展示の鑑賞",
            },
            kpop: {
              label: "K-POP",
              description: "コンサート、ファンミーティング、聖地巡礼など",
            },
            arts: {
              label: "公演/芸術",
              description: "ミュージカル、演劇、展示会の鑑賞",
            },
            festival: {
              label: "祭り/イベント",
              description: "地域のお祭りや季節のイベントへの参加",
            },
            nightlife: {
              label: "ナイトライフ",
              description: "クラブ、バー、夜市などの夜遊び",
            },
            themepark: {
              label: "テーマパーク",
              description: "遊園地やテーマパークの訪問",
            },
            beauty: {
              label: "ビューティー/ウェルネス",
              description: "ヘア、ネイル、スキンケアなどのK-ビューティー体験",
            },
            medical: {
              label: "医療",
              description: "健康診断などの医療サービスの利用",
            },
            sports_view: {
              label: "スポーツ観戦",
              description: "野球、サッカーなどのプロスポーツ観戦",
            },
            sports_play: {
              label: "スポーツ体験",
              description: "スキー、サーフィンなどのアクティブなスポーツ",
            },
          },
        },
      },
      // --- [Add End] ---
    },
    playlists: {
      title: "K-pop旅行プレイリスト",
      description:
        "SpotifyにログインしてAIが作成したプレイリストを作成しましょう。今すぐ体験してみてください！✨",
      login: "Spotifyログイン",
      my_playlist: "マイプレイリスト",
      playlist_preview: "プレイリストプレビュー",
      your_playlist: "AIが作成したあなた専用の特別なプレイリスト",
      make_playlist: "Spotifyにログインしてあなただけのプレイリストを作成",
      preview: "プレビュー",
      create_playlist: "最初のプレイリストを作成",
      create_playlist_description:
        "AIがあなたにぴったりの完璧なK-popプレイリストを作成します",
      start_now: "今すぐ開始",
      create_new_playlist: "新しいプレイリストを作成",
      create_new_playlist_description:
        "異なるテーマやアーティストで新しいプレイリストを作成",
      featured_youtube_mix: "注目のYouTubeミックス",
      latest_k_pop_travel_playlists:
        "あなたの旅のために厳選された最新のK-pop旅行プレイリスト",
      view_full_playlist: "フルプレイリストを見る",
      create_your_own_playlist: "あなただけのプレイリストを作成",
      create_your_own_playlist_description:
        "AIがあなたの好みと旅行テーマに合った完璧なK-popプレイリストを生成します。数千曲のデータベースから最適な組み合わせを見つけて、Spotifyに直接保存できます。",
      ai_custom_recommend: "AIカスタム推薦",
      unlimited_creation: "無制限作成",
      spotify_auto_save: "Spotify自動保存",
      themes1: "都市旅行",
      themes1_desc: "活気ある都心探検のためのエネルギッシュなK-pop",
      themes2: "夏休み",
      themes2_desc: "涼しい海風と温かい日差しを感じられる爽やかな音楽",
      themes3: "夜市",
      themes3_desc: "カラフルなネオンサインの下での楽しい夜の街の雰囲気",
      themes4: "静かな旅行",
      themes4_desc: "心を安らげる穏やかで感情的なメロディー",
      themes5: "運動/ワークアウト",
      themes5_desc: "運動効果を最大化する激しいビートのパワフルな音楽",
      themes6: "カフェ/読書",
      themes6_desc:
        "集中力を高める落ち着いた洗練されたアコースティックサウンド",
      kpop_artists1: "4世代ガールグループ",
      kpop_artists2: "4世代ボーイグループ",
      kpop_artists3: "3世代レジェンド",
      kpop_artists4: "ソロアーティスト",
      mock_playlists1: "ソウル シティ バイブ",
      mock_playlists1_desc:
        "ソウル都心を旅行する時に聞くのに良いアーバン K-pop",
      mock_playlists2: "サマー ブリーズ",
      mock_playlists2_desc: "爽やかな夏休み K-pop",
      play: "再生",
    },
    DocentMantine: {
      title: "AI ドーセント",
      subtitle: "リアルタイム位置ガイド",
      aiDocent: "AI ドーセント",
      stopVoice: "音声停止",
      current: "現在地",
      directions: "経路検索",
      chatbot: "観光チャットボット",
      askQuestion: "何でもお聞きください",
      send: "送信",
      examples: {
        title: "質問例:",
        items: [
          "ケイポップデーモンハンターズ撮影地",
          "明洞グルメ推薦",
          "北村韓屋村情報",
          "イカゲーム撮影地",
        ],
      },
      chatbotPlaceholder: "ご質問をどうぞ...",
      chatbotInitialMessage:
        "こんにちは！私はあなたのAI旅行ドーセントです。場所や旅行情報について何でも尋ねてください。写真を送ってください。その場所について詳しく説明します！",
      imageQueryText: "この場所について教えてください",
      voiceRecStart: "音声録音を開始します...",
      voiceRecResult: "音声認識結果:",
      voiceRecStop: "音声録音を停止します。",
      errorReply:
        "申し訳ありませんが、応答の生成中にエラーが発生しました。後でもう一度お試しください。",
      filePick: "ファイル",
      categories: {
        all: "すべて",
        museum: "美術館＆博物館",
        palace: "古宮",
        landmark: "ランドマーク",
        historic: "歴史的な場所",
      },
      allTourismSpots: "全観光スポット",
      detailedInfo: "詳細情報",
      tourismList: "観光地リスト",
      locationTracking: "位置追跡",
      location: "位置",
      voiceGuide: "音声ガイド",
      tourDetection: {
        message:
          "🎯 ツアーに関するご質問ですね！専門ガイドツアーサービスとカスタムコース推薦は、ツアーページでご確認いただけます。",
        buttonText: "🎯 ツアーサービスページへ移動",
      },
      viewDetails: "📝 詳細情報を見る",
      selectPlace: "場所を選択してください",
    },
    SurvivalKit: {
      // Hero 섹션
      hero_tagline: "旅行者必須ツール",
      hero_title: "サバイバルキット",
      hero_subtitle:
        "韓国旅行中に必要なすべてのツールと情報を一か所でお会いしましょう",

      // 섹션 설명
      section_vision_benefit: "画像テキスト認識と翻訳",
      section_translator_benefit: "リアルタイム音声・テキスト翻訳",
      section_culture_benefit: "韓国文化とマナーガイド",

      vision_ocr: "ビジョン OCR",
      quick_translator: "クイック翻訳",
      culture_guide: "韓国文化ガイド",
      // 文化ガイド翻訳
      greeting: "挨拶マナー",
      greeting_content: "韓国では年上の人に先に挨拶し、頭を下げて挨拶します。",
      greeting_extra:
        "通常は軽い会釈で十分で、両手で握手するとより丁寧に見えます。",
      greeting_modal_title: "韓国の敬語と基本的な挨拶表現",
      greeting_modal_paragraphs:
        "韓国には敬語とタメ語があるため、挨拶表現も状況によって変わります。",
      greeting_modal_paragraphs_2:
        "友達同士は「안녕」と言いますが、大人や初対面の人には必ず「안녕하세요」と言うのが礼儀です。",
      greeting_modal_list_1: "안녕하세요（日常敬語）",
      greeting_modal_list_2: "안녕하십니까（格式）",
      greeting_modal_list_3: "안녕（親しい間柄、タメ語）",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워（ありがとう）",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해（ごめんなさい）",
      greeting_modal_link_1: "韓国人への挨拶の仕方",

      meal: "食事マナー",
      meal_content:
        "大人が先にスプーンと箸を取り、ご飯茶碗を持って食べません。お酒は両手で受け取ります。",
      meal_extra:
        "ご飯を食べ終えた後は、箸を茶碗の上にきちんと置くのが礼儀です。",
      meal_modal_title: "韓国の食事マナー",
      meal_modal_paragraphs:
        "韓国では食事は単に食べ物を食べるだけでなく、相手を尊重する重要な場です。",
      meal_modal_paragraphs_2:
        "食事前には「잘 먹겠습니다」（いただきます）、食事後には「잘 먹었습니다」（ごちそうさまでした）と挨拶し、これは準備した人と一緒にいた人すべてへの尊重を意味します。",
      meal_modal_list_1: "席に座るときは年長者やお客様が先に座ります。",
      meal_modal_list_2: "箸をご飯茶碗に刺しません。",
      meal_modal_list_3: "お酒を飲むときは頭を少し向けて飲みます。",
      meal_modal_list_4: "大きな音で噛んだり、箸で人を指すのは失礼です。",
      meal_modal_list_5: "茶碗は食卓の上に置いて食べます。",
      meal_modal_link_1: "韓国人の食事マナー",

      transportation: "公共交通機関",
      transportation_content:
        "地下鉄では優先席を譲り、大きな声で通話しません。",
      transportation_extra:
        "混雑時間帯にはバッグを前に持つことが配慮する態度です。",
      transportation_modal_title: "韓国の公共交通機関",
      transportation_modal_paragraphs:
        "韓国の地下鉄とバスは非常に便利ですが、座席と行動マナーを守ることが重要です。",
      transportation_modal_paragraphs_2:
        "特に優先席と妊婦配慮席は外国人にとって混乱しやすいですが、空いていても座らないのが一般的な文化です。",
      transportation_modal_list_1:
        "優先席は老人、障害者、妊婦専用座席で、若い人は使用しません。",
      transportation_modal_list_2:
        "妊婦配慮席（ピンク席）は妊婦がいつでも使用できるよう空けておきます。",
      transportation_modal_list_3: "公共交通機関内では大きな声で通話しません。",
      transportation_modal_list_4:
        "バッグは前に持つか下ろして他の乗客に配慮します。",
      transportation_modal_list_5:
        "乗車時は降車客が先に降りてから順番に乗車します。",
      transportation_modal_link_1: "韓国公共交通機関利用",
      transportation_modal_link_2: "ソウルで地下鉄利用",

      tip: "チップ文化",
      tip_content:
        "韓国にはチップ文化がありません。サービス料金が既に含まれています。",
      tip_extra:
        "観光地の一部ホテルは例外的に少額のチップを受け取ることもありますが、必須ではありません。",
      tip_modal_title: "韓国のチップ文化",
      tip_modal_paragraphs:
        "韓国のチップ文化は西洋とは異なり、ほとんど存在しません。",
      tip_modal_list_1: "レストラン・カフェ：チップ不要",
      tip_modal_list_2: "タクシー：定められた料金のみ支払い",
      tip_modal_list_3: "美容院・マッサージ等サービス業：チップ文化なし",

      footwear: "靴脱ぎ",
      footwear_content: "韓国の家庭や一部レストランでは靴を脱いで入ります。",
      footwear_extra:
        "靴箱は通常入口にあり、室内履きが準備されている場合が多いです。",
      footwear_modal_title: "韓国の靴脱ぎ文化",
      footwear_modal_paragraphs:
        "韓国では家に入るとき靴を脱ぐことが当然の文化として定着しています。",
      footwear_modal_paragraphs_2:
        "これは室内を清潔に保ち、家族の健康を守るための伝統的な習慣です。",
      footwear_modal_paragraphs_3:
        "室内では靴の代わりにスリッパを履いたり、靴下だけを履いて生活する場合が多いです。",
      footwear_modal_list_1: "家庭：玄関で靴を脱いで入る",
      footwear_modal_list_2:
        "伝統韓食店・韓屋：座式構造のため靴を脱ぐ場合が多い",

      gift: "贈り物マナー",
      gift_content:
        "贈り物を受け取るときは両手で受け取り、すぐに開けないのが礼儀です。",
      gift_extra:
        "特に大人や上司には酒、健康食品、お茶などが無難な贈り物です。",
      gift_modal_title: "韓国の贈り物マナー",
      gift_modal_paragraphs:
        "韓国では贈り物は単純な物ではなく、関係と尊重の意味を込めます。",
      gift_modal_paragraphs_2:
        "贈り物を渡すときと受け取るときは必ず両手を使うのが礼儀です。",
      gift_modal_list_1: "両手でやり取りする",
      gift_modal_list_2:
        "名節・引っ越し祝い・感謝挨拶など様々な状況で贈り物のやり取り",
      modal_close: "閉じる",
    },
    VisionOCR: {
      image_upload: "画像アップロード",
      image_support: "JPG、PNGファイルをサポートしています",
      image_preview: "画像プレビュー",
      image_preview_desc: "分析する画像を確認してください",
      cancel: "キャンセル",
      analyzing: "分析中...",
      analyze_start: "分析開始",
      analyze_result: "分析結果",
      analyze_result_desc: "テキストをクリックしてください",
      analyze_result_image: "分析された画像",
      menu_info: "メニュー情報",
      ai_generating_answer: "AIが回答を生成しています...",
      ai_analyze_result: "AI分析結果",
      ai_generated_answer_desc: "この情報はAIが生成した参考用回答です",
      source_info: "出典: 韓食振興院、「韓食メニュー外国語表記ガイド800選」",
      menu_name: "メニュー名",
      description: "説明",
      source_info_2: "出典: 韓国国際交流財団韓国料理情報",
      food_name: "料理名",
      translating: "翻訳中...",
      source_info_3:
        "出典: AI Hub（韓国情報化振興院）、観光料理メニューボードデータ",
      main_ingredients: "主な材料",
      allergy_info: "アレルギー情報",
      menu_select: "メニューを選択してください",
      menu_select_desc: "画像のメニューテキストをタッチすると",
      menu_select_desc_2: "AIが分析した詳細なメニュー情報",
      menu_select_desc_3: "が",
      menu_select_desc_4: "表示されます",
      new_start: "新しく始める",
      // 파일 선택 관련 번역
      file_select: "ファイル選択",
      no_file_selected: "選択されたファイルなし",
      // 안내 문구
      disclaimer:
        "※ 提供される情報は参考用です。成分、アレルギー等のメニューに関する正確な情報は店舗にお問い合わせください！",
      file_selected: "選択されたファイル",
    },
    cultureGuide: {
      greeting: "挨拶マナー",
      greeting_content: "韓国では年上の人に先に挨拶し、頭を下げて挨拶します。",
      greeting_extra:
        "通常は軽い会釈で十分で、両手で握手するとより丁寧に見えます。",
      greeting_modal_title: "韓国の敬語と基本的な挨拶表現",
      greeting_modal_paragraphs:
        "韓国には敬語とタメ語があるため、挨拶表現も状況によって変わります。",
      greeting_modal_paragraphs_2:
        "友達同士は「안녕」と言いますが、大人や初対面の人には必ず「안녕하세요」と言うのが礼儀です。",
      greeting_modal_list_1: "안녕하세요（日常敬語）",
      greeting_modal_list_2: "안녕하십니까（格式）",
      greeting_modal_list_3: "안녕（親しい間柄、タメ語）",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워（ありがとう）",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해（ごめんなさい）",
      greeting_modal_link_1: "韓国人への挨拶の仕方",
      meal: "食事マナー",
      meal_content:
        "大人が先にスプーンと箸を取り、ご飯茶碗を持って食べません。お酒は両手で受け取ります。",
      meal_extra:
        "ご飯を食べ終えた後は、箸を茶碗の上にきちんと置くのが礼儀です。",
      meal_modal_title: "韓国の食事マナー",
      meal_modal_paragraphs:
        "韓国では食事は単に食べ物を食べるだけでなく、相手を尊重する重要な場です。",
      meal_modal_paragraphs_2:
        "食事前には「잘 먹겠습니다」（いただきます）、食事後には「잘 먹었습니다」（ごちそうさまでした）と挨拶し、これは準備した人と一緒にいた人すべてへの尊重を意味します。",
      meal_modal_list_1: "席に座るときは年長者やお客様が先に座ります。",
      meal_modal_list_2: "箸をご飯茶碗に刺しません。",
      meal_modal_list_3: "お酒を飲むときは頭を少し向けて飲みます。",
      meal_modal_list_4: "大きな音で噛んだり、箸で人を指すのは失礼です。",
      meal_modal_list_5: "茶碗は食卓の上に置いて食べます。",
      meal_modal_link_1: "韓国人の食事マナー",
      transportation: "公共交通機関",
      transportation_content:
        "地下鉄では優先席を譲り、大きな声で通話しません。",
      transportation_extra:
        "混雑時間帯にはバッグを前に持つことが配慮する態度です。",
      transportation_modal_title: "韓国の公共交通機関",
      transportation_modal_paragraphs:
        "韓国の地下鉄とバスは非常に便利ですが、座席と行動マナーを守ることが重要です。",
      transportation_modal_paragraphs_2:
        "特に優先席と妊婦配慮席は外国人にとって混乱しやすいですが、空いていても座らないのが一般的な文化です。",
      transportation_modal_list_1:
        "優先席は老人、障害者、妊婦専用座席で、若い人は使用しません。",
      transportation_modal_list_2:
        "妊婦配慮席（ピンク席）は妊婦がいつでも使用できるよう空けておきます。",
      transportation_modal_list_3: "公共交通機関内では大きな声で通話しません。",
      transportation_modal_list_4:
        "バッグは前に持つか下ろして他の乗客に配慮します。",
      transportation_modal_list_5:
        "乗車時は降車客が先に降りてから順番に乗車します。",
      transportation_modal_link_1: "韓国公共交通機関利用",
      transportation_modal_link_2: "ソウルで地下鉄利用",
      tip: "チップ文化",
      tip_content:
        "韓国にはチップ文化がありません。サービス料金が既に含まれています。",
      tip_extra:
        "観光地の一部ホテルは例外的に少額のチップを受け取ることもありますが、必須ではありません。",
      tip_modal_title: "韓国のチップ文化",
      tip_modal_paragraphs:
        "韓国のチップ文化は西洋とは異なり、ほとんど存在しません。",
      tip_modal_list_1: "レストラン・カフェ：チップ不要",
      tip_modal_list_2: "タクシー：定められた料金のみ支払い",
      tip_modal_list_3: "美容院・マッサージ等サービス業：チップ文化なし",
      footwear: "靴脱ぎ",
      footwear_content: "韓国の家庭や一部レストランでは靴を脱いで入ります。",
      footwear_extra:
        "靴箱は通常入口にあり、室内履きが準備されている場合が多いです。",
      footwear_modal_title: "韓国の靴脱ぎ文化",
      footwear_modal_paragraphs:
        "韓国では家に入るとき靴を脱ぐことが当然の文化として定着しています。",
      footwear_modal_paragraphs_2:
        "これは室内を清潔に保ち、家族の健康を守るための伝統的な習慣です。",
      footwear_modal_paragraphs_3:
        "室内では靴の代わりにスリッパを履いたり、靴下だけを履いて生活する場合が多いです。",
      footwear_modal_list_1: "家庭：玄関で靴を脱いで入る",
      footwear_modal_list_2:
        "伝統韓食店・韓屋：座式構造のため靴を脱ぐ場合が多い",
      gift: "贈り物マナー",
      gift_content:
        "贈り物を受け取るときは両手で受け取り、すぐに開けないのが礼儀です。",
      gift_extra:
        "特に大人や上司には酒、健康食品、お茶などが無難な贈り物です。",
      gift_modal_title: "韓国の贈り物マナー",
      gift_modal_paragraphs:
        "韓国では贈り物は単純な物ではなく、関係と尊重の意味を込めます。",
      gift_modal_paragraphs_2:
        "贈り物を渡すときと受け取るときは必ず両手を使うのが礼儀です。",
      gift_modal_list_1: "両手でやり取りする",
      gift_modal_list_2:
        "名節・引っ越し祝い・感謝挨拶など様々な状況で贈り物のやり取り",
    },
    directions: {
      days: "日目",
      add_recommended_course: "におすすめコースを追加しました。",
      delete_day: "この日程を削除しますか？",
      search_start: "出発地検索",
      search_end: "到着地検索",
      search_waypoint: "経由地検索",
      route_planner: "ルートプランナー",
      calculate_route: "ルート計算",
      calculating_route: "ルート計算中...",
      save_route: "ルート保存",
      more: "もっと見る",
      duplicate_day: "日程複製",
      add_day_menu: "日目追加メニュー",
      add_day: "新しい日目を追加",
      add_recommended_course: "おすすめコース追加",
      set_start: "出発地を設定してください",
      set_end: "到着地を設定してください",
      add_waypoint: "経由地追加",
      remove_waypoint: "経由地削除",
      add_waypoint_description:
        "経由地を追加するとより精密なルートを作成できます。",
      map_provider: "地図提供者",
      kakao_map: "カカオマップ",
      t_map: "Tマップ",
      car: "車",
      pedestrian: "徒歩",
      transit: "公共交通機関",
      transportation_mode: "移動手段",
      route_order_adjustment: "ルート順序調整",
      drag_to_adjust_order: "ドラッグして順序を変更してください",
      start: "出発",
      end: "到着",
      waypoint: "経由",
      add_start: "出発地追加",
      add_end: "到着地追加",
      add_waypoint: "経由地追加",
      select_start: "出発地を選択してください",
      select_end: "到着地を選択してください",
      select_waypoint: "経由地を選択してください",
      travel_summary: "移動要約",
      total_distance: "総移動距離",
      estimated_duration: "予想所要時間",
      minutes: "分",
      stay_time: "滞在時間（分）",
      load_recommended_course: "おすすめコース読み込み",
      load_recommended_course_description:
        "追加したいコースを選択すると新しい日目として準備されます。",
      loading_recommended_course: "おすすめコースを読み込み中です...",
      load_recommended_course_failed: "おすすめコースを読み込めませんでした。",
      try_again: "再試行",
      no_recommended_course: "使用可能なおすすめコースがありません。",
      stops: "箇所",
      keyword_input: "キーワードを入力してください",
      search_result_select_place: "検索結果から場所を選択すると",
      waypoint_added: "経由地が追加されます。",
      start_set: "出発地が設定されます。",
      end_set: "到着地が設定されます。",
    },
    planner: {
      new_activity: "新しい活動",
      no_saved_plans: "保存された旅行計画がありません。",
      create_or_modify_plan:
        "新しい計画を作成するか、既存の計画を修正して管理してください。",
      new_plan: "新しい旅行",
      places: "場所",
      days: "日",
      load_plan: "この計画を読み込む",
      delete_plan: "この計画を削除",
      login_to_start_plan: "ログインして旅行計画を開始してください。",
      login: "ログイン",
      creating_sample_plan: "サンプル旅行を作成中...",
      no_plan: "旅行計画がありません。",
      create_sample_plan: "サンプル旅行作成",
      saved_schedule: "保存されたスケジュール",
      travel_planner: "旅行日程プランナー",
      saving: "保存中...",
      travel_plan: "旅行計画",
      saved_plans: "保存された計画",
      activity_editor: "活動編集",
      time_info: "時間情報",
      time: "時間",
      stay_time: "滞在時間（分）",
      place_info: "場所情報",
      place_name: "場所名",
      search_place_placeholder: "検索語を入力すると場所をおすすめします",
      place_type: "場所タイプ",
      road_address: "道路名住所",
      address: "地番住所",
      latitude: "緯度",
      longitude: "経度",
      additional_info: "追加情報",
      description: "説明",
      description_placeholder: "活動に関連するメモを入力してください",
      cost_estimate: "予想費用（ウォン）",
      cancel: "キャンセル",
      save: "保存",
      add_activity: "活動追加",
      day: "日",
      activity: "活動",
      transport: "交通",
      total_days_travel: "合計{{days}}日間の旅行",
    },
    data: {
      live_info: "ライブ情報",
      now: "今",
      is: "は",
      data_update: "データ更新",
      real_time_population: "リアルタイム人口",
      about: "約",
      people: "人",
      real_time_commercial: "リアルタイム商業",
      overall_commercial: "全体商業",
      subway_arrival_info: "地下鉄到着情報",
      recommended_tour_products: "おすすめツアー商品",
      nearby_cultural_events: "周辺文化イベント",
      traffic_conditions: "交通状況",
      weather: "天気",
      humidity: "湿度",
      wind_speed: "風速",
      precipitation: "降水量",
      feels_like: "体感",
    },
    mypage: {
      mypage: "マイページ",
      mypage_description: "あなたの活動と情報を確認・管理してください",
      logout: "ログアウト",
      saved_travel_plans: "保存した旅行計画",
      liked_travel_products: "いいねした旅行商品",
      my_posts: "私が書いた投稿",
      liked_posts: "いいねした投稿",
      travel_plans: "旅行計画",
      travel_products: "旅行商品",
      likes: "いいね",
      loading_travel_plans: "旅行計画を読み込み中...",
      no_saved_travel_plans: "保存した旅行計画がありません",
      create_travel_plan_message: "旅行計画を作成して保存してみてください！",
      no_liked_products: "いいねした旅行商品がありません",
      like_products_message: "気に入った旅行商品にいいねを押してみてください！",
      loading: "読み込み中...",
      no_posts_written: "書いた投稿がありません",
      write_first_post: "最初の投稿を書いてみてください！",
      no_liked_posts: "いいねした投稿がありません",
      like_posts_message: "気に入った投稿にいいねを押してみてください！",
      delete: "削除",
      travel_plan: "旅行計画",
      destination_undecided: "目的地未定",
      day_schedule: "日のスケジュール",
      saved: "保存",
      last_updated: "最近の更新",
      loading_details: "詳細情報を読み込み中...",
      time_undecided: "時間未定",
      activity: "活動",
      no_registered_activities: "登録された活動がありません",
      no_saved_schedule_info: "保存されたスケジュール情報がありません",
    },
  },
  zh: {
    tour: {
      header: { klover: "K-lover", tour: "旅行", subtitle: "高端私人定制旅行" },
      list: { title: "K-lover 旅行" },
      search: { placeholder: "搜索旅行…" },
      categories: {
        all: "全部",
        experience: "体验",
        it: "IT",
        sports: "运动",
        beauty: "美妆",
        culture: "历史",
      },
      pagination: { prev: "上一页", next: "下一页" },
      empty: { title: "没有结果", description: "请尝试其他搜索或筛选条件。" },
      partners: { title: "合作伙伴", subtitle: "值得信赖的伙伴" },
    },
    tourDetail: {
      products: {
        1: {
          title: "Netflix x Interpark Global",
          description: "包含爱宝乐园通票的K-Pop恶魔猎人主题之旅。",
          location: "首尔江南区 → 龙仁爱宝乐园",
        },
        2: {
          title: "Microsoft AI Tour Seoul",
          description: "微软AI首尔之旅 - AI技术与文物修复的相遇。",
          location: "首尔中区",
        },
        3: {
          title: "汉江巴士 X Instagram 首尔热门打卡地之旅",
          description:
            "乘坐汉江巴士，游览首尔代表性拍照圣地和Instagram热门打卡地的感性之旅。",
          location: "汉江全段",
        },
        4: {
          title: "LG双子星棒球赛观战",
          description: "蚕室棒球场高级观赛体验 + 炸鸡啤酒 + 体育活动。",
          location: "首尔松坡区（蚕室观光特区）",
        },
        5: {
          title: "K-Beauty X OLIVE YOUNG 高级美妆之旅",
          description:
            "皮肤科护理 + K-Beauty品牌体验 + OLIVE YOUNG购物 + 韩方水疗。",
          location: "首尔江南区",
        },
        6: {
          title: "首尔传统文化之旅",
          description:
            "与AI导览员和Kakao Friends角色一起享受有趣的博物馆体验。",
          location: "首尔钟路区",
        },
      },
      data: {
        1: {
          title: "K-Pop恶魔猎人 × 爱宝乐园特别合作之旅",
          subtitle: "Netflix原创剧集 × 韩国代表性主题公园的完美合作。",
          location: "爱宝乐园、骆山公园、N首尔塔、国立中央博物馆",
          duration: "10小时（含爱宝乐园门票）",
          groupSize: "最多12人",
          language: "韩语、英语、中文",
          partnership: {
            primary: "NETFLIX",
            secondary: "Samsung Everland",
            tertiary: "首尔观光财团",
          },
          specialFeatures: [
            "包含爱宝乐园1日通票",
            "K-Pop恶魔猎人限定周边套装",
            "无限次使用AR拍照区",
            "提供电视剧OST播放列表",
            "拍摄地导览音频之旅",
          ],
          itinerary: [
            {
              time: "08:30",
              location: "江南站集合",
              description: "乘坐专用巴士及行程说明",
              duration: "30分钟",
            },
            {
              time: "09:30",
              location: "进入爱宝乐园",
              description: "开始体验K-Pop恶魔猎人主题区",
              duration: "4小时",
            },
            {
              time: "10:00",
              location: "恶魔猎人游乐设施",
              description: "体验惊险刺激的“恶魔追击战”",
              duration: "45分钟",
            },
            {
              time: "11:00",
              location: "露米的魔法学校",
              description: "互动魔法体验馆 & AR拍照区",
              duration: "60分钟",
            },
            {
              time: "12:30",
              location: "恶魔猎人餐厅",
              description: "电视剧主题午餐套餐 & 限定甜点",
              duration: "90分钟",
            },
            {
              time: "14:00",
              location: "前往骆山公园",
              description: "重现露米♥振宇约会场景拍摄地",
              duration: "90分钟",
            },
            {
              time: "16:00",
              location: "N首尔塔",
              description: "最终Boss战拍摄地 & 观景台参观",
              duration: "120分钟",
            },
            {
              time: "18:00",
              location: "国立中央博物馆",
              description: "古代文物插曲拍摄地之旅",
              duration: "60分钟",
            },
          ],
          detailSections: [
            {
              title: "爱宝乐园 X K-Pop恶魔猎人主题区",
              text: "在世界首个K-Pop恶魔猎人主题区，亲身体验剧中惊心动魄的动作场面。完美再现的露米魔法学校、振宇训练中心以及恶魔清除任务等沉浸式游乐设施正等待着您。",
            },
            {
              title: "骆山公园浪漫约会场景重现",
              text: "在骆山公园亲自重现剧中露米和振宇最令人印象深刻的约会场景。在首尔市中心的美景下，享受戏剧性的拍照时间，专属摄影师将为您捕捉人生美照。",
            },
            {
              title: "N首尔塔最终决战舞台",
              text: "通过VR体验在N首尔塔上演的季终最终Boss战，以剧中主角的心情欣赏首尔的夜景。还包含限定版情侣锁体验。",
            },
          ],
          inclusions: [
            "爱宝乐园1日通票",
            "专用旅游巴士往返交通",
            "K-Pop恶魔猎人周边套装",
            "电视剧主题午餐和甜点",
            "专业导游服务",
            "N首尔塔观景台门票",
            "AR拍照区使用券",
            "纪念品商店10%折扣券",
          ],
          exclusions: [
            "个人购物费用",
            "额外游乐设施费用",
            "旅游保险",
            "个人零食和饮料",
          ],
        },
        2: {
          title: "微软AI首尔之旅",
          subtitle: "AI技术与文物修复的相遇",
          location: "首尔中区微软韩国",
          duration: "4小时",
          groupSize: "最多20人",
          language: "韩语、英语",
          partnership: { primary: "Microsoft Korea", secondary: "国家遗产厅" },
          itinerary: [
            {
              time: "09:00",
              location: "微软韩国办公室",
              description: "AI技术介绍及行程开始",
            },
            {
              time: "10:00",
              location: "AI演示中心",
              description: "体验文物修复AI技术",
            },
            {
              time: "11:30",
              location: "国家遗产厅合作馆",
              description: "体验数字文物修复案例",
            },
            {
              time: "13:00",
              location: "微软周边商店",
              description: "限量版纪念品及AI体验套件",
            },
          ],
          detailSections: [
            {
              title: "微软AI大会2025 - 主要日程",
              text: "萨提亚·纳德拉在首尔举行的微软AI大会上介绍了AI的未来。议程包括一场主题演讲、25场分组会议和12场实践工作坊，为AI创新和产业变革提供了深刻的见解。",
            },
            {
              title: "在微软AI大会2025上学习与交流",
              text: "由萨提亚·纳德拉介绍的与会者将从行业领袖那里获得关于AI创新的见解，并探索云、AI和安全领域的最新技术。它还提供了与微软高管交流、与专家进行一对一讨论以及通过充满活力的社区会议扩展网络的机会。",
            },
            {
              title: "微软AI大会 - 现场会议",
              text: "观众聚集在微软AI大会，聆听关于AI未来的主题演讲。",
            },
          ],
          inclusions: ["专家导览", "AI技术体验环节", "限量纪念品", "交流机会"],
          exclusions: ["交通费用", "餐饮", "个人开销"],
        },
        3: {
          title: "汉江巴士 X Instagram 首尔热门打卡地之旅",
          subtitle: "沿汉江征服首尔代表性拍照圣地",
          location: "汉江公园（汝矣岛-蚕室-盘浦-麻浦）",
          duration: "3.5小时",
          groupSize: "最多25人",
          language: "韩语、英语",
          partnership: { primary: "首尔观光财团", secondary: "汉江事业本部" },
          itinerary: [
            {
              time: "15:00",
              location: "汝矣岛汉江公园",
              description: "行程开始及Instagram拍照技巧讲座",
            },
            {
              time: "15:30",
              location: "汉江巴士（汝矣岛→蚕室）",
              description: "以63大厦和IFC购物中心为背景进行车内拍摄",
            },
            {
              time: "16:00",
              location: "蚕室乐天世界塔拍照区",
              description: "拍摄首尔天际线代表性认证照",
            },
            {
              time: "16:45",
              location: "汉江巴士（蚕室→盘浦）",
              description: "拍摄具有汉江游轮感的视频",
            },
            {
              time: "17:15",
              location: "盘浦彩虹喷泉",
              description: "拍摄黄金时段彩虹喷泉的延时摄影",
            },
            {
              time: "18:00",
              location: "三岛LED秀",
              description: "夜景烟花及团体纪念照拍摄",
            },
          ],
          detailSections: [
            {
              title: "汝矣岛汉江公园之旅",
              text: "在首尔市中心的休息空间——汝矣岛汉江公园，骑着共享单车沿江边行驶，感受凉爽的江风。在绿色的草坪上享受悠闲的野餐，欣赏汉江与天际线交融的独特风景。",
            },
            {
              title: "盘浦彩虹喷泉之旅",
              text: "作为世界上最长的桥梁喷泉被载入吉尼斯世界纪录的盘浦彩虹喷泉是汉江的一大名胜。白天是清凉的水柱，夜晚则与五彩缤纷的灯光和音乐相得益彰，营造出浪漫的氛围，是欣赏首尔夜景的最佳地点之一。",
            },
            {
              title: "三岛（漂浮岛）之旅",
              text: "作为世界上第一座人工浮岛，三岛是由“佳岛”、“彩岛”和“帅岛”三个岛屿组成的复合文化空间。这里举办展览、演出和活动，您可以在餐厅和咖啡馆欣赏汉江美景，享受特别的用餐体验。尤其在夜晚，LED灯光点缀整个岛屿，使其成为首尔代表性的夜景名胜。还可以体验游艇和船只，享受别样的乐趣。",
            },
          ],
          inclusions: [
            "汉江巴士票",
            "专业摄影师导览",
            "人生美照拍摄及修图服务",
            "饮料及零食",
          ],
          exclusions: ["个人相机设备", "餐费", "额外活动费用"],
        },
        4: {
          title: "LG双子星高级棒球观赛之旅",
          subtitle: "在蚕室棒球场享受完美的棒球体验",
          location: "蚕室棒球场，乐天世界塔",
          duration: "6小时",
          groupSize: "最多25人",
          language: "韩语、英语、日语",
          partnership: { primary: "LG双子星", secondary: "校村炸鸡" },
          itinerary: [
            {
              time: "14:00",
              location: "蚕室站2号出口",
              description: "行程开始及棒球文化介绍",
            },
            {
              time: "15:00",
              location: "LG双子星粉丝商店",
              description: "试穿队服并准备应援用品",
            },
            {
              time: "18:00",
              location: "校村炸鸡高级包厢",
              description: "边享用炸鸡啤酒边观看比赛",
            },
            {
              time: "20:00",
              location: "拍照区",
              description: "以球场为背景的纪念快照之旅",
            },
          ],
          detailSections: [
            {
              title: "蚕室棒球比赛",
              text: "作为首尔的代表性体育地标，蚕室棒球场是LG双子星和斗山熊队的主场，在这里可以近距离感受韩国职业棒球的热情。在这个可容纳超过3万人的大型球场，应援歌和应援棒营造出的独特氛围，展现了韩国职业棒球的魅力。特别是LG双子星球迷热情的应援战，为来访蚕室的游客提供了难忘的体验。",
            },
            {
              title: "LG双子星",
              text: "在首尔举行的LG双子星棒球比赛中，外国游客热情地加油助威，享受现场气氛。结合啦啦队式应援文化的韩国职业棒球，作为独特的旅游项目，为国际游客带来了特别的回忆。",
            },
          ],
          inclusions: [
            "棒球比赛高级座位票",
            "炸鸡啤酒套餐",
            "LG双子星应援用品",
            "专业导游",
          ],
          exclusions: ["额外餐饮", "个人纪念品购买", "交通费"],
        },
        5: {
          title: "K-Beauty与健康高级之旅",
          subtitle: "韩国顶级美容技术与传统健康养生的完美结合",
          location: "江南区（狎鸥亭-清潭-新沙洞一带）",
          duration: "6小时",
          groupSize: "最多12人",
          language: "韩语、英语、中文、日语",
          partnership: { primary: "OLIVE YOUNG", secondary: "江南皮肤科协会" },
          itinerary: [
            {
              time: "10:00",
              location: "个人色彩诊断",
              description: "个人色彩诊断+定制化妆推荐",
            },
            {
              time: "11:00",
              location: "狎鸥亭高级皮肤科",
              description: "皮肤分析+水光针护理（30分钟）",
            },
            {
              time: "13:00",
              location: "清潭洞韩定食餐厅",
              description: "有益皮肤的韩方药膳午餐",
            },
            {
              time: "14:30",
              location: "新沙洞K-Beauty体验馆",
              description: "体验雪花秀、后等品牌的定制护理",
            },
            {
              time: "15:30",
              location: "狎鸥亭传统韩方水疗",
              description: "黄土汗蒸+香薰按摩（90分钟）",
            },
            {
              time: "17:30",
              location: "OLIVE YOUNG VIP购物",
              description: "个人定制产品推荐+免税购物",
            },
          ],
          partnershipBenefits: [
            {
              icon: "Award",
              title: "高级皮肤护理",
              description: "江南顶级皮肤科的水光针+皮肤分析",
              value: "价值₩150,000",
            },
            {
              icon: "Gift",
              title: "K-Beauty大礼包",
              description: "雪花秀、后、悦诗风吟等热门品牌样品套装",
              value: "价值₩80,000",
            },
            {
              icon: "Play",
              title: "韩方健康水疗",
              description: "黄土汗蒸房+90分钟传统香薰按摩",
              value: "价值₩120,000",
            },
          ],
          detailSections: [
            {
              title: "K-Beauty个人色彩诊断体验",
              text: "通过韩国美容潮流的核心——个人色彩诊断，找到最适合您形象的颜色。专业顾问将分析符合您肤色和气质的颜色，为您的化妆和时尚造型提供实际帮助。对外国游客而言，这是亲身体验韩国K-Beauty文化、发现自己新魅力的特殊时刻。",
            },
            {
              title: "K-Beauty in OLIVE YOUNG",
              text: "这是专为对K-Beauty感兴趣的外国游客策划的OLIVE YOUNG购物体验之旅。这不仅仅是简单的店铺访问，最了解潮流的私人导购将陪同您进行定制化购物。从全球粉丝喜爱的K-Pop艺人美妆单品到社交媒体上的热门话题产品，您都可以在现场获得推荐并购买。",
            },
            {
              title: "韩国皮肤科",
              text: "以先进设备和专业医疗团队闻名的韩国皮肤科，在美容和皮肤治疗领域享誉全球。外国游客可以通过从痘痘、斑点管理到激光治疗和护肤项目的个人定制化诊疗，亲身体验K-Beauty的医疗服务。在安全细致的诊疗中，体验韩国独特的美容与健康文化，这是一个特殊的机会。",
            },
          ],
          inclusions: [
            "个人色彩诊断",
            "高级皮肤护理",
            "韩方水疗体验",
            "K-Beauty大礼包",
            "专业美容导游",
            "午餐",
          ],
          exclusions: ["额外治疗费用", "个人购物费用", "交通费"],
        },
        6: {
          title: "首尔传统文化之旅",
          subtitle:
            "在景福宫感受韩国王室文化，在仁寺洞通过茶道体验传统风情，在广藏市场品尝当地美食，度过特别的一天。",
          location: "首尔钟路区一带",
          duration: "4.5小时",
          groupSize: "最多6人",
          language: "韩语、英语、中文",
          partnership: { primary: "首尔市政府", secondary: "哈拿多乐" },
          itinerary: [
            {
              time: "10:00",
              location: "景福宫入口",
              description: "租借韩服后参观景福宫，拍摄旅行快照",
            },
            {
              time: "12:00",
              location: "传统韩定食午餐",
              description: "在传统韩餐厅享用午餐",
            },
            {
              time: "14:30",
              location: "仁寺洞茶道体验与传统街区漫步",
              description:
                "在传统茶馆体验茶道，并逛传统工艺品、印章、韩纸纪念品",
            },
            {
              time: "17:00",
              location: "广藏市场传统美食之旅",
              description: "品尝绿豆煎饼、麻药紫菜包饭、生拌牛肉等当地人气美食",
            },
            {
              time: "19:00",
              location: "清溪川夜景漫步",
              description: "沿着流向汉江的清溪川散步",
            },
          ],
          detailSections: [
            {
              title: "景福宫旅行快照",
              text: "在首尔的代表性宫殿景福宫，与专业摄影师一起拍摄旅行快照。穿着韩服，以宫殿宏伟的殿阁和宁静的庭院为背景，记录下特别的瞬间。传统与现代交融的景福宫的魅力，将成为您难忘的旅行回忆。",
            },
            {
              title: "仁寺洞茶道体验",
              text: "在首尔传统街区仁寺洞的宁静茶馆里，体验韩式茶道。在专家的指导下，品尝传统茶和茶点，感受韩国茶文化的深厚底蕴。",
            },
            {
              title: "广藏市场美食之旅",
              text: "在首尔最富活力的传统市场之一广藏市场，尽情享受韩国的代表性美食。您可以品尝到香脆的绿豆煎饼、麻药紫菜包饭、生拌牛肉等深受当地人和外国游客喜爱的各种街头小吃。",
            },
          ],
          inclusions: [
            "韩服租借",
            "景福宫门票",
            "茶道体验",
            "广藏市场美食试吃",
            "专业导游",
            "旅行快照",
          ],
          exclusions: ["午餐费用", "个人纪念品购买", "交通费"],
        },
      },
      offer: {
        expiresIn: "剩余时间",
        limitedTime: "⏳ 限时优惠",
        doNotShowToday: "今日不再显示",
        grabDeal: "立即抢购",
        grabbed: "已确认",
        dealGrabbed: "优惠已确认！",
        priceSecured: "当前价格将短暂保留",
        urgencyText: "抓紧时间！剩余 {{minutes}}分 {{seconds}}秒",
      },
      booking: {
        bookNow: "立即预订",
        reviews: "条评论",
        discount: "折",
      },
      tabs: {
        overview: "行程",
        details: "详情",
        reviews: "评价",
      },
      overview: {
        itinerary: "行程",
        noItinerary: "暂无行程信息",
        included: "包含项目",
        notIncluded: "不包含项目",
      },
      details: {
        noDetails: "暂无详细信息",
        specialFeatures: "特别优惠",
        partnershipBenefits: "合作优惠",
      },
      reviews: {
        noReviews: "暂无评价",
        verifiedPurchase: "已验证购买",
      },
      notFound: {
        title: "未找到该旅游项目",
        description: "无法加载请求的旅游信息。",
      },
    },
    common: {
      community: {
        info_reviews_label: "信息 & 评价",
        info_reviews_desc: "分享旅行信息与评价的空间",
        labels: {
          notice: "公告",
          editors_pick: "Klover's Pick",
          popular_destinations: "热门目的地",
        },
        search_placeholder: "搜索...",
        live_areas: {
          gangnam: "江南",
          gwanghwamun: "光化门",
          myeongdong: "明洞",
          seoul_station: "首尔站",
          itaewon: "梨泰院",
          jamsil: "蚕室",
          jongno: "钟路·清溪",
          hongdae: "弘大",
        },
        info: {
          posts: {
            10001: {
              title: "✈️ 首尔都心机场航站楼使用指南",
              content:
                "出发前在市区完成值机、行李托运和出境审查！包含首尔站/光明站CAT的服务、营业时间与注意事项。",
            },
            10002: {
              title: "🎆 2025 首尔世界烟花节公告",
              content:
                "2025年10月4日(周六) 19:30–21:00 汝矣岛汉江公园一带。查看观赏要点与交通信息。",
            },
            10003: {
              title: "🌟 2025年中秋期间 首尔地铁提前收班",
              content:
                "中秋期间，地铁1–9号线运营至23:00。详情请参考首尔交通公社官网。",
            },
            1001: {
              title: "K‑pop 恶魔猎人 3日首尔巡礼路线",
              content:
                "3天打卡作品取景地：第1天 江南/三成，第2天 汉江/弘大，第3天 光化门/益善洞/骆山，并附出行小贴士。",
            },
            1002: {
              title: "像K-Pop偶像一样吃！🎤✨ 首尔美食完全指南",
              content:
                "想象在喜欢的偶像相同的空间里吃相同的菜单...光是想象就让人兴奋，不是吗？我们公开了编辑亲自走访调查的偶像真正常去店铺清单！📍\n\n电视里的那些名店\n🥖 Pachamama Bakery | 龙山HYBE附近\nLE SSERAFIM在《The Manager》中盛赞的那家面包店！盐面包和开心果切片是必点单品。参观HYBE后顺便去的话一举两得 ✨\n\n🥩 金猪食堂 | 米其林必比登\nZB1、BTS、EXO成为常客是有原因的。用罗勒包着厚厚的五花肉吃...无需多言 🤤\n\nSNS热门场所\n🍈 阿索托 | 乙支路\naespa Winter在泡泡中认证的甜瓜面包专门店！2024年开业后至今人气持续。强烈推荐香草奶油甜瓜面包 💛\n\n🌿 咖啡 树木金土 | 江南\n以SEVENTEEN 珉奎的彩虹阶梯Instagram拍照区而闻名。在都市中的自然友好氛围中享受治愈时光 🌈\n\n🍦 要雅正 | 全国门店\n以RIIZE 成灿的组合配方而闻名的酸奶冰淇淋。黄金芒果+蜂蜜蜂巢+阳光玫瑰组合真的很好吃（编辑也认可！）\n\n🍩 皮尔马面包店 | 安国\nTWICE Sana的超级伯爵茶甜甜圈。不甜腻的浓郁伯爵茶奶油是重点！（仅限外带）\n\n粉丝圣地巡礼必去路线\n🐑 Lamb NIKUYA | 屯村2号店\nStray Kids、DAY6成员签名和便利贴满满！也是V-Live拍摄地而闻名\n\n🥩 烤肠卖肉的店\nSEVENTEEN Going Seventeen拍摄地。包含Carat套餐菜单和生日活动！真正的粉丝必去 📸\n\n🎯 秀贤编辑的Tips！\n\n江南路线：树木金土 → Sunday Burger Club → 阿加杰拉托\n\n圣水路线：咖啡 帕尔本 → 圣水达拉\n\n龙山路线：Pachamama → 阿索托\n\n平日下午访问可以安静地享受。点与偶像相同的菜单，别忘了 #偶像美食巡游 标签！💜",
            },
          },
        },
      },
      // Home.jsx
      place1: "明洞",
      place2: "光化门",
      place3: "梨泰院",
      place4: "蚕室",
      "features.title1": "AI人格分析",
      "features.title2": "定制路线推荐",
      "features.title3": "K-Pop播放列表",
      "features.title4": "AI导游",
      "features.desc1": "通过5个问题发现您独特的旅行风格",
      "features.desc2": "AI实时生成的完美旅行路线",
      "features.desc3": "适合每个旅行目的地氛围的专属K-Pop音乐",
      "features.desc4": "基于RAG的聊天机器人深度体验当地文化",
      "stats.label1": "定制旅行创建",
      "stats.label2": "满意度",
      "stats.label3": "AI支持",
      "stats.label4": "平均评分",
      "main.badge": "AI定制旅行规划师",
      "nav.features": "功能",
      "nav.howto": "使用方法",
      "nav.community": "社区",
      "login.welcome": "欢迎！",
      "login.logout": "登出",
      "login.login": "登录",
      "main.title.k_travel": "旅行",
      "main.title.connector": "",
      "main.title.ai_creates": "AI为您打造",
      "main.subtitle":
        "通过5个问题发现您独特的旅行风格，与K-Pop一起享受完美的旅程。让AI处理复杂的计划，您只需准备好兴奋。",
      "main.start.persona": "人格分析开始",
      "main.start.start": "开始",
      "now.playing": "Now Playing",
      "main.recommend.spot": "推荐景点",
      "main.recommend.spot.name": "弘大K-Pop广场",
      "main.title.ai_action": "AI为您打造",
      "main.title.experience": "特别的体验",
      "main.subtitle.ai_action": "创新的AI技术为您设计完美的韩国旅行。",
      "main.more.view": "查看更多",
      "steps.title": "简单3步",
      "steps.completion": "完成",
      "steps.step1.title": "人格分析",
      "steps.step1.description": "通过5个问题分析旅行风格",
      "steps.step2.title": "AI定制推荐",
      "steps.step2.description": "基于分析结果生成完美路线",
      "steps.step3.title": "自由编辑",
      "steps.step3.description": "拖拽完成您的专属计划",
      "popular.title": "发现实时",
      "popular.highlight": "热门景点",
      "popular.action.join": "",
      "popular.action": "发现",
      "popular.description": "查看其他旅行者选择的热门路线",
      "footer.slogan": "与AI一起体验完美的韩国之旅",
      "footer.privacy_policy": "隐私政策",
      "footer.terms_of_service": "服务条款",
      "footer.customer_center": "客户中心",
      "footer.partnership": "合作伙伴",
      "footer.copyright": "© 2024 Klover. All rights reserved.",
      "modal.welcome": "欢迎来到Klover",
      "modal.instruction": "请登录以开始您的AI定制旅行规划师",
      "modal.continue_google": "使用Google继续",
      "modal.continue_microsoft": "使用Microsoft继续",
      "modal.disclaimer.prefix": "继续即表示您同意我们的",
      "modal.disclaimer.terms": "服务条款",
      "modal.disclaimer.and": "和",
      "modal.disclaimer.privacy": "隐私政策",
      "modal.disclaimer.suffix": "。",
      "cta.title": "现在，是开始您完美旅行的时候了",
      "cta.start": "通过5个问题开始",

      // Home.jsx 추가 번역 키들
      "home.persona.title": "发现您专属的旅行人格",
      "home.persona.desc":
        "通过5个问题分析您的旅行风格，AI将为您推荐定制化路线。",
      "home.persona.cta": "开始人格分析",
      "home.persona.card1.title": "旅行风格？",
      "home.persona.card1.pill1": "冒险追求型",
      "home.persona.card1.pill2": "悠闲享受型",
      "home.persona.card1.pill3": "计划探访型",
      "home.persona.card2.title": "感兴趣的活动？",
      "home.persona.card2.pill1": "文化体验",
      "home.persona.card2.pill2": "美食探访",
      "home.persona.card2.pill3": "购物",
      "home.persona.card3.title": "偏好的氛围？",
      "home.persona.card3.pill1": "时尚的",
      "home.persona.card3.pill2": "传统的",
      "home.persona.card3.pill3": "亲近自然的",

      "home.ai_reco.title": "AI打造的完美旅行路线",
      "home.ai_reco.desc": "基于个人定制分析，实时生成最优旅行路线。",
      "home.ai_reco.tag1": "实时生成",
      "home.ai_reco.tag2": "定制推荐",
      "home.ai_reco.tag3": "最优路线",
      "home.ai_reco.tag4": "时间效率",
      "home.ai_reco.tag5": "本地信息",

      "home.editing.title": "自由编辑并完成",
      "home.editing.desc": "通过拖拽功能自由修改旅行日程，创建您的完美计划。",

      "home.map.preview_label": "定制旅行路线",

      "home.itinerary.title": "旅行日程",
      "home.itinerary.item1": "景福宫参观",
      "home.itinerary.item2": "北村韩屋村",
      "home.itinerary.item3": "仁寺洞文化街",
      "home.itinerary.item4": "明洞购物",

      "home.controls.undo": "撤销",
      "home.controls.save": "保存",
    },
    QuickTranslator: {
      all: "全部",
      greeting: "问候",
      location: "位置",
      price: "价格",
      help: "帮助",
      transport: "交通",
      food: "食物",
      status: "状态",
      payment: "支付",
      menu: "菜单",
      language_detection_error: "语言检测时发生错误。",
      speech_recognition_error: "语音识别错误",
      real_time_translator: "实时翻译器",
      stop_listening: "停止语音识别",
      processing_listening: "语音识别处理中...",
      start_listening: "开始语音识别",
      listening: "正在听取语音... 请说话",
      processing_text_conversion: "正在将语音转换为文本...",
      input_text: "请输入要翻译的文本... (语言将自动检测)",
      detecting_language: "正在检测语言...",
      detected_language: "检测到的语言",
      translating: "翻译中...",
      translate: "翻译",
      translation_results: "翻译结果",
      listen_to_audio: "听音频",
      frequently_used_expressions: "常用表达",
      use: "使用",
      phrases1: "你好",
      phrases2: "谢谢",
      phrases3: "对不起",
      phrases4: "洗手间在哪里？",
      phrases5: "多少钱？",
      phrases6: "请帮助我",
      phrases7: "地铁站在哪里？",
      phrases8: "很好吃",
      phrases9: "我到了",
      phrases10: "可以用卡支付吗？",
      phrases11: "请给我收据",
      phrases12: "请给我菜单",
      phrases13: "请给我水",
      phrases14: "请给我账单",
      phrases15: "请打包",
    },
    playlists: {
      title: "K-pop旅行播放列表",
      description: "登录Spotify，创建AI生成的播放列表。立即体验吧！✨",
      login: "Spotify登录",
      my_playlist: "我的播放列表",
      playlist_preview: "播放列表预览",
      your_playlist: "AI为您创建的专属特别播放列表",
      make_playlist: "登录Spotify后创建您自己的播放列表",
      preview: "预览",
      create_playlist: "创建您的第一个播放列表",
      create_playlist_description: "AI为您量身定制完美的K-pop播放列表",
      start_now: "立即开始",
      create_new_playlist: "创建新播放列表",
      create_new_playlist_description: "使用不同主题或艺术家创建新播放列表",
      featured_youtube_mix: "精选YouTube混音",
      latest_k_pop_travel_playlists: "为您的旅程精选的最新K-pop旅行播放列表",
      view_full_playlist: "查看完整播放列表",
      create_your_own_playlist: "创建您自己的播放列表",
      create_your_own_playlist_description:
        "AI根据您的喜好和旅行主题生成完美的K-pop播放列表。从数千首歌曲的数据库中寻找最佳组合，直接保存到Spotify。",
      ai_custom_recommend: "AI定制推荐",
      unlimited_creation: "无限创建",
      spotify_auto_save: "Spotify自动保存",
      themes1: "城市旅行",
      themes1_desc: "充满活力的城市探索K-pop音乐",
      themes2: "夏日假期",
      themes2_desc: "感受清凉海风和温暖阳光的清爽音乐",
      themes3: "夜市",
      themes3_desc: "在绚丽霓虹灯下的热闹夜街氛围",
      themes4: "安静旅行",
      themes4_desc: "让心灵平静的温柔感性旋律",
      themes5: "运动/健身",
      themes5_desc: "强烈节拍最大化运动效果的强力音乐",
      themes6: "咖啡厅/阅读",
      themes6_desc: "提高专注力的平静精致原声音乐",
      kpop_artists1: "第四代女团",
      kpop_artists2: "第四代男团",
      kpop_artists3: "第三代传奇",
      kpop_artists4: "独唱歌手",
      mock_playlists1: "首尔城市氛围",
      mock_playlists1_desc: "适合在首尔市中心旅行时听的都市K-pop",
      mock_playlists2: "夏日微风",
      mock_playlists2_desc: "清爽夏日假期K-pop",
      play: "播放",
    },
    DocentMantine: {
      title: "AI 讲解",
      subtitle: "实时位置导览",
      aiDocent: "AI 讲解",
      stopVoice: "停止语音",
      current: "当前位置",
      directions: "路线",
      chatbot: "旅游聊天机器人",
      askQuestion: "请问您想了解什么",
      send: "发送",
      examples: {
        title: "示例问题:",
        items: [
          "K-pop恶魔猎人拍摄地",
          "明洞美食推荐",
          "北村韩屋村信息",
          "鱿鱼游戏拍摄地",
        ],
      },
      chatbotPlaceholder: "请输入您的问题...",
      chatbotInitialMessage:
        "您好！我是您的AI旅行讲解员。您可以询问任何关于地点或旅行信息的问题。您也可以发送照片，我会为您提供该地点的详细说明！",
      imageQueryText: "请介绍一下这个地方",
      voiceRecStart: "开始录音...",
      voiceRecResult: "语音识别结果：",
      voiceRecStop: "停止录音。",
      errorReply: "抱歉，生成回复时出错。请稍后再试。",
      filePick: "文件",
      categories: {
        all: "全部",
        museum: "美术馆&博物馆",
        palace: "故宫",
        landmark: "地标",
        historic: "历史遗址",
      },
      allTourismSpots: "全部景点",
      detailedInfo: "详细信息",
      tourismList: "景点列表",
      locationTracking: "位置追踪",
      location: "位置",
      voiceGuide: "语音导览",
      tourDetection: {
        message:
          "🎯 看起来您在咨询旅游相关问题！专业导游服务和定制路线推荐可在旅游页面查看。",
        buttonText: "🎯 前往旅游服务页面",
      },
      viewDetails: "📝 查看详细信息",
      selectPlace: "请选择地点",
    },
    Navigation: {
      persona_analysis: "人格分析",
      result_dashboard: "结果仪表板",
      itinerary_planner: "行程规划",
      ai_docent: "AI导览",
      community: "社区",
      tour: "旅游",
      survival: "生存",
      survival_kit: "生存Kit",
      playlists: "播放列表",
      menu: "菜单",
      personalized_travel_planning: "个性化旅行规划",
      live_info: "实时信息",
      exchange_rate_krw: "汇率 (韩元)",
      seoul_weather: "首尔天气",
      temp: "温度",
      humidity: "湿度",
      wind: "风力",
      refresh_data: "刷新数据",
      expand: "展开",
      collapse: "折叠",
      welcome_traveler: "欢迎，旅行者！",
      plan_your_trip_with_ai: "与AI一起规划您的旅行",
      log_out: "登出",
      log_in: "登录",
    },
    dashboard: {
      edit_route: "编辑路线",
      detail: "详情",
      checking_login_status: "正在检查登录状态...",
      login_required: "需要登录",
      google_login: "使用Google登录",
      microsoft_login: "使用Microsoft登录",
      no_analysis_result: "没有分析结果",
      no_analysis_result_description:
        "未找到最近创建的角色分析结果，请重新分析您的旅行计划。",
      start_analysis: "开始分析",
      login_required_description: "请登录以查看您的旅行角色分析和推荐课程。",
      your_ai_travel_persona: "您的AI旅行角色",
      analyzing: "分析中...",
      travel_persona: "旅行角色",
      custom_recommended_spots: "定制推荐景点",
      custom_recommended_spots_description:
        "我会随机选择符合您角色的首尔地点。",
      refresh: "刷新",
      no_recommended_spots: "加载推荐景点失败。",
      custom_recommended_courses: "定制课程",
      course_search_placeholder: "搜索课程名称、地点...",
      card_view: "卡片视图",
      list_view: "列表视图",
      no_recommended_courses: "没有推荐课程或搜索结果。",
      visit_count: "访问次数",
      stay_period: "停留期间",
      travel_budget: "旅行预算",
      visit_purpose: "访问目的",
      interests_activities: "兴趣与活动",
    },
    persona: {
      choice: "选择",
      checking_login_status: "正在检查登录状态...",
      login_required: "需要登录",
      login_required_description:
        "要使用角色分析功能，请使用Google或Microsoft账户登录。",
      google_login: "使用Google登录",
      microsoft_login: "使用Microsoft登录",
      loading_questions: "正在加载问题...",
      loading_questions_failed: "加载问题失败",
      retry: "重试",
      empty_questions: "问题列表为空",
      empty_questions_description:
        "请检查后端是否正在运行以及问题数据是否正常返回。",
      refresh: "刷新",
      your_ai_travel_persona: "寻找您的AI旅行角色",
      your_ai_travel_persona_description:
        "回答几个问题，AI将推荐符合您旅行风格的课程。",
      previous: "上一页",
      next: "下一页",
      analyzing: "分析中...",
      check_result: "查看结果",
      custom_recommended_spots: "定制推荐景点",
      custom_recommended_spots_description:
        "我们将随机选择符合您角色的首尔地点。",
      refresh: "刷新",
      no_recommended_spots: "无法加载推荐景点。",
      custom_recommended_courses: "定制课程",
      course_search_placeholder: "搜索课程名称、地点...",
      card_view: "卡片视图",
      list_view: "列表视图",
      no_recommended_courses: "没有推荐课程或搜索结果。",
      // Travel Persona 라벨들
      visit_count: "访问次数",
      stay_period: "停留期间",
      travel_budget: "旅行预算",
      visit_purpose: "访问目的",
      interests_activities: "兴趣活动",
      // --- [Add Start] Persona Question Translations ---
      questions: {
        rvit: {
          title: "您访问过韩国几次？",
          options: {
            v1: { label: "第一次", description: "这是我第一次来韩国旅行。" },
            v2: { label: "第二次", description: "我以前来过一次。" },
            v3: { label: "第三次", description: "我现在对这里越来越熟悉了。" },
            v4plus: { label: "4次或以上", description: "我经常来访。" },
          },
        },
        q1_purpose: {
          title: "您这次访问的主要目的是什么？",
          options: {
            leisure: {
              label: "度假/休闲",
              description: "为了个人放松和享受而来。",
            },
            friends: { label: "探亲访友", description: "我来见我认识的人。" },
          },
        },
        r19hap: {
          title: "您計劃停留多久？",
          options: {
            h1: {
              label: "1-3天",
              description: "短暫逗留。",
            },
            h2: {
              label: "4-10天",
              description: "只遊覽著名的旅遊景點。",
            },
            h3: {
              label: "11-18天",
              description: "喜歡與其他遊客交流。",
            },
            h4: {
              label: "19-29天",
              description: "重視像當地人一樣生活的體驗。",
            },
            h5: {
              label: "30天以上",
              description: "對在韓國長期生活（如「生活一個月」）非常感興趣。",
            },
          },
        },
        cost: {
          title: "您的旅行預算是多少？（人均）",
          options: {
            c1: {
              label: "低于7,000元",
              description: "計劃一場經濟實惠的旅行。",
            },
            c2: {
              label: "7,000元 ~ 14,000元",
              description: "偏好合理的消費。",
            },
            c3: {
              label: "14,000元 ~ 22,000元",
              description: "樂於為多樣的體驗投資。",
            },
            c4: {
              label: "22,000元 ~ 29,000元",
              description: "享受旅行，不太受費用限制。",
            },
            c5: {
              label: "29,000元以上",
              description: "偏好奢華的體驗和購物。",
            },
          },
        },
        considered: {
          title: "您对哪些活动感兴趣？",
          options: {
            nature: {
              label: "自然",
              description: "欣赏山、海、公园等自然风光",
            },
            heritage: {
              label: "文化遗产",
              description: "探索宫殿、博物馆、历史遗迹",
            },
            food: {
              label: "美食",
              description: "探访著名餐厅、咖啡馆、街头小吃",
            },
            shopping: {
              label: "购物",
              description: "享受时尚、美妆、纪念品购物",
            },
            relaxation: {
              label: "休闲",
              description: "在水疗中心、海滩、安静的地方休息",
            },
            tradition: {
              label: "传统文化",
              description: "体验韩服、传统表演、韩屋村",
            },
            museum: { label: "艺术/博物馆", description: "观赏艺术品和展览" },
            kpop: {
              label: "K-POP",
              description: "演唱会、粉丝见面会、朝圣之旅",
            },
            arts: { label: "表演/艺术", description: "观看音乐剧、话剧、展览" },
            festival: {
              label: "节日/活动",
              description: "参加当地节日和季节性活动",
            },
            nightlife: {
              label: "夜生活",
              description: "享受俱乐部、酒吧、夜市",
            },
            themepark: {
              label: "主题公园",
              description: "参观游乐园和主题公园",
            },
            beauty: {
              label: "美容/健康",
              description: "体验韩式美容，如美发、美甲、护肤",
            },
            medical: { label: "医疗", description: "使用医疗服务，如健康检查" },
            sports_view: {
              label: "观看体育比赛",
              description: "观看职业体育比赛，如棒球、足球",
            },
            sports_play: {
              label: "体育活动",
              description: "参加滑雪、冲浪等体育活动",
            },
          },
        },
      },
      // --- [Add End] ---
    },
    SurvivalKit: {
      // Hero 섹션
      hero_tagline: "旅行者必备工具",
      hero_title: "生存工具包",
      hero_subtitle: "在韩国旅行中需要的所有工具和信息，在一个地方相遇",

      // 섹션 설명
      section_vision_benefit: "图像文字识别与翻译",
      section_translator_benefit: "实时语音和文本翻译",
      section_culture_benefit: "韩国文化与礼仪指南",

      vision_ocr: "视觉OCR",
      quick_translator: "快速翻译",
      culture_guide: "韩国文化指南",
      // 文化指南翻译
      greeting: "问候礼仪",
      greeting_content: "在韩国，要先向年长者问候，并低头行礼。",
      greeting_extra: "通常轻点头就足够了，用双手握手会显得更礼貌。",
      greeting_modal_title: "韩国的敬语和基本问候表达",
      greeting_modal_paragraphs:
        "韩国有敬语和非敬语，所以问候表达也会根据情况而不同。",
      greeting_modal_paragraphs_2:
        "朋友之间说'안녕'，但对大人或初次见面的人必须说'안녕하세요'才是礼貌的。",
      greeting_modal_list_1: "안녕하세요（日常敬语）",
      greeting_modal_list_2: "안녕하십니까（正式）",
      greeting_modal_list_3: "안녕（亲密关系，非敬语）",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워（谢谢）",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해（对不起）",
      greeting_modal_link_1: "如何向韩国人问候",

      meal: "用餐礼仪",
      meal_content: "大人先拿起餐具，不要端着饭碗吃饭。用双手接酒。",
      meal_extra: "吃完饭后将筷子整齐地放在碗上是礼貌的表现。",
      meal_modal_title: "韩国的用餐礼仪",
      meal_modal_paragraphs:
        "在韩国，用餐不仅仅是吃食物，而是尊重对方的重要场合。",
      meal_modal_paragraphs_2:
        "用餐前说'잘 먹겠습니다'（我开动了），用餐后说'잘 먹었습니다'（我吃好了），这表示对准备食物的人和一起用餐的人们的尊重。",
      meal_modal_list_1: "就座时年长者或客人先坐",
      meal_modal_list_2: "不要把筷子插在饭碗里",
      meal_modal_list_3: "喝酒时稍微转头喝",
      meal_modal_list_4: "大声咀嚼或用筷子指人是失礼的",
      meal_modal_list_5: "把碗放在餐桌上吃",
      meal_modal_link_1: "韩国人的用餐礼仪",

      transportation: "公共交通",
      transportation_content: "在地铁上让座给老弱病残孕，不要大声通话。",
      transportation_extra: "在拥挤时段将包放在前面是体贴的态度。",
      transportation_modal_title: "韩国的公共交通",
      transportation_modal_paragraphs:
        "韩国的地铁和公交车非常方便，但遵守座位和行为礼仪很重要。",
      transportation_modal_paragraphs_2:
        "特别是老弱病残孕专座和孕妇专座对外国人来说容易混淆，即使空着也不坐是一般文化。",
      transportation_modal_list_1:
        "老弱病残孕专座是老人、残疾人、孕妇专用座位，年轻人不使用",
      transportation_modal_list_2:
        "孕妇专座（粉色座位）保持空着，以便孕妇随时使用",
      transportation_modal_list_3: "在公共交通工具内不大声通话",
      transportation_modal_list_4: "将包放在前面或放下，照顾其他乘客",
      transportation_modal_list_5: "上车时让下车乘客先下，然后按顺序上车",
      transportation_modal_link_1: "使用韩国公共交通",
      transportation_modal_link_2: "在首尔使用地铁",

      tip: "小费文化",
      tip_content: "韩国没有小费文化。服务费已经包含在内。",
      tip_extra: "旅游区的一些酒店可能例外地接受少量小费，但不是必须的。",
      tip_modal_title: "韩国的小费文化",
      tip_modal_paragraphs: "韩国的小费文化与西方不同，几乎不存在。",
      tip_modal_list_1: "餐厅·咖啡厅：不需要小费",
      tip_modal_list_2: "出租车：只支付规定费用",
      tip_modal_list_3: "美容院·按摩等服务行业：没有小费文化",

      footwear: "脱鞋",
      footwear_content: "在韩国家庭或一些餐厅要脱鞋进入。",
      footwear_extra: "鞋柜通常在入口处，经常准备室内拖鞋。",
      footwear_modal_title: "韩国的脱鞋文化",
      footwear_modal_paragraphs: "在韩国，进入家中时脱鞋是理所当然的文化。",
      footwear_modal_paragraphs_2:
        "这是为了保持室内清洁和保护家人健康的传统习惯。",
      footwear_modal_paragraphs_3:
        "在室内经常穿拖鞋而不是鞋子，或者只穿袜子生活。",
      footwear_modal_list_1: "家庭：在玄关脱鞋进入",
      footwear_modal_list_2: "传统韩餐厅·韩屋：由于坐式结构经常脱鞋",

      gift: "礼物礼仪",
      gift_content: "接受礼物时用双手接受，不要立即打开是礼貌的。",
      gift_extra: "特别是对大人或上司，酒、保健品、茶等是安全的礼物选择。",
      gift_modal_title: "韩国的礼物礼仪",
      gift_modal_paragraphs:
        "在韩国，礼物不仅仅是物品，而是包含关系和尊重的意义。",
      gift_modal_paragraphs_2: "送礼物和接受礼物时必须使用双手是礼仪。",
      gift_modal_list_1: "用双手给予和接受",
      gift_modal_list_2: "在节日、乔迁、感谢等各种情况下交换礼物",
      modal_close: "关闭",
    },
    VisionOCR: {
      image_upload: "图片上传",
      image_support: "支持JPG、PNG文件",
      image_preview: "图片预览",
      image_preview_desc: "请确认要分析的图片",
      cancel: "取消",
      analyzing: "分析中...",
      analyze_start: "开始分析",
      analyze_result: "分析结果",
      analyze_result_desc: "请点击文本",
      analyze_result_image: "已分析的图片",
      menu_info: "菜单信息",
      ai_generating_answer: "AI正在生成答案...",
      ai_analyze_result: "AI分析结果",
      ai_generated_answer_desc: "此信息是AI生成的参考答案",
      source_info: "来源：韩食振兴院，《韩食菜单外语标记指南800选》",
      menu_name: "菜单名称",
      description: "描述",
      source_info_2: "来源：韩国国际交流财团韩国料理信息",
      food_name: "料理名称",
      translating: "翻译中...",
      source_info_3: "来源：AI Hub（韩国信息化振兴院），观光料理菜单板数据",
      main_ingredients: "主要成分",
      allergy_info: "过敏信息",
      menu_select: "请选择菜单",
      menu_select_desc: "点击图片中的菜单文本",
      menu_select_desc_2: "AI分析的详细菜单信息",
      menu_select_desc_3: "将",
      menu_select_desc_4: "显示",
      new_start: "重新开始",
      file_select: "文件选择",
      no_file_selected: "未选择文件",
      disclaimer:
        "※ 提供的信息仅供参考。关于成分、过敏等菜单的准确信息，请联系餐厅！",
      file_selected: "已选择文件",
    },
    cultureGuide: {
      greeting: "问候礼仪",
      greeting_content: "在韩国，要先向年长者问候，并低头行礼。",
      greeting_extra: "通常轻微的点头就足够了，用双手握手会显得更加恭敬。",
      greeting_modal_title: "韩国的敬语和基本问候表达",
      greeting_modal_paragraphs:
        "韩国有敬语和半语，问候表达也会根据情况有所不同。",
      greeting_modal_paragraphs_2:
        "朋友之间说'안녕'，但对长辈或初次见面的人必须说'안녕하세요'才算有礼貌。",
      greeting_modal_list_1: "안녕하세요 (日常敬语)",
      greeting_modal_list_2: "안녕하십니까 (正式)",
      greeting_modal_list_3: "안녕 (亲密关系，半语)",
      greeting_modal_list_4: "감사합니다 / 고맙습니다 / 고마워",
      greeting_modal_list_5: "죄송합니다 / 미안합니다 / 미안해",
      greeting_modal_link_1: "如何向韩国人问候",
      meal: "用餐礼仪",
      meal_content: "长辈先拿起餐具，不要端着饭碗吃饭。接酒要用双手。",
      meal_extra: "吃完饭后将筷子整齐地放在碗上是礼貌的表现。",
      meal_modal_title: "韩国的用餐礼仪",
      meal_modal_paragraphs:
        "在韩国，用餐不仅仅是吃饭，而是尊重对方的重要场合。",
      meal_modal_paragraphs_2:
        "用餐前说'잘 먹겠습니다'，用餐后说'잘 먹었습니다'，这是对准备的人和一起用餐的人的尊重。",
      meal_modal_list_1: "就座时让长辈或客人先坐。",
      meal_modal_list_2: "不要把筷子插在饭碗里。",
      meal_modal_list_3: "喝酒时要稍微转头喝。",
      meal_modal_list_4: "大声咀嚼或用筷子指人是失礼的。",
      meal_modal_list_5: "要把碗放在餐桌上吃。",
      meal_modal_link_1: "韩国人的用餐礼仪",
      transportation: "公共交通",
      transportation_content: "在地铁上要让座给老弱病残，不要大声通话。",
      transportation_extra: "在拥挤的时间段把包背在前面是体贴的态度。",
      transportation_modal_title: "韩国的公共交通",
      transportation_modal_paragraphs:
        "韩国的地铁和公交车非常方便，但遵守座位和行为礼仪很重要。",
      transportation_modal_paragraphs_2:
        "特别是老弱病残专座和孕妇专座，外国人容易混淆，即使空着也不坐是一般文化。",
      transportation_modal_list_1:
        "老弱病残专座是老人、残疾人、孕妇专用座位，年轻人不使用。",
      transportation_modal_list_2: "孕妇专座（粉色座位）要随时为孕妇空着。",
      transportation_modal_list_3: "在公共交通工具内不要大声通话。",
      transportation_modal_list_4: "不要在地铁或公交车上吃东西。",
      transportation_modal_list_5: "拥挤时把包背在前面是礼貌的。",
      transportation_modal_link_1: "韩国的公共交通礼仪",
      tip: "小费文化",
      tip_content: "韩国没有小费文化。服务费已经包含在内。",
      tip_extra: "旅游区的一些酒店可能例外地接受少量小费，但不是必须的。",
      tip_modal_title: "韩国的小费文化",
      tip_modal_paragraphs: "韩国的小费文化与西方不同，几乎不存在。",
      tip_modal_list_1: "餐厅·咖啡厅：不需要小费",
      tip_modal_list_2: "出租车：只支付规定费用",
      tip_modal_list_3: "美容院·按摩等服务行业：没有小费文化",
      footwear: "脱鞋",
      footwear_content: "在韩国家庭或一些餐厅要脱鞋进入。",
      footwear_extra: "鞋柜通常在入口处，经常准备室内拖鞋。",
      footwear_modal_title: "韩国的脱鞋文化",
      footwear_modal_paragraphs: "在韩国，进入家中时脱鞋是理所当然的文化。",
      footwear_modal_paragraphs_2:
        "这是为了保持室内清洁和保护家人健康的传统习惯。",
      footwear_modal_paragraphs_3:
        "在室内经常穿拖鞋而不是鞋子，或者只穿袜子生活。",
      footwear_modal_list_1: "家庭：在玄关脱鞋进入",
      footwear_modal_list_2: "传统韩餐厅·韩屋：由于坐式结构经常脱鞋",
      gift: "礼物礼仪",
      gift_content: "送礼物时要用双手递送，收到礼物时要表示感谢。",
      gift_extra: "在韩国，礼物包装也很重要，要选择漂亮的包装纸。",
      gift_modal_title: "韩国的礼物礼仪",
      gift_modal_paragraphs: "在韩国，送礼物是表达心意的重要方式。",
      gift_modal_paragraphs_2:
        "节日、搬家祝贺、感谢问候等各种情况下都有礼物往来。",
      gift_modal_list_1: "送礼物时要用双手递送。",
      gift_modal_list_2: "收到礼物时要表示感谢。",
      gift_modal_list_3: "礼物包装要漂亮。",
      gift_modal_list_4: "不要送过于昂贵的礼物。",
      gift_modal_list_5: "节日、搬家祝贺、感谢问候等各种情况下都有礼物往来。",
      gift_modal_link_1: "韩国的礼物礼仪",
    },
    directions: {
      days: "第",
      add_recommended_course: "已添加推荐路线。",
      delete_day: "删除此日程？",
      search_start: "搜索出发地",
      search_end: "搜索目的地",
      search_waypoint: "搜索途经地",
      route_planner: "路线规划器",
      calculate_route: "计算路线",
      calculating_route: "正在计算路线...",
      save_route: "保存路线",
      more: "更多",
      duplicate_day: "复制日程",
      add_day_menu: "添加日程菜单",
      add_day: "添加新日程",
      add_recommended_course: "添加推荐路线",
      set_start: "请设置出发地",
      set_end: "请设置目的地",
      add_waypoint: "添加途经地",
      remove_waypoint: "删除途经地",
      add_waypoint_description: "添加途经地可以创建更精确的路线。",
      map_provider: "地图提供商",
      kakao_map: "Kakao地图",
      t_map: "T地图",
      car: "汽车",
      pedestrian: "步行",
      transit: "公共交通",
      transportation_mode: "交通方式",
      route_order_adjustment: "路线顺序调整",
      drag_to_adjust_order: "拖拽更改顺序",
      start: "出发",
      end: "到达",
      waypoint: "途经",
      add_start: "添加出发地",
      add_end: "添加目的地",
      add_waypoint: "添加途经地",
      select_start: "请选择出发地",
      select_end: "请选择目的地",
      select_waypoint: "请选择途经地",
      travel_summary: "行程摘要",
      total_distance: "总距离",
      estimated_duration: "预计用时",
      minutes: "分钟",
      stay_time: "停留时间（分钟）",
      load_recommended_course: "加载推荐路线",
      load_recommended_course_description: "选择要添加的路线将作为新日程准备。",
      loading_recommended_course: "正在加载推荐路线...",
      load_recommended_course_failed: "无法加载推荐路线。",
      try_again: "重试",
      no_recommended_course: "没有可用的推荐路线。",
      stops: "个",
      keyword_input: "请输入关键词",
      search_result_select_place: "从搜索结果中选择地点",
      waypoint_added: "将添加途经地。",
      start_set: "将设置出发地。",
      end_set: "将设置目的地。",
    },
    planner: {
      new_activity: "新活动",
      no_saved_plans: "没有保存的旅行计划。",
      create_or_modify_plan: "创建新计划或修改现有计划进行管理。",
      new_plan: "新旅行",
      places: "地点",
      days: "天",
      load_plan: "加载此计划",
      delete_plan: "删除此计划",
      login_to_start_plan: "请登录开始规划您的旅行。",
      login: "登录",
      creating_sample_plan: "正在创建示例旅行...",
      no_plan: "没有旅行计划。",
      create_sample_plan: "创建示例旅行",
      saved_schedule: "已保存的日程",
      travel_planner: "旅行日程规划器",
      saving: "保存中...",
      travel_plan: "旅行计划",
      saved_plans: "已保存的计划",
      activity_editor: "活动编辑",
      time_info: "时间信息",
      time: "时间",
      stay_time: "停留时间（分钟）",
      place_info: "地点信息",
      place_name: "地点名称",
      search_place_placeholder: "输入搜索词以获取地点推荐",
      place_type: "地点类型",
      road_address: "道路地址",
      address: "地址",
      latitude: "纬度",
      longitude: "经度",
      additional_info: "附加信息",
      description: "描述",
      description_placeholder: "请输入与活动相关的备注",
      cost_estimate: "预计费用（韩元）",
      cancel: "取消",
      save: "保存",
      add_activity: "添加活动",
      total_days_travel: "总共{{days}}天旅行",
    },
    data: {
      live_info: "实时信息",
      now: "现在",
      is: "是",
      data_update: "数据更新",
      real_time_population: "实时人口",
      about: "约",
      people: "人",
      real_time_commercial: "实时商业",
      overall_commercial: "整体商业",
      subway_arrival_info: "地铁到达信息",
      recommended_tour_products: "推荐旅游产品",
      nearby_cultural_events: "周边文化活动",
      traffic_conditions: "交通状况",
      weather: "天气",
      humidity: "湿度",
      wind_speed: "风速",
      precipitation: "降水量",
      feels_like: "体感",
    },
    mypage: {
      mypage: "我的页面",
      mypage_description: "查看和管理您的活动和信息",
      logout: "登出",
      saved_travel_plans: "保存的旅行计划",
      liked_travel_products: "喜欢的旅行产品",
      my_posts: "我写的文章",
      liked_posts: "喜欢的文章",
      travel_plans: "旅行计划",
      travel_products: "旅行产品",
      likes: "喜欢",
      loading_travel_plans: "正在加载旅行计划...",
      no_saved_travel_plans: "没有保存的旅行计划",
      create_travel_plan_message: "创建并保存您的旅行计划！",
      no_liked_products: "没有喜欢的旅行产品",
      like_products_message: "为您感兴趣的旅行产品点赞！",
      loading: "加载中...",
      no_posts_written: "没有写过的文章",
      write_first_post: "写您的第一篇文章！",
      no_liked_posts: "没有喜欢的文章",
      like_posts_message: "为您感兴趣的文章点赞！",
      delete: "删除",
      travel_plan: "旅行计划",
      destination_undecided: "目的地未定",
      day_schedule: "天行程",
      saved: "保存",
      last_updated: "最近更新",
      loading_details: "正在加载详细信息...",
      time_undecided: "时间未定",
      activity: "活动",
      no_registered_activities: "没有注册的活动",
      no_saved_schedule_info: "没有保存的行程信息",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  ns: [
    "common",
    "QuickTranslator",
    "SurvivalKit",
    "Navigation",
    "VisionOCR",
    "playlists",
    "DocentMantine",
    "dashboard",
    "persona",
    "directions",
    "tour",
    "tourDetail",
    "planner",
    "data",
    "mypage",
  ],
  defaultNS: "common",
});

export default i18n;
