#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
현재 routes 데이터 구조용 검증 스크립트
routes_all_simplified.csv와 페르소나별 파일들의 유효성 검사
"""

import pandas as pd
import os
import requests
import time
from collections import Counter

def validate_main_routes_file():
    """메인 routes 파일 검증"""
    print("=== 메인 routes 파일 검증 ===")
    
    file_path = 'routes/routes_all_simplified.csv'
    
    if not os.path.exists(file_path):
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        return False
    
    try:
        df = pd.read_csv(file_path)
        print(f"✅ 파일 로드 성공: {len(df)}개 행")
    except Exception as e:
        print(f"❌ 파일 로드 오류: {e}")
        return False
    
    # 필수 컬럼 확인
    required_columns = ['페르소나ID', '일차', '코스ID', '구간순서', '장소명', '위도', '경도']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"❌ 필수 컬럼 누락: {missing_columns}")
        return False
    else:
        print("✅ 모든 필수 컬럼 존재")
    
    # 페르소나 ID 확인
    persona_ids = df['페르소나ID'].unique()
    expected_personas = [0, 1, 2, 3, 4, 5]
    missing_personas = set(expected_personas) - set(persona_ids)
    
    if missing_personas:
        print(f"⚠️  누락된 페르소나: {missing_personas}")
    else:
        print("✅ 모든 페르소나 존재")
    
    # 좌표 데이터 확인
    missing_coords = df[(df['위도'].isna()) | (df['경도'].isna())]
    if len(missing_coords) > 0:
        print(f"⚠️  좌표 누락: {len(missing_coords)}개")
        for idx, row in missing_coords.head(5).iterrows():
            print(f"   - {row['장소명']} (페르소나 {row['페르소나ID']})")
    else:
        print("✅ 모든 좌표 존재")
    
    # 서울 지역 좌표 범위 확인
    seoul_lat_range = (37.4, 37.7)
    seoul_lng_range = (126.7, 127.2)
    
    valid_coords = df[(df['위도'].notna()) & (df['경도'].notna())]
    out_of_range = []
    
    for idx, row in valid_coords.iterrows():
        lat, lng = row['위도'], row['경도']
        if not (seoul_lat_range[0] <= lat <= seoul_lat_range[1] and 
                seoul_lng_range[0] <= lng <= seoul_lng_range[1]):
            out_of_range.append((row['장소명'], lat, lng))
    
    if out_of_range:
        print(f"⚠️  서울 범위를 벗어난 좌표: {len(out_of_range)}개")
        for place, lat, lng in out_of_range[:3]:  # 처음 3개만 표시
            print(f"   - {place}: {lat}, {lng}")
    else:
        print("✅ 모든 좌표가 서울 지역 범위 내")
    
    # 페르소나별 통계
    print(f"\n=== 페르소나별 통계 ===")
    persona_stats = df.groupby('페르소나ID').agg({
        '장소명': 'count',
        '일차': 'nunique',
        '코스ID': 'nunique'
    }).rename(columns={'장소명': '총장소수', '일차': '일차수', '코스ID': '코스수'})
    
    for persona_id, stats in persona_stats.iterrows():
        print(f"페르소나 {persona_id}: {stats['총장소수']}개 장소, {stats['일차수']}일차, {stats['코스수']}개 코스")
    
    return True

def validate_persona_files():
    """페르소나별 파일들 검증"""
    print("\n=== 페르소나별 파일 검증 ===")
    
    routes_dir = 'routes'
    persona_files = [f for f in os.listdir(routes_dir) if f.startswith('persona_') and f.endswith('.csv')]
    
    if not persona_files:
        print("❌ 페르소나 파일을 찾을 수 없습니다.")
        return False
    
    print(f"발견된 페르소나 파일: {len(persona_files)}개")
    
    valid_files = 0
    total_rows = 0
    
    for filename in sorted(persona_files):
        filepath = os.path.join(routes_dir, filename)
        try:
            df = pd.read_csv(filepath)
            total_rows += len(df)
            
            # 기본 검증
            required_columns = ['페르소나ID', '일차', '코스ID', '장소명', '위도', '경도']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                print(f"❌ {filename}: 필수 컬럼 누락 - {missing_columns}")
                continue
            
            # 좌표 검증
            missing_coords = df[(df['위도'].isna()) | (df['경도'].isna())]
            if len(missing_coords) > 0:
                print(f"⚠️  {filename}: 좌표 누락 {len(missing_coords)}개")
            else:
                print(f"✅ {filename}: {len(df)}개 행, 좌표 완성")
                valid_files += 1
                
        except Exception as e:
            print(f"❌ {filename}: 파일 읽기 오류 - {e}")
    
    print(f"\n=== 페르소나 파일 검증 결과 ===")
    print(f"유효한 파일: {valid_files}/{len(persona_files)}")
    print(f"총 행 수: {total_rows}")
    
    return valid_files == len(persona_files)

def test_coordinate_accuracy():
    """좌표 정확성 테스트 (샘플)"""
    print("\n=== 좌표 정확성 테스트 ===")
    
    file_path = 'routes/routes_all_simplified.csv'
    if not os.path.exists(file_path):
        print("❌ 메인 파일을 찾을 수 없습니다.")
        return
    
    try:
        df = pd.read_csv(file_path)
        valid_coords = df[(df['위도'].notna()) & (df['경도'].notna())]
        
        # 샘플 3개 장소로 테스트
        sample_places = valid_coords.head(3)
        
        for idx, row in sample_places.iterrows():
            place_name = row['장소명']
            lat, lng = row['위도'], row['경도']
            
            print(f"\n📍 {place_name}")
            print(f"   좌표: {lat}, {lng}")
            
            # OpenStreetMap 역지오코딩 테스트
            try:
                url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18"
                headers = {'User-Agent': 'Seoul Tourism Route Validator 1.0'}
                
                response = requests.get(url, headers=headers)
                time.sleep(1)  # API 제한 고려
                
                if response.status_code == 200:
                    data = response.json()
                    if 'display_name' in data:
                        address = data['display_name']
                        print(f"   실제 주소: {address}")
                        
                        # 한국/서울 관련 키워드 확인
                        if any(keyword in address.lower() for keyword in ['korea', 'seoul', '서울', '한국']):
                            print("   ✅ 한국/서울 지역으로 확인됨")
                        else:
                            print("   ⚠️  한국/서울 지역이 아닐 수 있음")
                    else:
                        print("   ❌ 주소 정보를 찾을 수 없음")
                else:
                    print(f"   ❌ API 호출 실패: {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ 좌표 검증 오류: {e}")
    
    except Exception as e:
        print(f"❌ 좌표 테스트 오류: {e}")

def main():
    """메인 실행 함수"""
    print("현재 routes 데이터 검증을 시작합니다...\n")
    
    # 메인 파일 검증
    main_valid = validate_main_routes_file()
    
    # 페르소나별 파일 검증
    persona_valid = validate_persona_files()
    
    # 좌표 정확성 테스트
    test_coordinate_accuracy()
    
    print(f"\n=== 전체 검증 결과 ===")
    print(f"메인 파일: {'✅' if main_valid else '❌'}")
    print(f"페르소나 파일: {'✅' if persona_valid else '❌'}")
    
    if main_valid and persona_valid:
        print("\n🎉 모든 데이터가 유효합니다!")
    else:
        print("\n⚠️  일부 데이터에 문제가 있습니다.")

if __name__ == "__main__":
    main()
