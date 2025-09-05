# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder # 라벨 인코딩을 위해 임포트
import seaborn as sns
import matplotlib.pyplot as plt
import joblib
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
# 2단계에서 K=6으로 생성된 라벨링 데이터 로드
input_file = 'data/2024 외래관광객조사_라벨링_k6.csv'
try:
    df = pd.read_csv(input_file, encoding='utf-8-sig')
    print(f"'{input_file}' 로드 성공. 데이터 크기: {df.shape}")
except FileNotFoundError:
    print(f"'{input_file}'을 찾을 수 없습니다. 수정된 2단계 코드를 먼저 실행하여 파일을 생성해주세요.")
    exit()

# --- 1단계: 데이터 분리 및 라벨 인코딩 ---
print("\n--- 1단계: 데이터 분리 및 라벨 인코딩 ---")
# 특성(X)과 타겟(y) 변수 정의
X = df.drop(columns=['cluster', 'persona'])
y = df['persona']

# 추천에 사용할 'satisfied_*' 컬럼은 X에서 제외
satisfied_cols = [col for col in df.columns if col.startswith('satisfied_')]
X = X.drop(columns=satisfied_cols)


# ==============================================================================
# ★★★ 라벨 인코딩 (문자열 -> 숫자) ★★★
# ==============================================================================
# LabelEncoder 객체 생성
le = LabelEncoder()

# y(페르소나 이름)를 숫자 라벨로 변환 (e.g., '컴팩트 실속파' -> 0)
y_encoded = le.fit_transform(y)

# 인코딩된 클래스 확인 (어떤 이름이 어떤 숫자로 매핑되었는지)
print("\n라벨 인코딩 매핑 정보:")
# le.classes_에는 인코딩된 문자열 라벨들이 순서대로 저장되어 있음
class_mapping = {i: class_name for i, class_name in enumerate(le.classes_)}
for num, name in class_mapping.items():
    print(f"{name} -> {num}")

# 학습 데이터와 테스트 데이터로 분리 (숫자로 인코딩된 y를 사용)
X_train, X_test, y_train_encoded, y_test_encoded = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# 성능 평가 시 원래 문자열 라벨과 비교하기 위해, 문자열 y도 동일한 순서로 분리
_, _, y_train_str, y_test_str = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n학습 데이터 크기: {X_train.shape}")
print(f"테스트 데이터 크기: {X_test.shape}")


# --- 2단계: XGBoost 모델 학습 ---
print("\n--- 2단계: XGBoost 모델 학습 ---")
# XGBoost 분류 모델 생성
model = xgb.XGBClassifier(
    objective='multi:softprob', # 다중 클래스 분류
    eval_metric='mlogloss',     # 성능 평가 지표
    use_label_encoder=False,    # scikit-learn의 LabelEncoder를 사용하므로 False로 설정
    random_state=42
)

# 숫자로 인코딩된 y_train_encoded를 사용하여 모델 학습
model.fit(X_train, y_train_encoded)
print("XGBoost 모델 학습 완료.")


# --- 3단계: 모델 성능 평가 ---
print("\n--- 3단계: 모델 성능 평가 ---")
# 1. 테스트 데이터로 예측 (결과는 숫자로 나옴)
y_pred_encoded = model.predict(X_test)

# 2. 예측된 숫자 라벨을 다시 원래 문자열 라벨로 변환 (결과 해석 용도)
y_pred_str = le.inverse_transform(y_pred_encoded)

# 3. 정확도(Accuracy) 평가 (원래 문자열 라벨인 y_test_str과 비교)
accuracy = accuracy_score(y_test_str, y_pred_str)
print(f"\n모델 정확도: {accuracy:.4f}\n")

# 4. 분류 리포트(Classification Report) 출력
print("분류 리포트:")
print(classification_report(y_test_str, y_pred_str))

# 5. 혼동 행렬(Confusion Matrix) 시각화
print("혼동 행렬 시각화:")
# 클래스 라벨은 LabelEncoder의 classes_ 속성을 사용하면 순서가 보장됨
class_labels = le.classes_
cm = confusion_matrix(y_test_str, y_pred_str, labels=class_labels)

plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_labels, yticklabels=class_labels)
plt.title('혼동 행렬 (Confusion Matrix) - K=6', fontsize=16)
plt.xlabel('예측된 페르소나 (Predicted)')
plt.ylabel('실제 페르소나 (Actual)')
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
plt.show()


# --- 4단계: 특성 중요도 분석 ---
print("\n--- 4단계: 특성 중요도 분석 ---")
feature_importances = pd.Series(model.feature_importances_, index=X.columns)
top_features = feature_importances.sort_values(ascending=False).head(15)

plt.figure(figsize=(12, 8))
sns.barplot(x=top_features, y=top_features.index)
plt.title('상위 15개 특성 중요도 (Top 15 Feature Importances)', fontsize=16)
plt.xlabel('중요도 (Importance)')
plt.ylabel('특성 (Feature)')
plt.show()


# --- 5단계: 최종 모델 및 인코더 저장 ---
print("\n--- 5단계: 최종 모델 및 인코더 저장 ---")
model_file = 'persona_classifier_model_k6.joblib'

# 모델과 함께 LabelEncoder 및 학습에 사용한 컬럼 순서를 함께 저장합니다.
artifacts = {
    'model': model,
    'label_encoder': le,
    'columns': list(X.columns),  # 예측 시 특성 배열의 정확한 순서를 보장하기 위함
}
joblib.dump(artifacts, model_file)
print(f"학습된 모델, 라벨 인코더, 컬럼 목록이 '{model_file}' 파일로 저장되었습니다.")
