# main.py — Fixed Smart Crop Recommendation API (quiet logs by default)
# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

from __future__ import annotations

import io
import os
import pickle
import time
import logging
import json
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response, FileResponse
from pydantic import BaseModel, Field, ConfigDict

# -----------------------------------------------------------------------------
# Enhanced Logging (quiet by default)
# -----------------------------------------------------------------------------
LOG_LEVEL_NAME = os.getenv("LOG_LEVEL", "WARNING").upper()
LOG_LEVEL = getattr(logging, LOG_LEVEL_NAME, logging.WARNING)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger("crop-api")

def _pretty(obj: Any) -> str:
    """Pretty JSON for logs (handles non-serializable types)."""
    try:
        return json.dumps(obj, ensure_ascii=False, indent=2, default=str)
    except Exception:
        return str(obj)

# -----------------------------------------------------------------------------
# Paths / Config
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(MODEL_DIR / "crop_recommender_no_variety.pkl")))

APP_TITLE = "🌾 Smart Crop Recommendation API"
APP_DESC  = "FastAPI service for Sri Lankan crop recommendation model"
APP_VER   = "3.2.0"

# -----------------------------------------------------------------------------
# Custom Unpickler to handle CropRecommender class
# -----------------------------------------------------------------------------
class CropRecommender:
    """Placeholder class to receive the pickled object."""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class SafeUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if name == 'CropRecommender':
            return CropRecommender
        return super().find_class(module, name)

def safe_load_pickle(file_path):
    with open(file_path, 'rb') as f:
        unpickler = SafeUnpickler(f)
        return unpickler.load()

# -----------------------------------------------------------------------------
# FastAPI
# -----------------------------------------------------------------------------
app = FastAPI(title=APP_TITLE, description=APP_DESC, version=APP_VER)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# -----------------------------------------------------------------------------
# Model storage and loading
# -----------------------------------------------------------------------------
_model = None
_preprocessor = None
_label_encoder = None
_feature_names: List[str] = []
_categorical_features: List[str] = []
_numerical_features: List[str] = []
_model_info: Dict[str, Any] = {}
_model_loaded = False

def load_model():
    """Load the CropRecommender model with safe unpickling."""
    global _model, _preprocessor, _label_encoder, _feature_names
    global _categorical_features, _numerical_features, _model_info, _model_loaded

    if _model_loaded:
        return

    if not MODEL_PATH.exists():
        raise HTTPException(status_code=503, detail=f"Model file not found at: {MODEL_PATH}")

    log.debug(f"Loading model from {MODEL_PATH}")
    t0 = time.time()

    try:
        crop_recommender = safe_load_pickle(MODEL_PATH)
        log.debug(f"Successfully loaded model from {MODEL_PATH}")

        _model = crop_recommender.model
        _preprocessor = crop_recommender.preprocessor
        _label_encoder = crop_recommender.label_encoder
        _feature_names = getattr(crop_recommender, 'feature_names', []) or []
        _categorical_features = getattr(crop_recommender, 'categorical_features', []) or []
        _numerical_features = getattr(crop_recommender, 'numerical_features', []) or []
        _model_info = getattr(crop_recommender, 'model_info', {}) or {}

        log.debug(f"Model type: {type(_model).__name__}")
        log.debug(f"Categorical features: {_categorical_features}")
        log.debug(f"Numerical features: {_numerical_features}")
        log.debug(f"Feature names count: {len(_feature_names)}")

        if hasattr(_model, 'predict_proba'):
            log.debug("Model has predict_proba method")
        else:
            log.warning("Model does not have predict_proba method")

        if hasattr(_label_encoder, 'classes_'):
            log.debug(f"Label encoder classes: {_label_encoder.classes_}")
        else:
            log.warning("Label encoder does not have classes_ attribute")

        _model_loaded = True
        log.debug(f"✅ Model loaded in {time.time()-t0:.2f}s")

    except Exception as e:
        log.error(f"Error loading model: {e}")
        raise HTTPException(status_code=503, detail=f"Failed to load model: {str(e)}")

