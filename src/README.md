Source Code Directory

This directory contains the main source code for the Heat Optimization Project.

Directory Structure

api
Contains the web API components for heat demand prediction:

app.py - Main Flask API server with endpoints for predictions
requirements.txt - Python dependencies for the API
services/feature_service.py - Feature engineering service for data processing

ml
Contains machine learning components:

training/catboost_model.py - Production CatBoost model training and evaluation

simulation
Reserved for energy simulation components (currently empty)

API Components

Flask Web Server (app.py)
Main API endpoints:
- /api/health - Health check and system status
- /api/model-info - Model information and performance metrics
- /api/predict - Heat demand prediction endpoint

Features:
- CORS enabled for frontend communication
- Comprehensive error handling and logging
- Model loading and initialization
- Input validation and processing
- JSON response formatting

Feature Service (services/feature_service.py)
Converts weather data to model-ready features:
- Temperature-based features (outdoor temperature, heating degree hours)
- Time-based features (hour, day, month, weekend indicators)
- Lag features (temperature history)
- Building scaling for different building types
- Input validation and data processing

Machine Learning Components

CatBoost Model Training (ml/training/catboost_model.py)
Production-ready machine learning pipeline:
- Data loading and preprocessing
- Feature engineering and selection
- Model training with hyperparameter optimization
- Cross-validation and performance evaluation
- Model saving and loading
- Comprehensive metrics calculation (MAE, R2, MAPE, RMSE)

Model Features
- Outdoor temperature and heating degree hours
- Time-based features (hour, day, week, month)
- Temperature lag features (historical temperature)
- Weekend and seasonal indicators
- Building-specific scaling factors

Dependencies

API Dependencies (api/requirements.txt):
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- Pandas 2.0.0+ - Data manipulation
- NumPy 1.24.0+ - Numerical computing
- Scikit-learn 1.3.0+ - Machine learning utilities
- CatBoost 1.2.2+ - Gradient boosting library
- Joblib 1.3.0+ - Model persistence
- Python-dateutil 2.8.0+ - Date utilities

Usage

Running the API:
1. Install dependencies: pip install -r src/api/requirements.txt
2. Run the server: python src/api/app.py
3. API will be available at http://127.0.0.1:5000

Training the model:
1. Navigate to ml/training directory
2. Run: python catboost_model.py
3. Model will be saved to data/processed/models/

API Endpoints

Health Check: GET /api/health
Returns system status and model information

Model Info: GET /api/model-info
Returns model performance metrics and configuration

Prediction: POST /api/predict
Accepts weather data and returns heat demand predictions

Input Format for Predictions:
{
    "temperature": 15.0,
    "windSpeed": 5.0,
    "humidity": 60.0,
    "solarRadiation": 400.0,
    "cloudCover": 50.0
}

Output Format:
{
    "prediction": 25.5,
    "confidence": 0.85,
    "timestamp": "2024-01-15T10:30:00"
}

Architecture

The source code follows a modular architecture:
- API layer handles web requests and responses
- Service layer processes data and features
- ML layer manages model training and predictions
- Clear separation of concerns for maintainability

Error Handling

Comprehensive error handling throughout:
- Input validation and sanitization
- Model loading error recovery
- API error responses with meaningful messages
- Logging for debugging and monitoring

Performance

Optimized for production use:
- Efficient feature engineering
- Fast model predictions
- Minimal memory footprint
- Scalable API design
