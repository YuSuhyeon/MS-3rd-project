from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
import json

app = Flask(__name__)

# ============================================================================
# Load model and data once at startup
# ============================================================================
print("[init] Loading model and datasets...")
model = None
le = None
df_full = None
model_columns = None
questions_payload = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    # Model
    model = None
    le = None
    saved_cols = None
    model_candidates = [
        os.path.join(BASE_DIR, 'persona_classifier_model_k6.joblib'),
        os.path.join(BASE_DIR, 'models', 'persona_classifier_model_k6.joblib'),
        os.path.join(os.getcwd(), 'persona_classifier_model_k6.joblib'),
        os.path.join(os.getcwd(), 'models', 'persona_classifier_model_k6.joblib'),
    ]
    load_err = None
    for mp in model_candidates:
        try:
            if os.path.exists(mp):
                artifacts = joblib.load(mp)
                model = artifacts.get('model')
                le = artifacts.get('label_encoder')
                saved_cols = artifacts.get('columns')
                print(f"[ok] Model loaded: {mp}")
                break
        except Exception as e:
            load_err = e
            continue
    if model is None or le is None:
        raise RuntimeError(f"model_load_failed: {load_err}")

    # Labeled full dataset (for recommendations)
    data_file = os.path.join(BASE_DIR, 'data', '2024 외래관광객조사_라벨링_k6.csv')
    df_full = pd.read_csv(data_file, encoding='utf-8-sig')
    print(f"[ok] Labeled data loaded: {data_file}")

    # Preprocessed feature dataset (to get model columns exactly if not saved)
    preprocessed_file = os.path.join(BASE_DIR, 'data', '2024 외래관광객조사 전처리.csv')
    df_preprocessed = pd.read_csv(preprocessed_file, encoding='utf-8-sig')
    inferred_cols = [c for c in df_preprocessed.columns if not c.startswith('satisfied_')]
    model_columns = list(saved_cols) if saved_cols else inferred_cols
    print(f"[ok] Model columns ready: {len(model_columns)} features")

    # Load questions JSON once
    q_path = os.path.join(BASE_DIR, 'data', 'persona_questions.json')
    if os.path.exists(q_path):
        with open(q_path, 'r', encoding='utf-8') as f:
            questions_payload = json.load(f)
        print(f"[ok] Questions loaded: {q_path}")
    else:
        questions_payload = { 'questions': [] }
        print(f"[warn] Questions file not found at {q_path}")
except Exception as e:
    print(f"[error] Failed to load resources: {e}")


# ============================================================================
# Helpers
# ============================================================================

def encode_answers_to_features(answers: dict, columns: list[str]):
    # Initialize all features to 0
    feat = { col: 0 for col in columns }

    # Single-selects expected to come as direct one-hot keys
    def set_onehot(key):
        if key in feat:
            feat[key] = 1

    # 1) RVIT (방문 경험): expecting values like 'RVIT_1'...'RVIT_4'
    rv = answers.get('rvit')
    if isinstance(rv, str):
        set_onehot(rv)

    # 2) Q1 (여행 목적): values like 'Q1_1', 'Q1_2'
    q1 = answers.get('q1')
    if isinstance(q1, str):
        set_onehot(q1)

    # 3) 체류 기간: values like 'R일HAP_1'..'R일HAP_5'
    stay = answers.get('stay')
    if isinstance(stay, str):
        set_onehot(stay)

    # 4) 예산: values like 'C총액1인TOT2_1'..'C총액1인TOT2_4'
    budget = answers.get('budget')
    if isinstance(budget, str):
        set_onehot(budget)

    # 5) 고려 활동(복수): values like 'considered_식도락관광', ...
    cons = answers.get('considered') or []
    if isinstance(cons, list):
        for v in cons:
            if isinstance(v, str) and v in feat:
                feat[v] = 1

    # Return aligned vector
    return pd.DataFrame([feat]).reindex(columns=columns, fill_value=0)


