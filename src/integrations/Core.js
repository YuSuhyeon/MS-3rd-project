export async function InvokeLLM({ prompt, response_json_schema }) {
  // 간단한 모의 응답
  return {
    persona_type: '문화 탐험가',
    persona_description: '역사와 전통을 사랑하고 깊이 있는 경험을 선호합니다.',
    analysis_reason: '선호 활동과 여행 스타일 답변을 바탕으로 분석했습니다.',
    recommended_destinations: [
      { name: '경주', description: '신라 천년 고도의 매력', image_url: '', activities: ['사적지 투어', '전통체험'] },
      { name: '전주', description: '한옥마을과 미식', image_url: '', activities: ['한옥 산책', '미식 투어'] },
      { name: '수원', description: '세계문화유산 화성', image_url: '', activities: ['문화 탐방'] }
    ]
  };
}
