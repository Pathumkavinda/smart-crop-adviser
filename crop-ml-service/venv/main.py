# main.py - FastAPI Server for Crop Recommendation (Clean, Non-biased)
# Save as: crop-ml-service/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict
import pickle
import numpy as np
import uvicorn
import os
import random
from datetime import datetime
from pathlib import Path
import warnings
import logging

# -----------------------------------------------------------------------------
# Logging / Warnings
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("crop-recommendation-api")
warnings.filterwarnings("ignore")

# -----------------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "crop_recommendation_model_PRODUCTION.pkl"
logger.info(f"Looking for model at: {MODEL_PATH.absolute()}")

# -----------------------------------------------------------------------------
# Preprocessor
# -----------------------------------------------------------------------------
class CropRecommendationPreprocessor:
    """
    Production preprocessing pipeline.
    Key fixes:
    - No hard-coded "if pH then crop" logic.
    - Feature order derived from the model/pickle if available.
    - ppm -> kg/ha conversion only if the model expects kg/ha columns.
    - Safer categorical encoding for unseen values.
    """

    def __init__(self, model=None, target_encoder=None, label_encoders=None, feature_columns=None):
        self.model = model
        self.target_encoder = target_encoder
        self.label_encoders = label_encoders or {}
        self.feature_columns = feature_columns or []

        # Defaults only used when input misses those fields
        self.defaults = {
            "temperature": 25.0,
            "rainfall": 1200.0,
            "humidity": 75.0,
        }

        self.supported_crops = [
            "Potato", "Maize", "Tomato", "Red Onion", "Big Onion", "Carrot",
            "Rice", "Cabbage", "Chili", "Cucumber", "Eggplant", "Bean"
        ]

        if model is not None:
            logger.info("Preprocessor initialized with ML model")
        else:
            logger.warning("Preprocessor initialized WITHOUT ML model (test mode enabled)")

    # ---------- Utils ----------

    @staticmethod
    def _to_float(val, default=None):
        try:
            if val is None:
                return default
            return float(val)
        except Exception:
            return default

    @staticmethod
    def ppm_to_kg_per_ha(ppm: float, depth_cm: float = 20, bulk_density: float = 1.3) -> float:
        """Convert ppm to kg/ha using standard formula."""
        return ppm * depth_cm * bulk_density * 10

    def _should_convert_to_kg_ha(self, feature_order: List[str]) -> bool:
        """
        Convert ppm -> kg/ha only if the model's feature names indicate kg/ha.
        This avoids a common 'unit drift' bug where the model trained on ppm
        but the API feeds kg/ha (causing skew and same-class dominance).
        """
        joined = " ".join([c.lower() for c in feature_order])
        return "kg/ha" in joined

    def encode_categorical(self, value: str, encoder_name: str) -> int:
        """
        Encode categorical with provided LabelEncoder (if available).
        For unseen labels, fall back to the first class index (stable) instead of 0 literal,
        to keep distribution closer to training (and not bias the same tree path).
        """
        value = (value or "").strip()
        enc = self.label_encoders.get(encoder_name)
        if enc is None:
            logger.warning(f"Encoder not found for '{encoder_name}', using 0")
            return 0

        try:
            classes = list(getattr(enc, "classes_", []))
            if value in classes:
                return int(enc.transform([value])[0])
            # Unseen: choose the most frequent proxy if available
            # Some training scripts store 'most_frequent_<name>'—fallback if present.
            most_freq_attr = f"most_frequent_{encoder_name.replace(' ', '_')}"
            if hasattr(enc, most_freq_attr):
                proxy = getattr(enc, most_freq_attr)
                if proxy in classes:
                    return int(enc.transform([proxy])[0])
            # Otherwise, map to first known class index (stable, non-zero bias avoided if class 0 isn't special)
            if classes:
                idx = int(enc.transform([classes[0]])[0])
                logger.warning(f"Unseen value '{value}' for '{encoder_name}', using '{classes[0]}' (idx={idx})")
                return idx
        except Exception as e:
            logger.error(f"Encoding error for '{encoder_name}': {e}")

        return 0

    # ---------- Core preprocessing ----------

    def preprocess_app_data(self, app_data: Dict) -> np.ndarray:
        """
        Convert app data into model-ready feature vector.
        Major fixes here:
        - Respect the model's feature_columns if provided in pickle (or model.feature_names_in_).
        - Convert ppm -> kg/ha only when expected by those columns.
        - Avoid clamping to weird constants that erase variance.
        """

        # Extract raw inputs (keep variance!)
        soil_ph = self._to_float(app_data.get("soil_ph"), 7.0)
        if soil_ph is not None:
            # Keep within agronomic bounds, but don't squash normal variation
            soil_ph = max(3.0, min(soil_ph, 10.0))

        nitrogen_ppm = max(0.0, self._to_float(app_data.get("nitrogen_ppm"), 0.0))
        phosphorus_ppm = max(0.0, self._to_float(app_data.get("phosphorus_ppm"), 0.0))
        potassium_ppm = max(0.0, self._to_float(app_data.get("potassium_ppm"), 0.0))

        temperature = self._to_float(app_data.get("temperature"), self.defaults["temperature"])
        temperature = max(-50.0, min(temperature, 60.0)) if temperature is not None else self.defaults["temperature"]

        rainfall = self._to_float(app_data.get("rainfall"), self.defaults["rainfall"])
        rainfall = max(0.0, rainfall) if rainfall is not None else self.defaults["rainfall"]

        humidity = self._to_float(app_data.get("humidity"), self.defaults["humidity"])
        humidity = max(0.0, min(humidity, 100.0)) if humidity is not None else self.defaults["humidity"]

        agro_zone = str(app_data.get("agro_ecological_zone", "") or "").strip()
        cultivation_season = str(app_data.get("cultivation_season", "") or "").strip()
        soil_type = str(app_data.get("soil_type", "") or "").strip()

        # Determine feature order
        feature_order = []
        if self.feature_columns:
            feature_order = list(self.feature_columns)
        elif hasattr(self.model, "feature_names_in_"):
            feature_order = list(getattr(self.model, "feature_names_in_"))
        else:
            # Sensible default ordering
            feature_order = [
                "Temperature (°C)",
                "N (ppm)", "P (ppm)", "K (ppm)",           # default to ppm unless model says kg/ha
                "Soil pH",
                "Rainfall (mm)_avg",
                "Humidity (%)_avg",
                "Agro-Ecological Zones (AEZs)_encoded",
                "Cultivation Season_encoded",
                "Soil Types_encoded",
            ]

        # Decide units for N/P/K based on expected columns
        expects_kg_ha = self._should_convert_to_kg_ha(feature_order)
        if expects_kg_ha:
            n_val = self.ppm_to_kg_per_ha(nitrogen_ppm)
            p_val = self.ppm_to_kg_per_ha(phosphorus_ppm)
            k_val = self.ppm_to_kg_per_ha(potassium_ppm)
            n_key, p_key, k_key = "N (kg/ha)", "P (kg/ha)", "K (kg/ha)"
        else:
            n_val, p_val, k_val = nitrogen_ppm, phosphorus_ppm, potassium_ppm
            n_key, p_key, k_key = "N (ppm)", "P (ppm)", "K (ppm)"

        # Build a feature dict with multiple aliases to be robust
        feature_values = {
            "Temperature (°C)": temperature,
            "temperature": temperature,

            n_key: n_val, "N": n_val, "Nitrogen": n_val,
            p_key: p_val, "P": p_val, "Phosphorus": p_val,
            k_key: k_val, "K": k_val, "Potassium": k_val,

            "Soil pH": soil_ph, "pH": soil_ph,

            "Rainfall (mm)_avg": rainfall, "rainfall": rainfall,
            "Humidity (%)_avg": humidity, "humidity": humidity,

            "Agro-Ecological Zones (AEZs)_encoded": self.encode_categorical(agro_zone, "Agro-Ecological Zones (AEZs)"),
            "Cultivation Season_encoded": self.encode_categorical(cultivation_season, "Cultivation Season"),
            "Soil Types_encoded": self.encode_categorical(soil_type, "Soil Types"),
        }

        # Assemble final feature vector strictly in model's expected order
        features = []
        missing = []
        for col in feature_order:
            if col in feature_values:
                features.append(feature_values[col])
            else:
                # Try a few common fallbacks by lowercase match
                key_lc = {k.lower(): k for k in feature_values}
                if col.lower() in key_lc:
                    features.append(feature_values[key_lc[col.lower()]])
                else:
                    missing.append(col)
                    # Zero-fill missing unknowns; log once
                    features.append(0.0)

        if missing:
            logger.warning(f"Missing {len(missing)} expected features (zero-filled): {missing}")

        X = np.array([features], dtype=float)
        logger.info(f"Prepared features (shape {X.shape})")
        return X

    # ---------- Prediction ----------

    def _test_mode_predict(self, app_data: Dict) -> Dict:
        """
        Non-deterministic test-mode prediction WITHOUT any crop hard-coding.
        Generates plausible, varied outputs so you can test the UI without biasing to one crop.
        """
        crops = self.supported_crops[:]
        random.shuffle(crops)
        pri = crops[0]
        # generate probabilites that sum to 100
        p1 = random.uniform(50, 85)
        rem = 100 - p1
        p2 = random.uniform(rem * 0.3, rem * 0.7)
        p3 = rem - p2

        return {
            "success": True,
            "predicted_crop": pri,
            "confidence": round(p1, 2),
            "top_3_predictions": [
                {"crop": crops[0], "probability": round(p1, 2)},
                {"crop": crops[1], "probability": round(p2, 2)},
                {"crop": crops[2], "probability": round(p3, 2)},
            ],
            "ml_model_accuracy": 65.0,
            "test_mode": True,
        }

    def predict_crop(self, app_data: Dict) -> Dict:
        if self.model is None:
            logger.warning("ML model unavailable -> TEST MODE")
            return self._test_mode_predict(app_data)

        X = self.preprocess_app_data(app_data)

        try:
            y_pred = self.model.predict(X)[0]
            if self.target_encoder is not None:
                predicted_crop = self.target_encoder.inverse_transform([y_pred])[0]
            else:
                predicted_crop = str(y_pred)

            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(X)[0]
                top_idx = np.argsort(probs)[::-1][:3]
                if self.target_encoder is not None:
                    top_crops = self.target_encoder.inverse_transform(top_idx)
                else:
                    top_crops = [str(i) for i in top_idx]
                top_probs = probs[top_idx] * 100
                confidence = float(np.max(probs) * 100)
                top3 = [{"crop": c, "probability": round(p, 2)} for c, p in zip(top_crops, top_probs)]
            else:
                # Rare case: model without predict_proba (treat as 100% confident)
                confidence = 100.0
                top3 = [{"crop": predicted_crop, "probability": 100.0}]

            return {
                "success": True,
                "predicted_crop": predicted_crop,
                "confidence": round(confidence, 2),
                "top_3_predictions": top3,
                "ml_model_accuracy": 88.0,  # Fill with your actual test metric if stored elsewhere
                "test_mode": False,
            }
        except Exception as e:
            logger.error(f"Model prediction error: {e}", exc_info=True)
            return self._test_mode_predict(app_data)

# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class CropPredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    soil_type: str = Field(..., description="Soil type")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH level (0-14)")
    nitrogen_ppm: float = Field(..., ge=0, description="Nitrogen content in ppm")
    phosphorus_ppm: float = Field(..., ge=0, description="Phosphorus content in ppm")
    potassium_ppm: float = Field(..., ge=0, description="Potassium content in ppm")
    agro_ecological_zone: str = Field(..., description="Agro-ecological zone")
    cultivation_season: str = Field(..., description="Cultivation season")
    district: Optional[str] = Field(None, description="District (optional)")
    land_area_hectares: Optional[float] = Field(None, ge=0, description="Land area in hectares")
    temperature: Optional[float] = Field(None, ge=-50, le=60, description="Temperature in Celsius")
    rainfall: Optional[float] = Field(None, ge=0, description="Rainfall in mm")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Humidity percentage")

    @validator("soil_ph")
    def validate_soil_ph(cls, v):
        if not 3.0 <= v <= 10.0:
            raise ValueError("Soil pH should be between 3.0 and 10.0 for agricultural purposes")
        return v

class CropPrediction(BaseModel):
    crop: str
    probability: float

class CropPredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    success: bool
    predicted_crop: str
    confidence: float
    top_3_predictions: List[CropPrediction]
    ml_model_accuracy: float
    processing_time_ms: float
    timestamp: str
    test_mode: Optional[bool] = False

