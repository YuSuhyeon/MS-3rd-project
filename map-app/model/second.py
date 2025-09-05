# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)

# 한글 폰트 설정
# Windows의 경우
plt.rcParams['font.family'] = 'Malgun Gothic'
# Mac의 경우
# plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False # 마이너스 기호 깨짐 방지


# ==============================================================================
# MAIN SCRIPT START
# ==============================================================================

# --- STEP 0: 데이터 준비 ---
print("--- STEP 0: 데이터 준비 ---")
# 1단계에서 전처리된 데이터 로드
input_file = 'data/2024 외래관광객조사 전처리.csv'
try:
    df = pd.read_csv(input_file, encoding='utf-8-sig')
    print(f"'{input_file}' 로드 성공. 데이터 크기: {df.shape}")
except FileNotFoundError:
    print(f"'{input_file}'을 찾을 수 없습니다. 1단계 코드를 먼저 실행해주세요.")
    exit()

# --- 1단계: 군집화에 사용할 특성(Feature) 분리 ---
print("\n--- 1단계: 군집화 특성 분리 ---")
# 'satisfied_*' 컬럼들은 추천 로직에 사용할 결과 변수이므로 군집화 과정에서 제외
satisfied_cols = [col for col in df.columns if col.startswith('satisfied_')]
clustering_features = df.drop(columns=satisfied_cols)
print(f"군집화에 사용할 특성(Feature) 개수: {clustering_features.shape[1]}")

# --- 2단계: 최적의 군집 개수(K) 찾기 (그래프 시각화) ---
# 이 부분은 K를 결정하기 위한 분석 과정이므로 그대로 둡니다.
# 분석가는 이 그래프를 보고 최종 K를 결정하게 됩니다.
print("\n--- 2단계: 최적의 군집 개수(K) 찾기 ---")
k_range = range(2, 11)
inertia_values = []
silhouette_scores = []

print("K값을 2부터 10까지 변경하며 모델 학습 및 평가 중...")
for k in k_range:
    kmeans = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=10)
    kmeans.fit(clustering_features)
    inertia_values.append(kmeans.inertia_)
    score = silhouette_score(clustering_features, kmeans.labels_)
    silhouette_scores.append(score)
    print(f"K = {k}, 실루엣 스코어: {score:.4f}")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
ax1.plot(k_range, inertia_values, 'bo-')
ax1.set_title('엘보우 방법 (Elbow Method)')
ax1.set_xlabel('군집의 수 (K)')
ax1.set_ylabel('Inertia (군집 내 오차제곱합)')
ax1.grid(True)
ax2.plot(k_range, silhouette_scores, 'ro-')
ax2.set_title('실루엣 스코어 (Silhouette Score)')
ax2.set_xlabel('군집의 수 (K)')
ax2.set_ylabel('평균 실루엣 스코어')
ax2.grid(True)
plt.suptitle('최적의 군집 개수(K) 탐색', fontsize=16)
plt.tight_layout(rect=[0, 0.03, 1, 0.95])
plt.show()

# --- 3단계: 최종 군집화 수행 ---
# 결과를 보고 최적의 K를 6으로 설정
optimal_k = 6
print(f"\n--- 3단계: 최종 군집화 수행 (선택된 K = {optimal_k}) ---")

final_kmeans = KMeans(n_clusters=optimal_k, init='k-means++', random_state=42, n_init=10)
# 원본 데이터가 아닌 군집화용 피처에 cluster 컬럼 추가
clustering_features['cluster'] = final_kmeans.fit_predict(clustering_features)

print("각 데이터에 군집 라벨 할당 완료.")
print("군집별 데이터 개수:")
print(clustering_features['cluster'].value_counts().sort_index())

# --- 4단계: 페르소나 프로파일링 및 정의 ---
print("\n--- 4단계: 페르소나 프로파일링 및 정의 ---")
# 각 군집이 어떤 특성을 가지고 있는지 분석
persona_profile = clustering_features.groupby('cluster').mean().T

print("\n군집별 특성 프로파일 (평균값 기준):")
print(persona_profile.round(2))

# ==============================================================================
# 프로파일링 결과를 분석하여 6개의 페르소나 이름을 정의하고 매핑
# ==============================================================================
persona_map = {
    0: '알뜰 필수코스 정복자',    # 한국을 처음 방문하는 가장 대표적인 유형의 관광객. 이들은 1000~2000$ 사이의 정해진 예산 내에서 움직이는 경향이 강하며, 식도락, 쇼핑, 고궁 방문 등 한국 여행에서 빼놓을 수 없는 필수 코스를 두루 경험하고자 함.
    1: '플렉스 장기 체류객',      # 방문 경험이 어느 정도 있으며, 3000$ 이상의 높은 비용을 아낌없이 지출하는 프리미엄 여행객 그룹. 특히 42%가 한 달 이상 장기 체류하는 경향을 보여, 단순한 관광을 넘어선 '장기 휴가' 또는 '업무 겸 휴식'의 형태를 띨 가능성이 높음
    2: '관계 중심 체류객',  # 여행의 가장 큰 목적이 관광이나 쇼핑이 아닌, 한국에 있는 친구나 친지를 만나는 것인 그룹.
    3: '실속파 쇼핑 원정대', # 한국 방문 경험이 풍부한 100% 재방문객으로 구성된 그룹, 방문 목적은 '쇼핑'에 매우 명확하게 집중되어 있음(관심도 73%). 높은 쇼핑 관심을 보이는 데 비해 소비는 1000~2000$ 구간에 집중되어 있음 -> 충동구매보다는 원하는 아이템을 효율적으로 구매
    4: '문화유산 탐험가',  # 2000~3000$의 특정 예산대에서 움직이며, 고궁, 역사 유적지, 전통문화체험에 대한 고려 비율이 다른 그룹에 비해 월등히 높음
    5: '미니멀 K-컬처 팬' # 1000$ 이하의 가장 적은 예산으로 여행하는 그룹, K-POP과 한류 문화(관심도 1위)
}
print("\n정의된 페르소나 맵:")
print(persona_map)

# 원본 데이터프레임(df)에 cluster와 persona 정보 추가
# clustering_features에서 생성된 cluster 정보를 원본 df의 인덱스와 맞춰서 할당
df['cluster'] = clustering_features['cluster']
df['persona'] = df['cluster'].map(persona_map)

# NaN 값이 있는지 확인 (persona_map에 정의되지 않은 cluster 번호가 있을 경우 발생)
if df['persona'].isnull().any():
    print("\n[경고] 일부 데이터에 페르소나가 할당되지 않았습니다. persona_map을 확인해주세요.")
    print("할당되지 않은 cluster 번호:", df[df['persona'].isnull()]['cluster'].unique())
else:
    print("\n모든 데이터에 페르소나 이름이 성공적으로 할당되었습니다.")

print("\n군집별 할당된 페르소나 이름:")
print(df.groupby('cluster')['persona'].first())


# --- 최종 결과 저장 ---
print("\n--- 최종 결과 저장 ---")
# 3단계 분류 모델 학습을 위해 라벨링된 데이터를 저장
output_file = 'data/2024 외래관광객조사_라벨링_k6.csv'
df.to_csv(output_file, index=False, encoding='utf-8-sig') 
print(f"K=6 기준, 군집 및 페르소나 라벨이 추가된 데이터가 '{output_file}' 파일로 저장되었습니다.")