#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Routes 데이터 분석 및 통계 스크립트
현재 routes 데이터의 상세 분석 및 통계 정보 제공
"""

import pandas as pd
import os
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import numpy as np

def analyze_main_data():
    """메인 데이터 분석"""
    print("=== 메인 데이터 분석 ===")
    
    file_path = 'routes/routes_all_simplified.csv'
    
    if not os.path.exists(file_path):
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        return None
    
    try:
        df = pd.read_csv(file_path)
        print(f"✅ 데이터 로드 완료: {len(df)}개 행")
    except Exception as e:
        print(f"❌ 데이터 로드 오류: {e}")
        return None
    
    # 기본 통계
    print(f"\n=== 기본 통계 ===")
    print(f"총 장소 수: {len(df)}")
    print(f"페르소나 수: {df['페르소나ID'].nunique()}")
    print(f"총 일차 수: {df['일차'].nunique()}")
    print(f"총 코스 수: {df['코스ID'].nunique()}")
    
    # 페르소나별 분석
    print(f"\n=== 페르소나별 분석 ===")
    persona_stats = df.groupby('페르소나ID').agg({
        '장소명': 'count',
        '일차': 'nunique',
        '코스ID': 'nunique',
        '위도': lambda x: x.notna().sum(),
        '경도': lambda x: x.notna().sum()
    }).rename(columns={
        '장소명': '총장소수',
        '일차': '일차수', 
        '코스ID': '코스수',
        '위도': '위도완성',
        '경도': '경도완성'
    })
    
    persona_names = {
        0: '알뜰 필수코스 정복자',
        1: '플렉스 장기 체류객',
        2: '관계 중심 체류객', 
        3: '실속파 쇼핑 원정대',
        4: '문화유산 탐험가',
        5: '미니멀K-컬처팬'
    }
    
    for persona_id, stats in persona_stats.iterrows():
        name = persona_names.get(persona_id, f"페르소나 {persona_id}")
        print(f"{name}:")
        print(f"  - 총 장소: {stats['총장소수']}개")
        print(f"  - 일차: {stats['일차수']}일")
        print(f"  - 코스: {stats['코스수']}개")
        print(f"  - 좌표 완성: {stats['위도완성']}/{stats['총장소수']} ({stats['위도완성']/stats['총장소수']*100:.1f}%)")
        print()
    
    return df

def analyze_coordinate_distribution(df):
    """좌표 분포 분석"""
    print("=== 좌표 분포 분석 ===")
    
    valid_coords = df[(df['위도'].notna()) & (df['경도'].notna())]
    
    if len(valid_coords) == 0:
        print("❌ 유효한 좌표가 없습니다.")
        return
    
    print(f"유효한 좌표: {len(valid_coords)}개 ({len(valid_coords)/len(df)*100:.1f}%)")
    
    # 좌표 범위
    lat_min, lat_max = valid_coords['위도'].min(), valid_coords['위도'].max()
    lng_min, lng_max = valid_coords['경도'].min(), valid_coords['경도'].max()
    
    print(f"위도 범위: {lat_min:.6f} ~ {lat_max:.6f}")
    print(f"경도 범위: {lng_min:.6f} ~ {lng_max:.6f}")
    
    # 서울 지역 범위 확인
    seoul_lat_range = (37.4, 37.7)
    seoul_lng_range = (126.7, 127.2)
    
    in_seoul = valid_coords[
        (valid_coords['위도'] >= seoul_lat_range[0]) & (valid_coords['위도'] <= seoul_lat_range[1]) &
        (valid_coords['경도'] >= seoul_lng_range[0]) & (valid_coords['경도'] <= seoul_lng_range[1])
    ]
    
    print(f"서울 지역 내 좌표: {len(in_seoul)}개 ({len(in_seoul)/len(valid_coords)*100:.1f}%)")
    
    if len(in_seoul) < len(valid_coords):
        out_of_seoul = valid_coords[~valid_coords.index.isin(in_seoul.index)]
        print(f"서울 지역 외 좌표: {len(out_of_seoul)}개")
        for idx, row in out_of_seoul.head(5).iterrows():
            print(f"  - {row['장소명']}: {row['위도']}, {row['경도']}")

def analyze_place_types(df):
    """장소 유형 분석"""
    print("\n=== 장소 유형 분석 ===")
    
    # 식당/카페 식별
    restaurant_keywords = ['식당', '카페', '맛집', '레스토랑', '음식', '요리']
    cafe_keywords = ['카페', '커피', '음료']
    
    df['장소유형'] = '관광지'
    
    for idx, row in df.iterrows():
        place_name = str(row['장소명']).lower()
        
        if any(keyword in place_name for keyword in restaurant_keywords):
            df.at[idx, '장소유형'] = '식당'
        elif any(keyword in place_name for keyword in cafe_keywords):
            df.at[idx, '장소유형'] = '카페'
        elif '올리브영' in place_name:
            df.at[idx, '장소유형'] = '쇼핑'
    
    # 장소 유형별 통계
    place_type_stats = df['장소유형'].value_counts()
    print("장소 유형별 분포:")
    for place_type, count in place_type_stats.items():
        print(f"  {place_type}: {count}개 ({count/len(df)*100:.1f}%)")
    
    # 페르소나별 장소 유형 분석
    print(f"\n=== 페르소나별 장소 유형 분석 ===")
    persona_place_types = df.groupby(['페르소나ID', '장소유형']).size().unstack(fill_value=0)
    
    for persona_id in persona_place_types.index:
        name = persona_names.get(persona_id, f"페르소나 {persona_id}")
        print(f"\n{name}:")
        for place_type in persona_place_types.columns:
            count = persona_place_types.loc[persona_id, place_type]
            if count > 0:
                print(f"  {place_type}: {count}개")

def analyze_course_structure(df):
    """코스 구조 분석"""
    print(f"\n=== 코스 구조 분석 ===")
    
    # 페르소나별 코스 분석
    for persona_id in sorted(df['페르소나ID'].unique()):
        persona_data = df[df['페르소나ID'] == persona_id]
        name = persona_names.get(persona_id, f"페르소나 {persona_id}")
        
        print(f"\n{name}:")
        
        # 일차별 분석
        day_stats = persona_data.groupby('일차').agg({
            '장소명': 'count',
            '코스ID': 'nunique'
        }).rename(columns={'장소명': '장소수', '코스ID': '코스수'})
        
        for day, stats in day_stats.iterrows():
            print(f"  {day}일차: {stats['장소수']}개 장소, {stats['코스수']}개 코스")
            
            # 해당 일차의 코스별 장소 수
            day_data = persona_data[persona_data['일차'] == day]
            course_stats = day_data.groupby('코스ID')['장소명'].count()
            for course_id, count in course_stats.items():
                print(f"    {course_id}: {count}개 장소")

def create_visualizations(df):
    """시각화 생성"""
    print(f"\n=== 시각화 생성 ===")
    
    try:
        # 한글 폰트 설정
        plt.rcParams['font.family'] = 'DejaVu Sans'
        
        # 1. 페르소나별 장소 수 막대 그래프
        plt.figure(figsize=(12, 6))
        persona_counts = df['페르소나ID'].value_counts().sort_index()
        persona_names_list = [persona_names[i] for i in persona_counts.index]
        
        plt.subplot(1, 2, 1)
        bars = plt.bar(range(len(persona_counts)), persona_counts.values)
        plt.title('페르소나별 장소 수')
        plt.xlabel('페르소나')
        plt.ylabel('장소 수')
        plt.xticks(range(len(persona_counts)), [f"P{i}" for i in persona_counts.index], rotation=45)
        
        # 막대 위에 수치 표시
        for bar, count in zip(bars, persona_counts.values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    str(count), ha='center', va='bottom')
        
        # 2. 좌표 분포 산점도
        valid_coords = df[(df['위도'].notna()) & (df['경도'].notna())]
        
        plt.subplot(1, 2, 2)
        scatter = plt.scatter(valid_coords['경도'], valid_coords['위도'], 
                            c=valid_coords['페르소나ID'], cmap='tab10', alpha=0.7)
        plt.title('서울 지역 좌표 분포')
        plt.xlabel('경도')
        plt.ylabel('위도')
        plt.colorbar(scatter, label='페르소나 ID')
        
        plt.tight_layout()
        plt.savefig('routes_analysis.png', dpi=300, bbox_inches='tight')
        print("✅ 시각화 저장됨: routes_analysis.png")
        
    except Exception as e:
        print(f"⚠️  시각화 생성 오류: {e}")
        print("matplotlib이 설치되지 않았거나 한글 폰트 문제일 수 있습니다.")

def main():
    """메인 실행 함수"""
    print("Routes 데이터 분석을 시작합니다...\n")
    
    # 메인 데이터 분석
    df = analyze_main_data()
    
    if df is not None:
        # 좌표 분포 분석
        analyze_coordinate_distribution(df)
        
        # 장소 유형 분석
        analyze_place_types(df)
        
        # 코스 구조 분석
        analyze_course_structure(df)
        
        # 시각화 생성
        create_visualizations(df)
        
        print(f"\n🎉 데이터 분석이 완료되었습니다!")
    else:
        print(f"\n❌ 데이터 분석에 실패했습니다.")

if __name__ == "__main__":
    main()
