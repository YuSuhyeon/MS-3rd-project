#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Routes 데이터 업데이트 및 자동 정렬 스크립트
매번 변경할 때마다 자동으로 정렬을 수행합니다.
"""

import pandas as pd
import sys
import os

def load_routes():
    """routes_all_simplified.csv 파일을 로드합니다."""
    try:
        df = pd.read_csv('routes/routes_all_simplified.csv')
        print(f"✅ 데이터 로드 성공: {len(df)}개 행")
        return df
    except Exception as e:
        print(f"❌ 데이터 로드 실패: {e}")
        return None

def save_routes(df):
    """데이터를 정렬하고 저장합니다."""
    try:
        # 자동 정렬 (페르소나ID, 일차, 코스ID, 구간순서 순)
        df_sorted = df.sort_values(['페르소나ID', '일차', '코스ID', '구간순서'])
        
        # 파일 저장
        df_sorted.to_csv('routes/routes_all_simplified.csv', index=False, encoding='utf-8')
        print(f"✅ 자동 정렬 및 저장 완료: {len(df_sorted)}개 행")
        return df_sorted
    except Exception as e:
        print(f"❌ 저장 실패: {e}")
        return None

def add_place(persona_id, day, course_id, place_name, lat, lng, description=""):
    """새로운 장소를 추가합니다."""
    df = load_routes()
    if df is None:
        return None
    
    print(f"=== {place_name} 추가 ===")
    if description:
        print(f"설명: {description}")
    
    # 해당 코스의 현재 마지막 구간순서 확인
    course_mask = (df['페르소나ID'] == persona_id) & (df['일차'] == day) & (df['코스ID'] == course_id)
    course_data = df[course_mask]
    max_order = course_data['구간순서'].max() if len(course_data) > 0 else 0
    
    print(f"현재 {course_id} 코스의 마지막 구간순서: {max_order}")
    
    # 새로운 행 추가
    new_row = {
        '페르소나ID': persona_id,
        '일차': day,
        '코스ID': course_id,
        '구간순서': max_order + 1,
        '장소명': place_name,
        '위도': lat,
        '경도': lng
    }
    
    # 새로운 행을 데이터프레임에 추가
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    
    print(f"✅ {place_name} 추가 완료!")
    print(f"  위치: 페르소나 {persona_id}, 일차 {day}, 코스 {course_id}, 구간순서 {max_order + 1}")
    print(f"  좌표: {lat}, {lng}")
    
    return save_routes(df)

def update_place(old_name, new_name, new_lat=None, new_lng=None, description=""):
    """기존 장소를 업데이트합니다."""
    df = load_routes()
    if df is None:
        return None
    
    print(f"=== {old_name} → {new_name} 업데이트 ===")
    if description:
        print(f"설명: {description}")
    
    # 기존 장소 찾기
    mask = df['장소명'] == old_name
    count = mask.sum()
    
    if count == 0:
        print(f"❌ {old_name}을 찾을 수 없습니다.")
        return None
    
    print(f"찾은 행: {count}개")
    
    # 장소명 업데이트
    df.loc[mask, '장소명'] = new_name
    
    # 좌표 업데이트 (제공된 경우)
    if new_lat is not None:
        df.loc[mask, '위도'] = new_lat
    if new_lng is not None:
        df.loc[mask, '경도'] = new_lng
    
    print(f"✅ 업데이트 완료!")
    print(f"  장소명: {old_name} → {new_name}")
    if new_lat is not None and new_lng is not None:
        print(f"  좌표: {new_lat}, {new_lng}")
    
    # 업데이트된 행 확인
    updated_rows = df[mask]
    for idx, row in updated_rows.iterrows():
        print(f"  - 페르소나 {row['페르소나ID']}, 일차 {row['일차']}, 코스 {row['코스ID']}, 구간순서 {row['구간순서']}: {row['장소명']}")
    
    return save_routes(df)

def move_place(place_name, from_persona, from_day, from_course, to_persona, to_day, to_course, description=""):
    """장소를 다른 코스로 이동합니다."""
    df = load_routes()
    if df is None:
        return None
    
    print(f"=== {place_name} 이동 ===")
    if description:
        print(f"설명: {description}")
    
    # 기존 장소 찾기
    mask = (df['페르소나ID'] == from_persona) & (df['일차'] == from_day) & (df['코스ID'] == from_course) & (df['장소명'] == place_name)
    count = mask.sum()
    
    if count == 0:
        print(f"❌ {place_name}을 찾을 수 없습니다.")
        return None
    
    print(f"찾은 행: {count}개")
    
    # 현재 위치 확인
    current_info = df[mask].iloc[0]
    print(f"현재 위치: 페르소나 {current_info['페르소나ID']}, 일차 {current_info['일차']}, 코스 {current_info['코스ID']}, 구간순서 {current_info['구간순서']}")
    
    # 목적지 코스의 마지막 구간순서 확인
    target_course_mask = (df['페르소나ID'] == to_persona) & (df['일차'] == to_day) & (df['코스ID'] == to_course)
    target_course_data = df[target_course_mask]
    max_order = target_course_data['구간순서'].max() if len(target_course_data) > 0 else 0
    
    # 이동
    df.loc[mask, '페르소나ID'] = to_persona
    df.loc[mask, '일차'] = to_day
    df.loc[mask, '코스ID'] = to_course
    df.loc[mask, '구간순서'] = max_order + 1
    
    print(f"✅ 이동 완료!")
    print(f"  {place_name}: 페르소나 {from_persona}, 일차 {from_day}, 코스 {from_course} → 페르소나 {to_persona}, 일차 {to_day}, 코스 {to_course}, 구간순서 {max_order + 1}")
    
    return save_routes(df)

def main():
    """메인 함수 - 사용 예시"""
    print("Routes 데이터 업데이트 및 자동 정렬 스크립트")
    print("=" * 50)
    
    # 사용 예시
    print("사용 예시:")
    print("1. 장소 추가:")
    print("   add_place(5, 1, '5A', '케이팝 스퀘어 홍대', 37.5500, 126.9200, '서울 마포구 양화로 141')")
    print()
    print("2. 장소 업데이트:")
    print("   update_place('홍대 K-뷰티 메이크업 클래스', '오어(메이크업 원데이 클래스)', 37.5500, 126.9200)")
    print()
    print("3. 장소 이동:")
    print("   move_place('비트로드', 5, 5, '5E', 5, 1, '5A')")
    print()
    print("모든 변경사항은 자동으로 정렬됩니다!")

if __name__ == "__main__":
    main()
