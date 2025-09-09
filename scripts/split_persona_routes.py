#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
페르소나별 경로 파일 분할 스크립트
routes_all_simplified.csv를 페르소나별로 분할하여 개별 파일 생성
"""

import pandas as pd
import os
from collections import defaultdict

def split_persona_routes():
    """페르소나별로 경로 데이터를 분할하여 개별 파일 생성"""
    
    # 입력 파일 경로
    input_file = 'routes/routes_all_simplified.csv'
    output_dir = 'routes'
    
    # 페르소나별 이름 매핑
    persona_names = {
        0: '알뜰 필수코스 정복자',
        1: '플렉스 장기 체류객', 
        2: '관계 중심 체류객',
        3: '실속파 쇼핑 원정대',
        4: '문화유산 탐험가',
        5: '미니멀K-컬처팬'
    }
    
    print("=== 페르소나별 경로 파일 분할 시작 ===")
    
    # 데이터 로드
    if not os.path.exists(input_file):
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        return False
    
    try:
        df = pd.read_csv(input_file)
        print(f"✅ 데이터 로드 완료: {len(df)}개 행")
    except Exception as e:
        print(f"❌ 데이터 로드 오류: {e}")
        return False
    
    # 페르소나별로 데이터 분할
    persona_data = defaultdict(list)
    
    for _, row in df.iterrows():
        persona_id = int(row['페르소나ID'])
        persona_data[persona_id].append(row)
    
    print(f"✅ 페르소나별 데이터 분할 완료: {len(persona_data)}개 페르소나")
    
    # 각 페르소나별로 파일 생성
    created_files = []
    
    for persona_id, data in persona_data.items():
        if persona_id not in persona_names:
            print(f"⚠️  알 수 없는 페르소나 ID: {persona_id}")
            continue
        
        # 데이터프레임 생성
        persona_df = pd.DataFrame(data)
        
        # 파일명 생성
        persona_name = persona_names[persona_id]
        filename = f"persona_{persona_id}_{persona_name}.csv"
        filepath = os.path.join(output_dir, filename)
        
        # 파일 저장
        try:
            persona_df.to_csv(filepath, index=False, encoding='utf-8')
            created_files.append(filename)
            print(f"✅ 생성됨: {filename} ({len(persona_df)}개 행)")
        except Exception as e:
            print(f"❌ 파일 생성 오류 ({filename}): {e}")
    
    print(f"\n=== 분할 완료 ===")
    print(f"생성된 파일: {len(created_files)}개")
    for filename in created_files:
        print(f"  - {filename}")
    
    return True

def validate_split_files():
    """분할된 파일들의 유효성 검사"""
    print("\n=== 분할 파일 유효성 검사 ===")
    
    output_dir = 'routes'
    persona_files = [f for f in os.listdir(output_dir) if f.startswith('persona_') and f.endswith('.csv')]
    
    if not persona_files:
        print("❌ 페르소나 파일을 찾을 수 없습니다.")
        return False
    
    total_rows = 0
    valid_files = 0
    
    for filename in persona_files:
        filepath = os.path.join(output_dir, filename)
        try:
            df = pd.read_csv(filepath)
            total_rows += len(df)
            valid_files += 1
            
            # 기본 컬럼 확인
            required_columns = ['페르소나ID', '일차', '코스ID', '장소명', '위도', '경도']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                print(f"⚠️  {filename}: 필수 컬럼 누락 - {missing_columns}")
            else:
                print(f"✅ {filename}: {len(df)}개 행, 모든 컬럼 존재")
                
        except Exception as e:
            print(f"❌ {filename}: 파일 읽기 오류 - {e}")
    
    print(f"\n=== 검사 결과 ===")
    print(f"유효한 파일: {valid_files}/{len(persona_files)}")
    print(f"총 행 수: {total_rows}")
    
    return valid_files == len(persona_files)

def main():
    """메인 실행 함수"""
    print("페르소나별 경로 파일 분할을 시작합니다...\n")
    
    # 페르소나별 분할 실행
    success = split_persona_routes()
    
    if success:
        # 분할 파일 유효성 검사
        validate_split_files()
        print("\n🎉 페르소나별 파일 분할이 완료되었습니다!")
    else:
        print("\n❌ 페르소나별 파일 분할에 실패했습니다.")

if __name__ == "__main__":
    main()