# -----------------------------------------------------------------------------
# FastAPI
# -----------------------------------------------------------------------------
app = FastAPI(
    title="🌾 Smart Crop Recommendation API",
    description="Clean, non-biased crop recommendation service",
    version="1.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

preprocessor: Optional[CropRecommendationPreprocessor] = None
model_metadata: Optional[Dict] = None

# -----------------------------------------------------------------------------
# Startup: Load model safely
# -----------------------------------------------------------------------------
@app.on_event("startup")
async def load_model():
    global preprocessor, model_metadata
    try:
        logger.info("Loading model package...")
        if not MODEL_PATH.exists():
            logger.error(f"Model file not found: {MODEL_PATH}")
            os.makedirs(MODEL_DIR, exist_ok=True)
            # Run in test mode if file missing
            preprocessor = CropRecommendationPreprocessor()
            model_metadata = {
                "accuracy": 0.65,
                "crops_supported": CropRecommendationPreprocessor().supported_crops,
                "training_date": "N/A",
            }
            return

        with open(MODEL_PATH, "rb") as f:
            class CustomUnpickler(pickle.Unpickler):
                def find_class(self, module, name):
                    if name == "CropRecommendationPreprocessor":
                        return CropRecommendationPreprocessor
                    return super().find_class(module, name)

            try:
                pkg = CustomUnpickler(f).load()
            except Exception:
                f.seek(0)
                pkg = pickle.load(f)

        if not isinstance(pkg, dict):
            # Wrap unknown payloads
            pkg = {
                "model": pkg,
                "target_encoder": None,
                "label_encoders": {},
                "feature_columns": [],
                "model_metadata": {},
            }

        model = pkg.get("model")
        target_encoder = pkg.get("target_encoder")
        label_encoders = pkg.get("label_encoders", {})
        feature_columns = pkg.get("feature_columns", [])

        # Validate model capabilities
        if not hasattr(model, "predict"):
            raise ValueError("Loaded object has no 'predict' method")
        if not hasattr(model, "predict_proba"):
            raise ValueError("Loaded object has no 'predict_proba' method")

        preprocessor = CropRecommendationPreprocessor(
            model=model,
            target_encoder=target_encoder,
            label_encoders=label_encoders,
            feature_columns=feature_columns,
        )

        model_metadata = pkg.get(
            "model_metadata",
            {
                "accuracy": 0.88,
                "crops_supported": preprocessor.supported_crops,
                "training_date": "Unknown",
            },
        )

        logger.info("✅ Model loaded successfully.")
        logger.info(f"Feature columns: {feature_columns if feature_columns else 'None (using model.feature_names_in_ or defaults)'}")

    except Exception as e:
        logger.error(f"CRITICAL: Failed to load model. Running in test mode. Error: {e}", exc_info=True)
        preprocessor = CropRecommendationPreprocessor()
        model_metadata = {
            "accuracy": 0.65,
            "crops_supported": preprocessor.supported_crops,
            "training_date": "N/A",
        }

# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": bool(preprocessor and preprocessor.model is not None),
        "test_mode": not (preprocessor and preprocessor.model is not None),
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
        "timestamp": datetime.now().isoformat(),
        "message": "Crop Recommendation API is running",
    }

