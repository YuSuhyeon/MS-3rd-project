import requests
import json
import logging
from typing import Optional, Dict, Any

class TourismService:
    """
    관광 정보 서비스 클래스 (간단 버전)
    외부 관광 API를 호출하여 정보를 제공
    """
    
    def __init__(self):
        self.function_url = "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/tourismqnaapi?code=BcqZANgpmolF-eQNAkdB4BgrhINolY8tLktSFVRHhaGhAzFu3b1_Tw=="
        self.default_location = "Seoul,KR"
        self.timeout = 30
        
        # 로깅 설정
        self.logger = logging.getLogger(__name__)
    
    def get_tourism_info(self, query: str, location: str = None) -> Optional[str]:
        """
        관광 정보를 가져오는 메인 메서드
        
        Args:
            query (str): 사용자 질문
            location (str, optional): 위치 정보
            
        Returns:
            Optional[str]: 답변 텍스트 또는 None (오류시)
        """
        try:
            result = self._call_tourism_api(query, location)
            return result.get('answer', '답변을 찾을 수 없습니다.')
        except Exception as e:
            self.logger.error(f"관광 정보 조회 오류: {e}")
            return None
    
    def _call_tourism_api(self, user_query: str, location: str = None) -> Dict[str, Any]:
        """
        외부 관광 API 호출
        
        Args:
            user_query (str): 사용자 질문
            location (str, optional): 위치 정보
            
        Returns:
            Dict[str, Any]: API 응답 결과
            
        Raises:
            requests.RequestException: API 호출 실패시
            ValueError: 응답 파싱 실패시
        """
        if not user_query.strip():
            raise ValueError("질문이 비어있습니다.")
        
        if location is None:
            location = self.default_location
            
        payload = {
            "query": user_query,
            "location": location
        }
        
        try:
            self.logger.info(f"API 호출 시작: {user_query}")
            
            response = requests.post(
                self.function_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=self.timeout
            )
            
            self.logger.info(f"응답 상태: {response.status_code}")
            
            if not response.ok:
                error_text = response.text
                self.logger.error(f"API 응답 오류: {error_text}")
                raise requests.RequestException(f"HTTP error! status: {response.status_code}")
            
            result = response.json()
            self.logger.info(f"API 응답 성공: 답변 길이 {len(result.get('answer', ''))}")
            return result
            
        except requests.exceptions.Timeout:
            self.logger.error("API 호출 타임아웃")
            raise requests.RequestException("API 호출 타임아웃")
        except requests.exceptions.ConnectionError:
            self.logger.error("네트워크 연결 오류")
            raise requests.RequestException("네트워크 연결 오류")
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON 파싱 오류: {e}")
            raise ValueError("응답 JSON 파싱 실패")
        except Exception as e:
            self.logger.error(f"예상치 못한 오류: {e}")
            raise
    
    def get_example_queries(self) -> list:
        """
        예시 질문 목록 반환
        
        Returns:
            list: 예시 질문들
        """
        return [
            "케이팝 데몬 헌터스 촬영지",
            "명동 맛집 추천",
            "북촌한옥마을 정보",
            "오징어게임 촬영지",
            "경복궁 관람 정보",
            "홍대 클럽 추천",
            "인사동 전통차집",
            "남산타워 야경 명소"
        ]
    
    def validate_query(self, query: str) -> tuple[bool, str]:
        """
        질문 유효성 검사
        
        Args:
            query (str): 검사할 질문
            
        Returns:
            tuple[bool, str]: (유효성 여부, 오류 메시지)
        """
        if not query:
            return False, "질문이 비어있습니다."
        
        if not query.strip():
            return False, "빈 질문은 처리할 수 없습니다."
        
        if len(query.strip()) < 2:
            return False, "질문이 너무 짧습니다."
        
        if len(query) > 500:
            return False, "질문이 너무 깁니다. (최대 500자)"
        
        return True, ""