def persona_description(name: str):
    from_desc = {
        '알뜰 필수코스 정복자': "1000~2000$ 예산 내에서 필수 코스를 효율적으로 즐기는 현명한 여행자.",
        '플렉스 장기 체류객': "3000$+ 지출, 장기 체류 경향이 강한 프리미엄 여행자.",
        '관계 중심 체류객': "지인 방문 등 관계 중심의 체류 목적을 가진 여행자.",
        '실속파 쇼핑 원정대': "명확한 쇼핑 목적과 효율적 소비를 즐기는 재방문객.",
        '문화유산 탐험가': "역사/전통 체험 선호, 문화유산 탐험형 여행자.",
        '미니멀 K-컬처 팬': "최소 비용으로 K-컬처를 열정적으로 즐기는 팬형 여행자.",
    }
    return from_desc.get(name, '')


# ============================================================================
# API Routes
# ============================================================================
@app.get('/api/persona/questions')
def api_questions():
    # Provide the file-backed payload if present, else fallback defaults
    if questions_payload and questions_payload.get('questions'):
        return jsonify(questions_payload)
    # Fallback minimal
    return jsonify({ 'questions': [] })


@app.post('/api/persona/analyze')
def api_analyze():
    if model is None or le is None or model_columns is None:
        return jsonify({"error": "model_not_loaded", "model_loaded": False}), 200

    try:
        data = request.get_json(silent=True) or {}
        answers = data.get('answers') or {}

        X = encode_answers_to_features(answers, model_columns)
        pred_ids = model.predict(X)
        pred_id = int(pred_ids[0])
        persona_name = str(le.inverse_transform([pred_id])[0])

        # Scores (probabilities) per persona
        proba = getattr(model, 'predict_proba', None)
        scores = {}
        if callable(proba):
            probs = proba(X)[0]
            for idx, p in enumerate(probs):
                name = str(le.inverse_transform([idx])[0])
                scores[name] = float(round(p, 4))

        # Build recommendations
        recommended = []
        if df_full is not None and 'persona' in df_full.columns:
            try:
                df_persona = df_full[df_full['persona'] == persona_name]
                satisfied_cols = [c for c in df_full.columns if c.startswith('satisfied_')]
                top_acts = df_persona[satisfied_cols].sum().sort_values(ascending=False).head(3)
                total = len(df_persona)
                for act_col, cnt in top_acts.items():
                    act_name = act_col.split('satisfied_', 1)[1]
                    rate = round((cnt / total) * 100, 1) if total else 0.0
                    places = activity_location_map.get(act_name) or default_places_for(act_name)
                    recommended.append({ 'activity': act_name, 'satisfaction_rate': rate, 'places': places })
            except Exception:
                recommended = []
        if not recommended:
            # fallback: 사용자가 고려한 활동 또는 페르소나 기본값 기반 추천
            cons = answers.get('considered') or []
            if cons:
                for c in cons[:3]:
                    act_name = c.replace('considered_', '')
                    places = activity_location_map.get(act_name) or default_places_for(act_name)
                    recommended.append({ 'activity': act_name, 'satisfaction_rate': 0.0, 'places': places })
            else:
                # 페르소나와 무관하게 상위 3개 대표 카테고리 추천
                seeds = list(activity_location_map.keys())[:3]
                for s in seeds:
                    places = activity_location_map.get(s) or default_places_for(s)
                    recommended.append({ 'activity': s, 'satisfaction_rate': 0.0, 'places': places })

        # Summarize inputs for UI
        summary_inputs = {
            'rvit': answers.get('rvit'),
            'q1_purpose': answers.get('q1'),
            'stay': answers.get('stay'),
            'budget': answers.get('budget'),
            'considered': answers.get('considered') or [],
        }

        return jsonify({
            'model_loaded': True,
            'persona_type': persona_name,
            'persona_description': persona_description(persona_name),
            'scores': scores,
            'recommended_destinations': recommended,
            'inputs': summary_inputs,
        })

    except Exception as e:
        return jsonify({"error": "analyze_failed", "detail": str(e)}), 500


if __name__ == '__main__':
    # Run on 5001 to match CRA proxy
    app.run(host='127.0.0.1', port=5001, debug=True)
