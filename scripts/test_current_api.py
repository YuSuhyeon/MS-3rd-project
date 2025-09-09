#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
현재 routes 데이터용 API 테스트 스크립트
카카오맵 API와 OpenStreetMap API 연결 테스트
"""

import requests
import json
import pandas as pd
import time

def test_kakao_api():
    """카카오맵 API 연결 테스트"""
    print("=== 카카오맵 API 테스트 ===")
    
    # API 키 (실제 사용시 환경변수에서 가져오도록 수정 필요)
    api_key = "835dcb2b6d0fcbb3d86e916960f80d67"
    headers = {
        'Authorization': f'KakaoAK {api_key}'
    }
    
    # 테스트할 장소들 (현재 routes에서 가져온 실제 장소명)
    test_places = [
        "경복궁",
        "북촌한옥마을", 
        "명동 쇼핑스트리트",
        "남산케이블카",
        "롯데월드타워 서울스카이"
    ]
    
    success_count = 0
    total_count = len(test_places)
    
    for place_name in test_places:
        print(f"\n📍 테스트 장소: {place_name}")
        
        try:
            # 키워드 검색 API 호출
            url = "https://dapi.kakao.com/v2/local/search/keyword.json"
            params = {
                'query': place_name,
                'size': 1
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data['documents']:
                    result = data['documents'][0]
                    print(f"  ✅ 성공: {result['place_name']}")
                    print(f"  주소: {result['address_name']}")
                    print(f"  좌표: {result['y']}, {result['x']}")
                    success_count += 1
                else:
                    print(f"  ⚠️  검색 결과 없음")
            elif response.status_code == 401:
                print(f"  ❌ 인증 실패 (401) - API 키 확인 필요")
                break
            elif response.status_code == 403:
                print(f"  ❌ 권한 없음 (403) - API 사용 권한 확인 필요")
                break
            else:
                print(f"  ❌ API 오류: {response.status_code}")
                print(f"  응답: {response.text[:100]}...")
                
        except Exception as e:
            print(f"  ❌ 요청 오류: {e}")
        
        # API 호출 제한 고려
        time.sleep(0.1)
    
    print(f"\n=== 카카오맵 API 테스트 결과 ===")
    print(f"성공: {success_count}/{total_count}")
    print(f"성공률: {success_count/total_count*100:.1f}%")
    
    return success_count > 0

def test_openstreetmap_api():
    """OpenStreetMap API 테스트"""
    print(f"\n=== OpenStreetMap API 테스트 ===")
    
    # 테스트할 주소들
    test_addresses = [
        "서울특별시 종로구 사직로 161 경복궁",
        "서울특별시 종로구 계동 북촌한옥마을",
        "서울특별시 중구 명동 명동 쇼핑스트리트",
        "서울특별시 용산구 남산공원길 105 남산케이블카",
        "서울특별시 송파구 올림픽로 300 롯데월드타워"
    ]
    
    success_count = 0
    total_count = len(test_addresses)
    
    for address in test_addresses:
        print(f"\n📍 테스트 주소: {address}")
        
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': address,
                'format': 'json',
                'countrycodes': 'kr',
                'limit': 1
            }
            headers = {
                'User-Agent': 'Seoul Tourism Route Tester 1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    result = data[0]
                    print(f"  ✅ 성공: {result['display_name']}")
                    print(f"  좌표: {result['lat']}, {result['lon']}")
                    success_count += 1
                else:
                    print(f"  ⚠️  검색 결과 없음")
            else:
                print(f"  ❌ API 오류: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ 요청 오류: {e}")
        
        # API 호출 제한 고려
        time.sleep(1)
    
    print(f"\n=== OpenStreetMap API 테스트 결과 ===")
    print(f"성공: {success_count}/{total_count}")
    print(f"성공률: {success_count/total_count*100:.1f}%")
    
    return success_count > 0

def test_coordinate_validation():
    """현재 routes 데이터의 좌표 검증 테스트"""
    print(f"\n=== 현재 데이터 좌표 검증 테스트 ===")
    
    file_path = 'routes/routes_all_simplified.csv'
    
    if not os.path.exists(file_path):
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        return False
    
    try:
        df = pd.read_csv(file_path)
        print(f"✅ 데이터 로드 완료: {len(df)}개 행")
    except Exception as e:
        print(f"❌ 데이터 로드 오류: {e}")
        return False
    
    # 좌표가 있는 데이터만 필터링
    valid_coords = df[(df['위도'].notna()) & (df['경도'].notna())]
    print(f"유효한 좌표: {len(valid_coords)}개")
    
    if len(valid_coords) == 0:
        print("❌ 유효한 좌표가 없습니다.")
        return False
    
    # 샘플 3개로 역지오코딩 테스트
    sample_places = valid_coords.head(3)
    success_count = 0
    
    for idx, row in sample_places.iterrows():
        place_name = row['장소명']
        lat, lng = row['위도'], row['경도']
        
        print(f"\n📍 {place_name} ({lat}, {lng})")
        
        try:
            # OpenStreetMap 역지오코딩
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18"
            headers = {'User-Agent': 'Seoul Tourism Route Tester 1.0'}
            
            response = requests.get(url, headers=headers, timeout=10)
            time.sleep(1)  # API 제한 고려
            
            if response.status_code == 200:
                data = response.json()
                if 'display_name' in data:
                    address = data['display_name']
                    print(f"  ✅ 역지오코딩 성공")
                    print(f"  주소: {address}")
                    
                    # 한국/서울 관련 키워드 확인
                    if any(keyword in address.lower() for keyword in ['korea', 'seoul', '서울', '한국']):
                        print(f"  ✅ 한국/서울 지역으로 확인됨")
                        success_count += 1
                    else:
                        print(f"  ⚠️  한국/서울 지역이 아닐 수 있음")
                else:
                    print(f"  ❌ 주소 정보를 찾을 수 없음")
            else:
                print(f"  ❌ API 호출 실패: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ 좌표 검증 오류: {e}")
    
    print(f"\n=== 좌표 검증 테스트 결과 ===")
    print(f"성공: {success_count}/{len(sample_places)}")
    print(f"성공률: {success_count/len(sample_places)*100:.1f}%")
    
    return success_count > 0

def main():
    """메인 실행 함수"""
    print("현재 routes 데이터용 API 테스트를 시작합니다...\n")
    
    # 카카오맵 API 테스트
    kakao_success = test_kakao_api()
    
    # OpenStreetMap API 테스트
    osm_success = test_openstreetmap_api()
    
    # 현재 데이터 좌표 검증 테스트
    coord_success = test_coordinate_validation()
    
    print(f"\n=== 전체 테스트 결과 ===")
    print(f"카카오맵 API: {'✅ 성공' if kakao_success else '❌ 실패'}")
    print(f"OpenStreetMap API: {'✅ 성공' if osm_success else '❌ 실패'}")
    print(f"좌표 검증: {'✅ 성공' if coord_success else '❌ 실패'}")
    
    if not kakao_success:
        print(f"\n⚠️  카카오맵 API 사용을 위해서는:")
        print(f"1. API 키가 올바른지 확인")
        print(f"2. API 사용 권한이 활성화되어 있는지 확인")
        print(f"3. 일일 사용량 한도를 확인")
    
    if osm_success:
        print(f"\n✅ OpenStreetMap을 대안으로 사용 가능합니다.")
    
    if coord_success:
        print(f"\n✅ 현재 데이터의 좌표가 유효합니다.")

if __name__ == "__main__":
    main()
