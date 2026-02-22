"""
Constants and Mock Data for the Heat Demand Prediction API

This module isolates hardcoded sample and test data arrays from the 
core routing logic to ensure a clean separation of concerns.
"""

SAMPLE_WEATHER_DATA = {
    'temperature': 15.0,
    'windSpeed': 8.0,
    'humidity': 65.0,
    'solarRadiation': 450.0,
    'cloudCover': 55.0,
    'pressure': 101325.0,
    'precipitation': 0.0
}

SAMPLE_BUILDING_DATA = {
    'floorArea': 100.0,
    'numFloors': 2,
    'infiltrationRate': 0.5,
    'buildingType': 'detached',
    'constructionType': 'standard'
}

TEST_WEATHER_DATA = {
    'temperature': 10.0,
    'windSpeed': 15.0,
    'humidity': 70.0,
    'solarRadiation': 300.0,
    'cloudCover': 60.0,
    'pressure': 101325.0,
    'precipitation': 0.0
}
