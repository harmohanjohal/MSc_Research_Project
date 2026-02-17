Applications Directory

This directory contains the complete web applications for the Heat Optimization Project.

Directory Structure

backend
Flask API server for heat demand prediction:
- app.py - Main Flask application with API endpoints
- feature_service.py - Feature engineering service
- requirements.txt - Python dependencies
- best_heating_model.pkl - Trained machine learning model
- feature_scaler.pkl - Feature scaling model
- model_info.json - Model performance and configuration data

frontend-simple
Next.js web application for heat demand prediction interface:
- Modern React application with TypeScript
- Tailwind CSS styling with energy-themed design
- Multiple pages: dashboard, weather, predictions, explanation, validation, plant control, manual testing
- Real-time weather integration and interactive charts
- Mobile-responsive design

Technology Stack

Backend
- Flask web framework
- Python machine learning libraries
- CatBoost model for predictions
- Feature engineering pipeline

Frontend
- Next.js 15 with React 19
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI components
- Recharts for data visualization
- Lucide React icons

Features

Backend API
- Health check endpoint
- Model information endpoint
- Heat demand prediction endpoint
- Feature engineering service
- Error handling and logging

Frontend Application
- Real-time weather dashboard
- Interactive prediction timelines
- Model explanation and validation
- Plant control interface
- Manual testing with custom inputs
- Responsive mobile design

Usage

Running the Backend:
1. Navigate to apps/backend
2. Install dependencies: pip install -r requirements.txt
3. Run: python app.py
4. API available at http://127.0.0.1:5000

Running the Frontend:
1. Navigate to apps/frontend-simple
2. Install dependencies: npm install
3. Run: npm run dev
4. Application available at http://localhost:3000

API Endpoints

Health Check: GET /api/health
Model Info: GET /api/model-info
Prediction: POST /api/predict

Frontend Pages

Dashboard - Main overview with weather and predictions
Weather - Current weather conditions and forecasts
Predictions - Heat demand predictions with timelines
Explanation - How the AI model works
Validation - Model performance and trust indicators
Plant Control - District heating plant interface
Manual Testing - Interactive testing with custom inputs

Architecture

The applications follow a modern web architecture:
- Backend API provides machine learning predictions
- Frontend provides user interface and data visualization
- RESTful API communication between frontend and backend
- Real-time weather data integration
- Responsive design for all devices

Integration

The frontend communicates with the backend API to:
- Get model predictions for heat demand
- Retrieve model performance information
- Submit custom weather data for testing
- Display real-time system status

The system provides a complete heat demand prediction solution with both API access and user-friendly web interface.