@app.get("/model-info")
async def get_model_info():
    if model_metadata is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_type": type(preprocessor.model).__name__ if preprocessor and preprocessor.model else "N/A",
        "model_accuracy": round(model_metadata.get("accuracy", 0.0) * 100, 2)
            if model_metadata.get("accuracy", 0.0) <= 1.0
            else round(model_metadata.get("accuracy", 0.0), 2),
        "crops_supported": model_metadata.get("crops_supported", []),
        "training_date": model_metadata.get("training_date", "Unknown"),
        "model_path": str(MODEL_PATH),
        "test_mode": not (preprocessor and preprocessor.model is not None),
    }

@app.post("/predict-crop", response_model=CropPredictionResponse)
async def predict_crop(request: CropPredictionRequest):
    if preprocessor is None:
        raise HTTPException(status_code=503, detail="Preprocessor not initialized")

    start = datetime.now()

    app_data = {
        "soil_type": request.soil_type,
        "soil_ph": request.soil_ph,
        "nitrogen_ppm": request.nitrogen_ppm,
        "phosphorus_ppm": request.phosphorus_ppm,
        "potassium_ppm": request.potassium_ppm,
        "agro_ecological_zone": request.agro_ecological_zone,
        "cultivation_season": request.cultivation_season,
        "temperature": request.temperature,
        "rainfall": request.rainfall,
        "humidity": request.humidity,
        "district": request.district,
        "land_area_hectares": request.land_area_hectares,
    }

    logger.info(f"Prediction request: {request.model_dump()}")

    result = preprocessor.predict_crop(app_data)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=f"Prediction failed: {result.get('error', 'Unknown error')}")

    duration_ms = (datetime.now() - start).total_seconds() * 1000.0

    return CropPredictionResponse(
        success=True,
        predicted_crop=result["predicted_crop"],
        confidence=result["confidence"],
        top_3_predictions=[CropPrediction(**p) for p in result["top_3_predictions"]],
        ml_model_accuracy=result["ml_model_accuracy"],
        processing_time_ms=round(duration_ms, 2),
        timestamp=datetime.now().isoformat(),
        test_mode=result.get("test_mode", False),
    )

@app.get("/debug-model")
async def debug_model():
    if preprocessor is None:
        return {"status": "error", "message": "Preprocessor not initialized"}

    status = {
        "model_loaded": preprocessor.model is not None,
        "target_encoder_loaded": preprocessor.target_encoder is not None,
        "label_encoders_count": len(preprocessor.label_encoders),
        "feature_columns_count": len(preprocessor.feature_columns),
        "model_file": str(MODEL_PATH),
        "model_file_exists": MODEL_PATH.exists(),
    }
    if not preprocessor.model:
        return {"status": "error", "message": "Model not loaded", **status}

    # Probe with small, varied inputs to see if predictions actually vary
    test_inputs = []
    for ph in [5.0, 6.0, 6.8, 7.5, 8.5]:
        test_inputs.append({
            "soil_type": "Red Yellow Podzolic (RYP)",
            "soil_ph": ph,
            "nitrogen_ppm": 10 + ph * 2,
            "phosphorus_ppm": 8 + ph,
            "potassium_ppm": 120 + ph * 5,
            "agro_ecological_zone": "WM1a",
            "cultivation_season": "Maha",
            "temperature": 22 + (ph - 6.5) * 1.5,
            "rainfall": 1000 + (ph - 6.5) * 30,
            "humidity": 70,
        })

    results = []
    for i, ti in enumerate(test_inputs):
        try:
            X = preprocessor.preprocess_app_data(ti)
            y = preprocessor.model.predict(X)[0]
            if preprocessor.target_encoder is not None:
                crop = preprocessor.target_encoder.inverse_transform([y])[0]
            else:
                crop = str(y)
            if hasattr(preprocessor.model, "predict_proba"):
                conf = float(np.max(preprocessor.model.predict_proba(X)[0]) * 100)
            else:
                conf = 100.0
            results.append({"i": i, "soil_ph": ti["soil_ph"], "crop": crop, "confidence": conf})
        except Exception as e:
            results.append({"i": i, "soil_ph": ti["soil_ph"], "error": str(e)})

    unique = sorted({r.get("crop") for r in results if r.get("crop")})
    all_same = len(unique) == 1 and len(results) > 1

    return {
        "status": "warning" if all_same else "success",
        "all_predictions_same": all_same,
        "unique_predictions": unique,
        "samples": results,
        **status,
    }

@app.get("/", response_class=HTMLResponse)
async def root():
    model_status = "✅ Model Loaded" if (preprocessor and preprocessor.model) else "⚠️ Test Mode"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Crop Recommendation API</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
            .container {{ background: white; padding: 30px; border-radius: 10px; }}
            h1 {{ color: #2e7d32; }}
            .endpoint {{ background: #e8f5e9; padding: 15px; margin: 10px 0; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌾 Smart Crop Recommendation API</h1>
            <p><strong>Status:</strong> {model_status}</p>
            <div class="endpoint"><strong><a href="/docs">📖 API Documentation</a></strong></div>
            <div class="endpoint"><strong><a href="/health">💚 Health Check</a></strong></div>
            <div class="endpoint"><strong><a href="/model-info">📊 Model Information</a></strong></div>
            <div class="endpoint"><strong><a href="/debug-model">🔍 Debug Model</a></strong></div>
            <p>Model file: {MODEL_PATH}</p>
            <p>Model exists: {MODEL_PATH.exists()}</p>
        </div>
    </body>
    </html>
    """

# -----------------------------------------------------------------------------
# Entrypoint
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    logger.info("Starting Crop Recommendation API...")
    logger.info(f"Model path: {MODEL_PATH}")
    logger.info("Docs: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
