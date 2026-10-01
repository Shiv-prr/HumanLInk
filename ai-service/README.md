# HumanLink AI Service

An isolated microservice built with **Python** and **FastAPI** to power smart recommendations, price analytics, and machine learning capabilities for the **HumanLink — Farmer Discovery and Linkage Platform**.

---

## 1. Purpose of the AI Service
The AI Service handles computationally intensive analytics, price predictions, market intelligence, and matching recommendations for farmers and buyers. Keeping these functions in a dedicated microservice ensures that the core Node.js backend remains fast and decoupled.

---

## 2. Why Python for HumanLink AI/ML?
Python is the industry-standard language for Artificial Intelligence, Machine Learning, and Data Science. It provides access to world-class libraries such as NumPy, Pandas, Scikit-Learn, PyTorch, and TensorFlow, making model training and predictive inference seamless.

---

## 3. Why FastAPI?
- **High Performance**: Asynchronous execution via Starlette and Uvicorn.
- **Auto-Generated OpenAPI Docs**: Interactive documentation automatically built at `/docs` (Swagger UI) and `/redoc`.
- **Data Validation**: Native integration with Pydantic for type hints and payload validation.
- **Developer Friendly**: Lightweight, modern, and simple to maintain.

---

## 4. Setup & Running on macOS

### Step A: Navigate to AI Service Directory
```bash
cd ~/Desktop/HumanLink/ai-service
```

### Step B: Create Python Virtual Environment
```bash
python3 -m venv .venv
```

### Step C: Activate Virtual Environment (macOS)
```bash
source .venv/bin/activate
```

### Step D: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step E: Start the FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```

The service will run locally at:
- **Base URL**: `http://127.0.0.1:8000`
- **Health Check**: `http://127.0.0.1:8000/health`
- **Interactive API Docs**: `http://127.0.0.1:8000/docs`

---

## 5. Testing the Endpoints

### Test Root Endpoint:
```bash
curl http://127.0.0.1:8000/
```
**Response**:
```json
{
  "message": "HumanLink AI Service is running"
}
```

### Test Health Endpoint:
```bash
curl http://127.0.0.1:8000/health
```
**Response**:
```json
{
  "status": "ok",
  "service": "HumanLink AI Service"
}
```

---

## 6. Step 2 — Prediction API Contract

### Endpoint: `POST /predict-price`

#### Expected Request Body Schema (`PricePredictionRequest`):
```json
{
  "crop": "Wheat",
  "market": "Ludhiana Mandi",
  "district": "Ludhiana",
  "state": "Punjab"
}
```

#### Example Valid cURL Request:
```bash
curl -X POST http://127.0.0.1:8000/predict-price \
  -H "Content-Type: application/json" \
  -d '{"crop": "Wheat", "market": "Ludhiana Mandi", "district": "Ludhiana", "state": "Punjab"}'
```

#### Example Valid Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "crop": "Wheat",
  "market": "Ludhiana Mandi",
  "district": "Ludhiana",
  "state": "Punjab",
  "estimatedPrice": null,
  "message": "ML model will be connected in the next step"
}
```

#### Input Validation Behavior:
- **Missing Required Fields**: Returns `HTTP 422 Unprocessable Entity`.
- **Empty or Whitespace-Only Strings**: Returns `HTTP 422 Unprocessable Entity` (e.g. `"crop": ""` or `"crop": "   "`).
- **Placeholder Status**: `estimatedPrice` is explicitly `null` in Step 2 as the API schema contract and Pydantic validation are established before building the ML model in subsequent steps.

---

## 7. Step 3 — Market Price Data Preparation

The `app.data_preparation` module provides validation, feature engineering, chronological ordering, and dataset transformation utilities.

### Key Data Concepts & Explanations:
1. **Why Raw Data Must Be Prepared**: Raw database records contain missing fields, inconsistent dates, or unsorted timelines. Data preparation cleans data, extracts time features, generates historical (lag) observations, and defines target variables.
2. **What is a Feature?**: An input variable used by a machine learning model to make predictions (e.g., `cropName`, `marketName`, `previous_price`, `month`, `day_of_week`).
3. **What is a Target?**: The ground-truth value the model aims to predict (`target_price` = `modalPrice` of the target record).
4. **What are Historical / Lag Features?**: Lag features represent past values of the target variable from prior timestamps (`previous_price` at $t-1$, `price_2_records_ago` at $t-2$, `price_3_records_ago` at $t-3$).
5. **Why Chronological Ordering Matters & What is Data Leakage?**: Data leakage occurs when future information (e.g., tomorrow's price) is accidentally included in input features used to predict past or present targets. Sorting records chronologically ensures feature values come strictly from past timestamps ($t-1, t-2, \dots$).
6. **Why Crop + Market Histories Must Remain Separated**: Price trends for Wheat in Ludhiana Mandi are independent of Rice in Amritsar Mandi. Grouping by `(cropName, marketName)` ensures lag features are calculated strictly within the same commodity and location context.

> [!IMPORTANT]
> **Dataset Limitation Disclaimer**:
> The current Phase 5 market-price records are controlled development/sample data. They are useful for developing and testing the pipeline, but they should not be represented as a production-scale historical dataset.
