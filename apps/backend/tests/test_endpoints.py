import pytest
import sys
import os

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test that the health endpoint returns a healthy status."""
    rv = client.get('/api/health')
    assert rv.status_code == 200
    json_data = rv.get_json()
    
    assert json_data['status'] == 'healthy'
    assert json_data['model_loaded'] is True
    assert json_data['scaler_loaded'] is True
    assert json_data['feature_service_loaded'] is True

def test_test_prediction_endpoint(client):
    """Test that the automated test endpoint evaluates successfully."""
    rv = client.get('/api/test')
    assert rv.status_code == 200
    json_data = rv.get_json()
    
    assert json_data['test_successful'] is True
    assert 'prediction' in json_data
    assert type(json_data['prediction']) == float
