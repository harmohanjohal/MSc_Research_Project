"""
Feature Engineering Service for Heat Demand Prediction API
Converts frontend weather data to model-ready features
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Union, Optional

class FeatureService:
    """
    Service to convert weather data and time information into model features
    """
    
    def __init__(self):
        """Initialize the feature service"""
        self.base_temp = 17.0  # Base temperature for heating degree hours
        
    def process_input(self, input_data: Dict) -> pd.DataFrame:
        """
        Process input data and convert to model features
        
        Args:
            input_data: Dictionary with input parameters
            
        Returns:
            DataFrame with model-ready features
        """
        # Extract timestamp
        timestamp = datetime.now()
        if 'timestamp' in input_data:
            try:
                timestamp = datetime.fromisoformat(input_data['timestamp'])
            except:
                pass
        
        # Create features
        features = self.create_single_prediction_features(input_data, timestamp)
        return features
        
    def create_single_prediction_features(
        self, 
        weather_data: Dict[str, Union[int, float]], 
        timestamp: Optional[datetime] = None,
        building_data: Optional[Dict[str, Union[int, float, str]]] = None
    ) -> pd.DataFrame:
        """
        Create features for a single prediction point
        
        Args:
            weather_data: Dictionary with weather information from frontend
            timestamp: Specific timestamp for prediction (defaults to now)
            building_data: Dictionary with building characteristics for scaling
            
        Returns:
            DataFrame with model-ready features
        """
        if timestamp is None:
            timestamp = datetime.now()
            
        # Extract weather data with defaults
        outdoor_temp = weather_data.get('temperature', weather_data.get('DryBulbTemp', 15.0))
        wind_speed = weather_data.get('windSpeed', weather_data.get('WindSpeed', 5.0))
        humidity = weather_data.get('humidity', weather_data.get('RelHumidity', 60.0))
        solar_radiation = weather_data.get('solarRadiation', weather_data.get('DirectNormRad', 400.0))
        cloud_cover = weather_data.get('cloudCover', weather_data.get('TotalSkyCover', 50.0))
        
        # Create base features
        features = {
            # Temperature features
            'outdoor_temp_synthetic': outdoor_temp,
            'hdh': max(0, self.base_temp - outdoor_temp),  # Heating degree hours
            
            # Time-based features
            'hour': timestamp.hour,
            'day_of_week': timestamp.weekday(),
            'month': timestamp.month,
            'is_weekend': 1 if timestamp.weekday() >= 5 else 0,
            
            # Temperature lag features (simplified - assume stable recent temperature)
            'outdoor_temp_lag_1': outdoor_temp,
            'outdoor_temp_lag_2': outdoor_temp, 
            'outdoor_temp_lag_3': outdoor_temp,
            
            # Temperature difference features (assume stable temperature)
            'outdoor_temp_diff_1': 0.0,
            'outdoor_temp_diff_2': 0.0
        }
        
        # Apply building scaling if building data is provided
        if building_data:
            features = self._apply_building_scaling(features, building_data)
        
        return pd.DataFrame([features])
    
    def _apply_building_scaling(self, features: Dict, building_data: Dict) -> Dict:
        """
        Apply building-specific scaling to features
        
        The model was trained on a small building (~15,000 m² equivalent)
        We need to scale features based on actual building characteristics
        """
        # Extract building parameters with defaults
        floor_area = building_data.get('floorArea', 15000)
        insulation_level = building_data.get('insulationLevel', 'standard')
        occupancy_rate = building_data.get('occupancyRate', 85)
        building_age = building_data.get('buildingAge', 25)
        thermostat_setpoint = building_data.get('thermostatSetpoint', 21)
        
        # Calculate scaling factors
        
        # 1. Area scaling factor (linear relationship)
        area_factor = floor_area / 15000.0  # Base area from training data
        
        # 2. Insulation factor (affects heat loss)
        insulation_factors = {
            'poor': 1.4,      # 40% more heat loss
            'standard': 1.0,  # Baseline
            'excellent': 0.7  # 30% less heat loss
        }
        insulation_factor = insulation_factors.get(insulation_level, 1.0)
        
        # 3. Occupancy factor (affects internal heat gains)
        occupancy_factor = occupancy_rate / 85.0  # Base occupancy from training data
        
        # 4. Age factor (affects efficiency)
        age_factor = 1.0 + (building_age - 25) * 0.01  # 1% efficiency loss per year
        
        # 5. Setpoint factor (affects heating demand)
        setpoint_factor = (thermostat_setpoint - 18) / 3.0  # Base setpoint 18°C, range 3°C
        
        # Apply scaling to heat demand features
        scaling_factor = area_factor * insulation_factor * occupancy_factor * age_factor * setpoint_factor
        
        # Scale features that affect heat demand
        heat_demand_features = ['hdh', 'outdoor_temp_lag_1', 'outdoor_temp_lag_2', 'outdoor_temp_lag_3']
        for feature in heat_demand_features:
            if feature in features:
                features[feature] *= scaling_factor
        
        return features
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names"""
        return [
            'outdoor_temp_synthetic', 'hdh', 'hour', 'day_of_week', 'month', 'is_weekend',
            'outdoor_temp_lag_1', 'outdoor_temp_lag_2', 'outdoor_temp_lag_3',
            'outdoor_temp_diff_1', 'outdoor_temp_diff_2'
        ]
    
    def get_sample_data(self) -> Dict:
        """Get sample data for testing"""
        return {
            'temperature': 15.5,
            'windSpeed': 5.2,
            'humidity': 65.0,
            'solarRadiation': 350.0,
            'cloudCover': 60.0,
            'floorArea': 12000,
            'insulationLevel': 'standard',
            'occupancyRate': 85,
            'buildingAge': 25,
            'thermostatSetpoint': 21
        }
    
    def get_features_info(self) -> List[Dict]:
        """Get information about features"""
        return [
            {
                'name': 'temperature',
                'type': 'float',
                'description': 'Outdoor air temperature',
                'unit': '°C',
                'range': {'min': -10, 'max': 35}
            },
            {
                'name': 'windSpeed',
                'type': 'float',
                'description': 'Wind speed',
                'unit': 'm/s',
                'range': {'min': 0, 'max': 20}
            },
            {
                'name': 'humidity',
                'type': 'float',
                'description': 'Relative humidity',
                'unit': '%',
                'range': {'min': 0, 'max': 100}
            },
            {
                'name': 'solarRadiation',
                'type': 'float',
                'description': 'Solar radiation',
                'unit': 'W/m²',
                'range': {'min': 0, 'max': 1000}
            },
            {
                'name': 'cloudCover',
                'type': 'float',
                'description': 'Cloud cover',
                'unit': '%',
                'range': {'min': 0, 'max': 100}
            },
            {
                'name': 'floorArea',
                'type': 'float',
                'description': 'Building floor area',
                'unit': 'm²',
                'range': {'min': 1000, 'max': 50000}
            }
        ]





