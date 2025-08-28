# model_diagnostics.py - Diagnose your trained model file
# Run this to understand what's in your pickle file

import pickle
import os
from pathlib import Path
import numpy as np

def diagnose_model(model_path):
    """Comprehensive model file diagnosis"""
    
    print("🔍 MODEL DIAGNOSTICS")
    print("=" * 50)
    
    # Check file existence
    model_path = Path(model_path)
    if not model_path.exists():
        print(f"❌ Model file not found: {model_path}")
        print(f"📁 Parent directory exists: {model_path.parent.exists()}")
        if model_path.parent.exists():
            print(f"📁 Files in directory: {list(model_path.parent.iterdir())}")
        return False
    
    # File info
    file_size = model_path.stat().st_size
    print(f"✅ File found: {model_path}")
    print(f"📊 File size: {file_size / 1024:.1f} KB")
    
    try:
        # Load the pickle file
        print("\n📦 LOADING PICKLE FILE...")
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        
        print(f"✅ Pickle loaded successfully")
        print(f"📊 Data type: {type(data)}")
        
        # Analyze structure
        if isinstance(data, dict):
            print(f"📦 Dictionary with {len(data)} keys:")
            for key, value in data.items():
                print(f"  🔑 {key}: {type(value)}")
                
                # Special analysis for each component
                if key == 'model' and value is not None:
                    print(f"    🤖 Model type: {type(value).__name__}")
                    print(f"    🔧 Has predict: {hasattr(value, 'predict')}")
                    print(f"    🔧 Has predict_proba: {hasattr(value, 'predict_proba')}")
                    if hasattr(value, 'n_features_in_'):
                        print(f"    📊 Expected features: {value.n_features_in_}")
                    if hasattr(value, 'classes_'):
                        print(f"    🏷️ Classes: {list(value.classes_)}")
                
                elif key == 'target_encoder' and value is not None:
                    print(f"    🎯 Encoder type: {type(value).__name__}")
                    if hasattr(value, 'classes_'):
                        print(f"    🏷️ Target classes: {list(value.classes_)}")
                
                elif key == 'label_encoders' and value is not None:
                    print(f"    🏷️ Number of encoders: {len(value)}")
                    for enc_name, encoder in value.items():
                        print(f"      - {enc_name}: {type(encoder).__name__}")
                        if hasattr(encoder, 'classes_'):
                            print(f"        Classes: {list(encoder.classes_)}")
                
                elif key == 'feature_columns' and value is not None:
                    print(f"    📋 Number of features: {len(value)}")
                    if value:
                        print(f"    📋 Features: {value}")
                
                elif key == 'model_metadata' and value is not None:
                    print(f"    📊 Metadata keys: {list(value.keys())}")
                    for mk, mv in value.items():
                        print(f"      - {mk}: {mv}")
        
        else:
            # If it's not a dictionary, maybe it's just the model
            print(f"⚠️ Data is not a dictionary")
            if hasattr(data, 'predict'):
                print(f"✅ Data has predict method - might be the model directly")
                print(f"🤖 Model type: {type(data).__name__}")
                if hasattr(data, 'classes_'):
                    print(f"🏷️ Classes: {list(data.classes_)}")
            else:
                print(f"❌ Data doesn't have predict method")
        
        # Test prediction capability
        print(f"\n🧪 TESTING PREDICTION CAPABILITY...")
        if isinstance(data, dict) and 'model' in data and data['model'] is not None:
            model = data['model']
            test_prediction(model, data.get('target_encoder'), data.get('feature_columns', []))
        elif hasattr(data, 'predict'):
            test_prediction(data, None, [])
        else:
            print(f"❌ Cannot test prediction - no model found")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading pickle: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def test_prediction(model, target_encoder, feature_columns):
    """Test if the model can make predictions"""
    try:
        # Determine number of features
        if hasattr(model, 'n_features_in_'):
            n_features = model.n_features_in_
            print(f"📊 Model expects {n_features} features")
        elif feature_columns:
            n_features = len(feature_columns)
            print(f"📊 Using feature columns count: {n_features}")
        else:
            n_features = 10  # Default guess
            print(f"⚠️ Guessing {n_features} features")
        
        # Create test data
        test_features = np.random.rand(1, n_features)
        print(f"🧪 Created test features: shape {test_features.shape}")
        
        # Test predict
        prediction = model.predict(test_features)
        print(f"✅ Predict works: {prediction}")
        
        # Test predict_proba
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(test_features)
            print(f"✅ Predict_proba works: shape {probabilities.shape}")
            print(f"   Max probability: {np.max(probabilities):.3f}")
            
            # Test target encoder
            if target_encoder is not None:
                try:
                    crop_name = target_encoder.inverse_transform(prediction)
                    print(f"✅ Target encoder works: {crop_name}")
                except Exception as e:
                    print(f"❌ Target encoder failed: {e}")
            else:
                print(f"⚠️ No target encoder to test")
        else:
            print(f"❌ No predict_proba method")
    
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")

def main():
    """Main diagnostic function"""
    # Try to find model file
    possible_paths = [
        "models/crop_recommendation_model_PRODUCTION.pkl",
        "crop-ml-service/models/crop_recommendation_model_PRODUCTION.pkl",
        "../models/crop_recommendation_model_PRODUCTION.pkl",
        "./crop_recommendation_model_PRODUCTION.pkl"
    ]
    
    model_path = None
    for path in possible_paths:
        if Path(path).exists():
            model_path = path
            break
    
    if model_path is None:
        print("❌ Could not find model file in common locations:")
        for path in possible_paths:
            print(f"   - {path}")
        print("\n💡 Please specify the correct path to your model file")
        return
    
    # Run diagnostics
    success = diagnose_model(model_path)
    
    if success:
        print(f"\n✅ DIAGNOSTICS COMPLETE")
        print(f"💡 If you see errors above, fix them before using the ML-only API")
    else:
        print(f"\n❌ DIAGNOSTICS FAILED")
        print(f"💡 Your model file has issues that need to be resolved")

if __name__ == "__main__":
    main()