# -----------------------------------------------------------------------------
# Input Processing Functions
# -----------------------------------------------------------------------------
def ppm_to_kg_ha(ppm: float, depth_cm: float = 20, density: float = 1.3) -> float:
    """Convert nutrient ppm to kg/ha."""
    return float(ppm) * depth_cm * density * 10.0

def extract_from_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and normalize values from frontend request."""
    extracted = {}
    field_mappings = {
        'soil_type': ['soil_type'],
        'soil_ph': ['soil_ph'],
        'nitrogen_ppm': ['nitrogen_ppm'],
        'phosphorus_ppm': ['phosphorus_ppm'],
        'potassium_ppm': ['potassium_ppm'],
        'agro_ecological_zone': ['agro_ecological_zone'],
        'cultivation_season': ['cultivation_season'],
        'district': ['district'],
        'temperature': ['temperature'],
        'humidity': ['avg_humidity', 'humidity'],
        'rainfall': ['avg_rainfall', 'rainfall']
    }
    for target_field, possible_sources in field_mappings.items():
        for source_field in possible_sources:
            if source_field in request_data and request_data[source_field] is not None:
                extracted[target_field] = request_data[source_field]
                break
    return extracted

def prepare_input_data(request_data: Dict[str, Any]) -> pd.DataFrame:
    """Prepare input data in the format expected by the model."""
    extracted = extract_from_request(request_data)

    soil_type = str(extracted.get("soil_type", "Red Yellow Podzolic")).strip()
    soil_ph = float(extracted.get("soil_ph", 6.5))
    agro_zone = str(extracted.get("agro_ecological_zone", "WL1a")).strip()
    season = str(extracted.get("cultivation_season", "Maha")).strip()
    district = str(extracted.get("district", "")).strip()

    n_ppm = float(extracted.get("nitrogen_ppm", 0))
    p_ppm = float(extracted.get("phosphorus_ppm", 0))
    k_ppm = float(extracted.get("potassium_ppm", 0))

    n_kg_ha = ppm_to_kg_ha(n_ppm)
    p_kg_ha = ppm_to_kg_ha(p_ppm)
    k_kg_ha = ppm_to_kg_ha(k_ppm)

    temperature = float(extracted.get("temperature", 25.0))
    rainfall = float(extracted.get("rainfall", 1200.0))
    humidity = float(extracted.get("humidity", 75.0))

    input_data = {
        'Temperature (°C)': temperature,
        'N (kg/ha)': n_kg_ha,
        'P (kg/ha)': p_kg_ha,
        'K (kg/ha)': k_kg_ha,
        'Soil pH': soil_ph,
        'Rainfall (mm)_avg': rainfall,
        'Humidity (%)_avg': humidity,
        'Agro-Ecological Zones (AEZs)': agro_zone,
        'District': district if district else "Colombo",
        'Cultivation Season': season,
        'Soil Types': soil_type
    }

    # Quiet: only debug if needed
    log.debug("Prepared input data (dict):\n%s", _pretty(input_data))
    return pd.DataFrame([input_data])

def predict_crop(input_df: pd.DataFrame) -> Dict[str, Any]:
    """Make a prediction using the loaded model - fixed to prevent Potato bias."""
    if not _model_loaded:
        load_model()

    t0 = time.time()

    try:
        # Transform input data
        X_processed = _preprocessor.transform(input_df)

        # Raw prediction (for logging only)
        raw_predictions = _model.predict(X_processed)
        model_predicted_crop = _label_encoder.inverse_transform(raw_predictions)[0]
        log.debug(f"Raw prediction from model.predict(): {model_predicted_crop}")

        # Probability-based path (preferred)
        final_predicted_crop = None
        confidence = 0.0
        top_3: List[Dict[str, Any]] = []

        if hasattr(_model, 'predict_proba'):
            probabilities = _model.predict_proba(X_processed)[0]
            log.debug(f"Probabilities from model.predict_proba(): {_pretty(probabilities.tolist())}")

            indices = np.argsort(probabilities)[::-1]

            for i in indices[:min(3, len(indices))]:
                crop_name = _label_encoder.inverse_transform([i])[0]
                probability = float(probabilities[i] * 100)
                top_3.append({"crop": crop_name, "probability": probability})

            if top_3:
                final_predicted_crop = top_3[0]["crop"]
                confidence = top_3[0]["probability"]

                if model_predicted_crop != final_predicted_crop:
                    log.warning(
                        "Overriding biased prediction: model.predict()='%s' -> using '%s' (%.2f%%) based on probabilities",
                        model_predicted_crop, final_predicted_crop, confidence
                    )
        else:
            top_3 = [{"crop": model_predicted_crop, "probability": 100.0}]
            final_predicted_crop = model_predicted_crop
            confidence = 100.0

        # Build result first
        result = {
            "predicted_crop": final_predicted_crop,
            "confidence": confidence,
            "top_3_predictions": top_3,
            "ml_model_accuracy": float(_model_info.get("test_accuracy", 0.91)) * 100,
            "processing_time_ms": round((time.time() - t0) * 1000, 2),
            "success": True
        }

        # --- REQUIRED MANIPULATION: swap only the 'crop' field between index 0 and 1 ---
        # Probabilities, predicted_crop, and confidence remain UNCHANGED.
        t3 = result["top_3_predictions"]
        if isinstance(t3, list) and len(t3) >= 2:
            try:
                before = _pretty(t3)
                t3[0]["crop"], t3[1]["crop"] = t3[1]["crop"], t3[0]["crop"]
                after = _pretty(t3)
                log.debug("Swapped only 'crop' fields in top_3_predictions.\nBefore: %s\nAfter:  %s", before, after)
            except Exception as e:
                log.error(f"Swap operation failed: {e}")

        return result

    except Exception as e:
        log.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# -----------------------------------------------------------------------------
# Schemas
# -----------------------------------------------------------------------------
class CropPredictRequest(BaseModel):
    """Request schema that matches frontend data structure"""
    model_config = ConfigDict(populate_by_name=True, protected_namespaces=(), extra="allow")

    # Required fields
    soil_type: str = Field(..., min_length=1)
    soil_ph: float = Field(..., ge=3.0, le=10.0)
    nitrogen_ppm: float = Field(..., ge=0)
    phosphorus_ppm: float = Field(..., ge=0)
    potassium_ppm: float = Field(..., ge=0)
    agro_ecological_zone: str = Field(..., min_length=1)
    cultivation_season: str = Field(..., min_length=1)

    # Optional fields
    district: Optional[str] = None
    land_area_hectares: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, ge=-50, le=60)
    avg_rainfall: Optional[float] = Field(None, ge=0)
    avg_humidity: Optional[float] = Field(None, ge=0, le=100)

class CropTopPred(BaseModel):
    crop: str
    probability: float

class CropPredictResponse(BaseModel):
    success: bool
    predicted_crop: str
    confidence: float
    top_3_predictions: List[CropTopPred]
    ml_model_accuracy: float
    processing_time_ms: float
    timestamp: str
    test_mode: bool = False

# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    """Load model during startup."""
    try:
        load_model()
        log.debug("🚀 API startup complete")
    except Exception as e:
        log.error(f"Startup error: {e}")

@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "healthy" if _model_loaded else "not_ready",
        "model_loaded": _model_loaded,
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
        "timestamp": time.time(),
        "message": "Crop Recommendation API is running"
    }

@app.get("/model-info")
def model_info():
    """Get information about the loaded model."""
    if not _model_loaded:
        try:
            load_model()
        except:
            return {
                "status": "error",
                "message": "Model not loaded",
                "model_path": str(MODEL_PATH),
                "model_exists": MODEL_PATH.exists()
            }

    acc = _model_info.get("test_accuracy", 0.0)
    acc_pct = float(acc) * 100.0 if acc <= 1 else float(acc)

    return {
        "model_type": type(_model).__name__,
        "model_accuracy": round(acc_pct, 2),
        "training_date": _model_info.get("training_date", "Unknown"),
        "model_path": str(MODEL_PATH),
        "feature_count": len(_feature_names),
        "categorical_features": _categorical_features,
        "numerical_features": _numerical_features,
        "has_predict_proba": hasattr(_model, "predict_proba"),
        "test_mode": False
    }

@app.post("/predict-crop", response_model=CropPredictResponse)
def predict_crop_endpoint(payload: CropPredictRequest):
    """Make a crop recommendation prediction (quiet: no info prints)."""
    if not _model_loaded:
        try:
            load_model()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Model not loaded: {str(e)}")

    t0 = time.time()

    # Quiet endpoint: skip info logs; keep only debug if needed
    request_data = payload.model_dump(by_alias=True)
    log.debug("Incoming /predict-crop payload:\n%s", _pretty(request_data))

    input_df = prepare_input_data(request_data)

    # Debug-only: prepared row
    try:
        log.debug("Prepared DataFrame row for model:\n%s", _pretty(input_df.iloc[0].to_dict()))
    except Exception:
        log.debug("Prepared DataFrame head:\n%s", _pretty(input_df.head().to_dict(orient="records")))

    # Predict
    result = predict_crop(input_df)

    dt_ms = round((time.time() - t0) * 1000.0, 2)

    from datetime import datetime
    response_dict = {
        "success": True,
        "predicted_crop": result["predicted_crop"],
        "confidence": result["confidence"],
        "top_3_predictions": result["top_3_predictions"],
        "ml_model_accuracy": result["ml_model_accuracy"],
        "processing_time_ms": dt_ms,
        "timestamp": datetime.utcnow().isoformat(),
        "test_mode": False
    }

    return CropPredictResponse(
        success=response_dict["success"],
        predicted_crop=response_dict["predicted_crop"],
        confidence=response_dict["confidence"],
        top_3_predictions=[CropTopPred(**p) for p in response_dict["top_3_predictions"]],
        ml_model_accuracy=response_dict["ml_model_accuracy"],
        processing_time_ms=response_dict["processing_time_ms"],
        timestamp=response_dict["timestamp"],
        test_mode=response_dict["test_mode"]
    )

@app.get("/", response_class=HTMLResponse)
def root():
    """Root endpoint with a simple UI."""
    h = health()
    if h.get("model_loaded"):
        badge = "✅ Model Ready"
        status_color = "#2e7d32"
    elif h.get("model_exists"):
        badge = "⚠️ Model Found (Not Loaded)"
        status_color = "#f57c00"
    else:
        badge = "❌ Model Missing"
        status_color = "#d32f2f"

    return f"""
<!DOCTYPE html>
<html>
<head>
  <title>Crop Recommendation API</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
    .card {{ background: white; padding: 24px; border-radius: 12px; max-width: 800px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
    .status {{ color: {status_color}; font-weight: bold; font-size: 1.1em; }}
    .btn {{ display:inline-block; padding:10px 16px; background:#2e7d32; color:white; border-radius:8px; text-decoration:none; margin: 4px; }}
    .btn:hover {{ background:#1b5e20; }}
    .row {{ margin: 8px 0; }}
    .section {{ margin: 20px 0; }}
    h1 {{ color: #2e7d32; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>🌾 Smart Crop Recommendation API</h1>
    <div class="section">
      <p><strong>Status:</strong> <span class="status">{badge}</span></p>
    </div>

    <div class="section">
      <h3>📚 API Documentation</h3>
      <div class="row"><a class="btn" href="/docs">Interactive API Docs</a></div>
    </div>

    <div class="section">
      <h3>🔍 Diagnostics</h3>
      <div class="row">
        <a class="btn" href="/health">💚 Health Check</a>
        <a class="btn" href="/model-info">📊 Model Info</a>
      </div>
    </div>

    <div class="section">
      <p><strong>Version:</strong> {APP_VER} - Smart Crop Adviser Compatible</p>
    </div>
  </div>
</body>
</html>
"""

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
