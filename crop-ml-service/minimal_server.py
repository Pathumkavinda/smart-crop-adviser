# minimal_server.py - Temporary test server
# Save this in crop-ml-service folder
# Run with: python minimal_server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import List
import uvicorn
from datetime import datetime

# Simple response models
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

# Create FastAPI app
app = FastAPI(title="🧪 Test Crop Recommendation API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Test health endpoint"""
    return {
        "status": "healthy",
        "model_loaded": True,  # Fake it for testing
        "message": "Test server is running!",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict-crop", response_model=CropPredictionResponse)
def fake_predict_crop(request: dict):
    """Fake prediction endpoint for testing React app"""
    
    print(f"📥 Received prediction request: {request}")
    
    # Simulate different crops based on input
    soil_type = request.get('soil_type', '')
    
    if 'Red Yellow' in soil_type:
        predicted_crop = "Potato"
        confidence = 89.5
        crops = ["Potato", "Carrot", "Tomato"]
    elif 'Brown' in soil_type:
        predicted_crop = "Maize"
        confidence = 92.3
        crops = ["Maize", "Big Onion", "Red Onion"]
    else:
        predicted_crop = "Tomato"
        confidence = 85.7
        crops = ["Tomato", "Potato", "Maize"]
    
    # Create fake response
    response = CropPredictionResponse(
        success=True,
        predicted_crop=predicted_crop,
        confidence=confidence,
        top_3_predictions=[
            CropPrediction(crop=crops[0], probability=confidence),
            CropPrediction(crop=crops[1], probability=max(10.0, 100 - confidence - 5)),
            CropPrediction(crop=crops[2], probability=max(1.0, 100 - confidence - 15))
        ],
        ml_model_accuracy=88.28,
        processing_time_ms=15.5,
        timestamp=datetime.now().isoformat()
    )
    
    print(f"📤 Sending response: {predicted_crop} ({confidence}%)")
    return response

@app.get("/options")
def get_options():
    """Fake options endpoint"""
    return {
        "soil_types": [
            "Red Yellow Podzolic (RYP)",
            "Reddish Brown Earth (RBE)",
            "Low Humic Gley (LHG)",
            "Alluvial"
        ],
        "agro_ecological_zones": [
            "DL1a", "DL1b", "WL1a", "WL2a", "WM1a", "IM1a"
        ],
        "cultivation_seasons": ["Maha", "Yala"],
        "supported_crops": ["Maize", "Potato", "Tomato", "Red Onion", "Big Onion", "Carrot"]
    }

@app.get("/test")
def test_endpoint():
    """Test with sample data"""
    sample_request = {
        "soil_type": "Red Yellow Podzolic (RYP)",
        "soil_ph": 6.5,
        "nitrogen_ppm": 25,
        "phosphorus_ppm": 18,
        "potassium_ppm": 200,
        "agro_ecological_zone": "DL1a",
        "cultivation_season": "Maha"
    }
    
    result = fake_predict_crop(sample_request)
    return {
        "message": "Test prediction successful!",
        "input": sample_request,
        "result": result
    }

@app.get("/")
def root():
    """Welcome page"""
    return {
        "message": "🧪 Test Crop Recommendation API",
        "status": "This is a temporary test server",
        "endpoints": {
            "health": "/health",
            "predict": "/predict-crop",
            "options": "/options",
            "test": "/test"
        },
        "note": "This server provides fake responses for testing your React app"
    }

if __name__ == "__main__":
    print("🧪 Starting TEST server (fake ML responses)")
    print("📝 This is NOT the real ML model!")
    print("🔗 Use this to test your React app while troubleshooting the real model")
    print("🌐 API will be available at: http://localhost:8000")
    print("🏠 Home: http://localhost:8000")
    print("💚 Health: http://localhost:8000/health")
    print("🧪 Test: http://localhost:8000/test")
    print("-" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )