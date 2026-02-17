"""
Heat Demand Prediction API
Flask backend for the heat demand prediction system

QUICK START:
1. Install packages: pip install -r requirements.txt
2. Run: python src/api/app.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import traceback
import os
from services.feature_service import FeatureService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Global variables for model and services
model = None
scaler = None
feature_service = None
model_info = None

def load_model_and_services():
    """Load the trained model, scaler, and initialize services"""
    global model, scaler, feature_service, model_info
    
    try:
        # Updated paths for new structure
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, 'data', 'processed', 'models', 'best_heating_model.pkl')
        scaler_path = os.path.join(base_dir, 'data', 'processed', 'models', 'feature_scaler.pkl')
        info_path = os.path.join(base_dir, 'data', 'processed', 'models', 'model_info.json')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
        if not os.path.exists(info_path):
            raise FileNotFoundError(f"Model info file not found: {info_path}")
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        with open(info_path, 'r') as f:
            model_info = json.load(f)
        
        # Initialize feature service
        feature_service = FeatureService()
        
        logger.info(f"Model loaded successfully: {model_info['model_type']}")
        logger.info(f"Features: {model_info['feature_count']}")
        logger.info(f"Performance: MAE {model_info['performance']['mae']:.3f} kW")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        traceback.print_exc()
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        status = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model is not None,
            'scaler_loaded': scaler is not None,
            'feature_service_loaded': feature_service is not None
        }
        
        if model_info:
            status['model_info'] = {
                'type': model_info['model_type'],
                'features': model_info['feature_count'],
                'mae': model_info['performance']['mae']
            }
        
        return jsonify(status)
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/model-info', methods=['GET'])
def model_info_endpoint():
    """Get model information endpoint"""
    try:
        if model_info is None:
            return jsonify({
                'error': 'Model not loaded',
                'timestamp': datetime.now().isoformat()
            }), 503
        
        return jsonify({
            'model_info': model_info,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        if model is None or scaler is None or feature_service is None:
            return jsonify({
                'error': 'Model not loaded',
                'timestamp': datetime.now().isoformat()
            }), 503
        
        # Get input data
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No input data provided',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Process features
        features = feature_service.process_input(data)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get feature importance
        feature_importance = {}
        if hasattr(model, 'feature_importances_'):
            importance_dict = dict(zip(feature_service.get_feature_names(), model.feature_importances_))
            feature_importance = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)[:5])
        
        return jsonify({
            'prediction': {
                'heat_demand_kw': float(prediction),
                'prediction_time_ms': 0,  # Could add timing if needed
            },
            'model_info': {
                'model_name': model_info['model_type'],
                'model_version': '1.0.0',
                'feature_importance': feature_importance
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/sample', methods=['GET'])
def sample_data():
    """Get sample data for testing"""
    try:
        sample_data = feature_service.get_sample_data() if feature_service else {}
        
        return jsonify({
            'sample_data': sample_data,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/features', methods=['GET'])
def features_info():
    """Get features information"""
    try:
        if feature_service is None:
            return jsonify({
                'error': 'Feature service not loaded',
                'timestamp': datetime.now().isoformat()
            }), 503
        
        features_info = feature_service.get_features_info()
        
        return jsonify({
            'features': features_info,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    # Load model and services
    if load_model_and_services():
        print("✅ Model and services loaded successfully")
        print("🚀 Starting Flask API server...")
        print("📊 API endpoints:")
        print("   - GET  /api/health")
        print("   - GET  /api/model-info")
        print("   - POST /api/predict")
        print("   - GET  /api/sample")
        print("   - GET  /api/features")
        print("🌐 Server will be available at: http://localhost:5000")
        
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ Failed to load model and services")
        exit(1)





