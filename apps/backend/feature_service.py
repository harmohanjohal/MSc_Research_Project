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
        outdoor_temp = weather_data.get('temperature', 15.0)
        wind_speed = weather_data.get('windSpeed', 5.0)
        humidity = weather_data.get('humidity', 60.0)
        solar_radiation = weather_data.get('solarRadiation', 400.0)
        cloud_cover = weather_data.get('cloudCover', 50.0)
        pressure = weather_data.get('pressure', 101325.0)
        precipitation = weather_data.get('precipitation', 0.0)
        
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
        
        # 3. Occupancy factor (more people = more heat)
        occupancy_factor = 0.8 + (occupancy_rate / 100.0) * 0.4  # Range: 0.8 to 1.2
        
        # 4. Age factor (older buildings less efficient)
        age_factor = 1.0 + max(0, (building_age - 25) * 0.01)  # 1% increase per year over 25
        
        # 5. Thermostat factor (higher setpoint = more demand)
        setpoint_factor = 1.0 + (thermostat_setpoint - 21) * 0.05  # 5% per degree
        
        # Combined scaling factor
        total_scaling = area_factor * insulation_factor * occupancy_factor * age_factor * setpoint_factor
        
        # Apply scaling to temperature-sensitive features
        # Scale HDH (heating degree hours) as it directly relates to heat demand
        original_hdh = features['hdh']
        features['hdh'] = original_hdh * total_scaling
        
        # Also adjust the base temperature calculation slightly based on thermostat setting
        adjusted_base_temp = self.base_temp + (thermostat_setpoint - 21) * 0.5
        features['hdh'] = max(0, adjusted_base_temp - features['outdoor_temp_synthetic']) * total_scaling
        
        # Log the scaling for debugging
        print(f"Building scaling applied: area={area_factor:.2f}, insulation={insulation_factor:.2f}, "
              f"occupancy={occupancy_factor:.2f}, age={age_factor:.2f}, thermostat={setpoint_factor:.2f}, "
              f"total={total_scaling:.2f}")
        
        return features
    
    def create_horizon_prediction_features(
        self,
        current_weather: Dict[str, Union[int, float]],
        weather_forecast: List[Dict[str, Union[int, float, str]]],
        horizon_hours: int = 24,
        building_data: Optional[Dict[str, Union[int, float, str]]] = None
    ) -> pd.DataFrame:
        """
        Create features for multi-hour horizon prediction
        
        Args:
            current_weather: Current weather conditions
            weather_forecast: List of hourly weather forecasts
            horizon_hours: Number of hours to predict (24 or 48)
            
        Returns:
            DataFrame with features for each hour in the horizon
        """
        features_list = []
        now = datetime.now()
        
        # Ensure we have enough forecast data
        if len(weather_forecast) < horizon_hours:
            # Extend forecast by repeating the last available forecast
            last_forecast = weather_forecast[-1] if weather_forecast else current_weather
            while len(weather_forecast) < horizon_hours:
                weather_forecast.append(last_forecast.copy())
        
        for hour in range(horizon_hours):
            prediction_time = now + timedelta(hours=hour)
            
            # Use current weather for first hour, then forecast
            if hour == 0:
                weather_data = current_weather
            else:
                # Use forecast data (hour-1 because forecast starts from next hour)
                forecast_idx = min(hour - 1, len(weather_forecast) - 1)
                weather_data = weather_forecast[forecast_idx]
            
            # Create features for this time point
            hour_features = self.create_single_prediction_features(
                weather_data, prediction_time, building_data
            )
            
            # Add hour index for reference
            hour_features['prediction_hour'] = hour
            hour_features['timestamp'] = prediction_time.isoformat()
            
            features_list.append(hour_features)
        
        # Combine all hours into single DataFrame
        all_features = pd.concat(features_list, ignore_index=True)
        
        # Now add proper lag and diff features based on the sequence
        all_features = self._add_temporal_features(all_features)
        
        return all_features
    
    def _add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add proper temporal lag and difference features to a time series DataFrame
        
        Args:
            df: DataFrame with hourly features
            
        Returns:
            DataFrame with proper temporal features
        """
        df = df.copy()
        
        # Calculate proper temperature lags
        df['outdoor_temp_lag_1'] = df['outdoor_temp_synthetic'].shift(1).fillna(df['outdoor_temp_synthetic'].iloc[0])
        df['outdoor_temp_lag_2'] = df['outdoor_temp_synthetic'].shift(2).fillna(df['outdoor_temp_synthetic'].iloc[0])
        df['outdoor_temp_lag_3'] = df['outdoor_temp_synthetic'].shift(3).fillna(df['outdoor_temp_synthetic'].iloc[0])
        
        # Calculate proper temperature differences
        df['outdoor_temp_diff_1'] = df['outdoor_temp_synthetic'].diff(1).fillna(0)
        df['outdoor_temp_diff_2'] = df['outdoor_temp_synthetic'].diff(2).fillna(0)
        
        return df
    
    def validate_features(self, features: pd.DataFrame, expected_columns: List[str]) -> pd.DataFrame:
        """
        Validate and ensure features match the expected model input format
        
        Args:
            features: DataFrame with generated features
            expected_columns: List of column names expected by the model
            
        Returns:
            DataFrame with columns in correct order and any missing columns filled
        """
        # Ensure all expected columns are present
        for col in expected_columns:
            if col not in features.columns:
                # Add missing column with default value
                if 'temp' in col:
                    features[col] = 15.0  # Default temperature
                elif 'hdh' in col:
                    features[col] = 2.0   # Default heating degree hours
                elif 'hour' in col:
                    features[col] = 12    # Default hour
                elif 'month' in col:
                    features[col] = 6     # Default month
                elif 'day' in col:
                    features[col] = 1     # Default day
                else:
                    features[col] = 0.0   # Default zero
        
        # Return columns in the expected order
        return features[expected_columns]
    
    def get_feature_info(self) -> Dict[str, str]:
        """
        Get information about the features created by this service
        
        Returns:
            Dictionary with feature descriptions
        """
        return {
            'outdoor_temp_synthetic': 'Current outdoor temperature (°C)',
            'hdh': 'Heating degree hours (base 17°C)',
            'hour': 'Hour of day (0-23)',
            'day_of_week': 'Day of week (0=Monday, 6=Sunday)',
            'month': 'Month (1-12)',
            'is_weekend': 'Weekend flag (0=weekday, 1=weekend)',
            'outdoor_temp_lag_1': 'Temperature 1 hour ago (°C)',
            'outdoor_temp_lag_2': 'Temperature 2 hours ago (°C)',
            'outdoor_temp_lag_3': 'Temperature 3 hours ago (°C)',
            'outdoor_temp_diff_1': 'Temperature change from 1 hour ago (°C)',
            'outdoor_temp_diff_2': 'Temperature change from 2 hours ago (°C)'
        }