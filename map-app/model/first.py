import pandas as pd
import numpy as np
import os

# ==============================================================================
# MAIN SCRIPT START
# ==============================================================================

# --- STEP 0: 데이터 준비 ---
# 데이터 파일 경로 설정
file_path = 'data/2024 외래관광객조사_Data.csv'

# 데이터 로드
try:
    df_raw = pd.read_csv(file_path, encoding='utf-8')
except UnicodeDecodeError:
    df_raw = pd.read_csv(file_path, encoding='cp949')

print("\n--- 1단계: 서울 방문객 데이터 필터링 ---")
# 방문지역 컬럼 리스트 정의 (Q9_2a01 ~ Q9_2a17)
visit_area_cols = [f'Q9_2a{i:02d}' for i in range(1, 18)]

# 서울(코드 1)을 방문한 행만 필터링
seoul_visitors_mask = df_raw[visit_area_cols].eq(1).any(axis=1)
df_seoul = df_raw[seoul_visitors_mask].copy()

print(f"원본 데이터 크기: {df_raw.shape}")
print(f"서울 방문객 데이터 크기: {df_seoul.shape}")

# --- 2단계: 분석에 사용할 변수 선택 ---
print("\n--- 2단계: 분석 변수 선택 ---")
# 입력 변수(Features)와 추천 소스 변수 컬럼 리스트
feature_cols = [
    'RVIT', 'Q1', 'Q3_1a1', 'Q3_1a2', 'Q3_1a3', 'R일HAP', 'C총액1인TOT2'
]
recommendation_cols = ['Q8_1a1', 'Q8_1a2', 'Q8_1a3']

# 필요한 컬럼만 선택하여 새로운 데이터프레임 생성
df_processed = df_seoul[feature_cols + recommendation_cols].copy()
print(f"선택된 컬럼으로 구성된 데이터 크기: {df_processed.shape}")

# --- 3단계: 결측치 및 불필요한 값 처리 ---
print("\n--- 3단계: 결측치 처리 ---")
# 코드북에 따라 결측치로 처리할 값들을 리스트로 정의
missing_values = [99, 999] # 예시 값

# 지정된 값들을 NaN으로 대체
df_processed.replace(missing_values, np.nan, inplace=True)

# 결측치가 하나라도 있는 행을 제거
initial_rows = len(df_processed)
df_processed.dropna(inplace=True)
final_rows = len(df_processed)
print(f"결측치 처리 전 데이터 행 수: {initial_rows}")
print(f"결측치 처리 후 데이터 행 수: {final_rows} ({initial_rows - final_rows}개 행 제거)")

# 모든 컬럼을 정수형으로 변환하여 데이터 타입 통일
for col in df_processed.columns:
    df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce').astype('Int64')
df_processed.dropna(inplace=True) # 혹시 모를 변환 오류로 인한 NaN 추가 제거

# --- 4단계: 데이터 인코딩 및 변환 ---
print("\n--- 4단계: 데이터 인코딩 및 변환 ---")

# 4.1. 다중 선택 변수 처리
print("4.1. 다중 선택 변수(고려/만족 활동)를 더미 변수로 변환 중...")
# 코드북 기반 활동 코드와 활동명 매핑
activity_map = {
    1: '식도락관광', 2: '쇼핑', 3: '자연경관감상', 4: '휴양/휴식',
    5: '고궁/역사유적지', 6: '전통문화체험', 7: '박물관/전시관',
    8: 'KPOP/한류체험', 9: '공연관람', 10: '지역축제', 11: '유흥',
    12: '놀이공원/테마파크', 13: '뷰티/미용 관광', 14: '치료/건강검진', 15: '스포츠/레포츠 관람', 
    16: '스포츠/레포츠 참가', 17: '기타'
}

# '고려한 활동' 더미 변수 생성
considered_activity_cols = ['Q3_1a1', 'Q3_1a2', 'Q3_1a3']
for code, name in activity_map.items():
    col_name = f'considered_{name}'
    df_processed[col_name] = df_processed[considered_activity_cols].eq(code).any(axis=1).astype(int)

# '만족한 활동' 더미 변수 생성
satisfied_activity_cols = ['Q8_1a1', 'Q8_1a2', 'Q8_1a3']
for code, name in activity_map.items():
    col_name = f'satisfied_{name}'
    df_processed[col_name] = df_processed[satisfied_activity_cols].eq(code).any(axis=1).astype(int)

# 원본 다중 선택 컬럼 제거
df_processed.drop(columns=considered_activity_cols + satisfied_activity_cols, inplace=True)
print("다중 선택 변수 처리 완료.")

# 4.2. 범주형 변수 원-핫 인코딩
print("4.2. 나머지 범주형 변수를 원-핫 인코딩 중...")
# 원-핫 인코딩할 컬럼 리스트
categorical_cols = ['RVIT', 'Q1', 'R일HAP', 'C총액1인TOT2']

# pandas의 get_dummies 함수를 사용하여 원-핫 인코딩 수행
df_final = pd.get_dummies(df_processed, columns=categorical_cols, prefix=categorical_cols, dtype=int)
print("원-핫 인코딩 완료.")


# --- 최종 결과 확인 ---
print("\n==============================================================================")
print("✅ 1단계 전처리 완료: 최종 데이터셋 `df_final` 생성 성공!")
print("==============================================================================")
print(f"최종 데이터셋 크기: {df_final.shape}")
print("\n최종 데이터셋 상위 5개 행:")
print(df_final.head())
print("\n최종 데이터셋 컬럼 목록 (일부):")
print(df_final.columns.tolist()[:20])

# 최종 데이터셋을 파일로 저장하여 다음 단계에서 사용
output_file = 'data/2024 외래관광객조사 전처리.csv'
df_final.to_csv(output_file, index=False, encoding='utf-8-sig')
print(f"\n전처리된 데이터가 '{output_file}' 파일로 저장되었습니다.")