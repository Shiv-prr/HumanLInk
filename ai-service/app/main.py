"""
HumanLink AI Service - Main FastAPI Application

==================================================
EXPLANATORY COMMENTS FOR BEGINNERS & DEVELOPERS:
==================================================

1. WHAT IS FASTAPI?
   FastAPI is a modern, fast (high-performance) web framework for building APIs
   with Python based on standard Python type hints. It automatically generates
   interactive API documentation (Swagger UI at /docs and ReDoc at /redoc).

2. WHAT DOES THE FASTAPI APP OBJECT DO?
   The `app = FastAPI(...)` object serves as the main application container.
   It registers API routes/endpoints, handles incoming HTTP requests, manages
   middleware, and coordinates response serialization (converting Python dicts to JSON).

3. WHAT IS AN API ENDPOINT?
   An API endpoint is a specific URL path (e.g. `/` or `/health`) combined with an
   HTTP method (GET, POST, PUT, DELETE) that allows external applications (like Node.js
   or React) to communicate with this service.

4. WHAT IS THE /health ENDPOINT USED FOR?
   The `/health` endpoint is a standard health-check route used by monitoring tools,
   load balancers, container orchestrators, and gateway servers to verify that the
   AI service is alive, responsive, and ready to accept requests.

5. WHAT IS A PYDANTIC MODEL?
   A Pydantic model (`BaseModel`) defines the exact schema, field names, and data types
   expected in API requests or responses. Pydantic validates incoming JSON data automatically.

6. WHAT DOES REQUEST VALIDATION DO?
   Request validation inspects incoming HTTP payload fields. If any required field is missing,
   null, empty, or whitespace-only, Pydantic rejects the request with an HTTP 422 error response
   before any business logic executes.

7. WHY IS POST USED FOR PREDICTION INPUT?
   HTTP POST allows client applications to send structured JSON body payloads containing
   multiple request parameters (`crop`, `market`, `district`, `state`) cleanly and securely.

8. WHY IS estimatedPrice CURRENTLY null?
   In Phase 9 Step 2, we build and verify the API schema contract, validation layer, and OpenAPI specs.
   The actual machine learning prediction model will be connected in subsequent Phase 9 steps.
"""

from fastapi import FastAPI
from pydantic import BaseModel, field_validator

# Create the main FastAPI application instance
app = FastAPI(
    title="HumanLink AI Service",
    description="Microservice providing AI & Smart Recommendations for the HumanLink platform.",
    version="1.0.0"
)


# ==================================================
# PYDANTIC REQUEST SCHEMAS & VALIDATION
# ==================================================

class PricePredictionRequest(BaseModel):
    """
    Schema for price prediction requests.
    Requires crop, market, district, and state.
    Rejects empty or whitespace-only inputs.
    """
    crop: str
    market: str
    district: str
    state: str

    @field_validator("crop", "market", "district", "state")
    @classmethod
    def validate_not_empty_or_whitespace(cls, value: str, info) -> str:
        if not value or not value.strip():
            raise ValueError(f"'{info.field_name}' cannot be empty or whitespace-only.")
        return value.strip()


# ==================================================
# API ENDPOINTS
# ==================================================

@app.get("/")
def read_root():
    """
    Root endpoint: returns a greeting confirming the AI service is operational.
    """
    return {
        "message": "HumanLink AI Service is running"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint: used by external monitoring and backend gateways
    to confirm service operational status.
    """
    return {
        "status": "ok",
        "service": "HumanLink AI Service"
    }


@app.post("/predict-price")
def predict_price(request: PricePredictionRequest):
    """
    Price Prediction API Endpoint (Step 2 - Contract & Input Validation).
    
    Accepts validated crop and market information and returns a structured response.
    Note: estimatedPrice is currently null as the ML model will be connected in Step 3.
    """
    return {
        "success": True,
        "crop": request.crop,
        "market": request.market,
        "district": request.district,
        "state": request.state,
        "estimatedPrice": None,
        "message": "ML model will be connected in the next step"
    }
