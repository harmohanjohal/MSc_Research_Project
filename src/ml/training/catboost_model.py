"""
Production CatBoost Model Training
Updated for new directory structure
"""
import pandas as pd
import numpy as np
import warnings
import pickle
import json
import os
from datetime import datetime
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from catboost import CatBoostRegressor
import logging

warnings.filterwarnings('ignore')

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production_model.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProductionCatBoostModel:
    """
    Production-ready CatBoost model for heat demand prediction
    """
    
    def __init__(self, model_path='production_catboost_model.pkl', config_path='model_config.json'):
        self.model_path = model_path
        self.config_path = config_path
        self.model = None
        self.feature_names = None
        self.scaler = None
        self.training_date = None
        
        # Best hyperparameters from tuning
        self.best_params = {
            'iterations': 200,
            'depth': 8,
            'learning_rate': 0.05,
            'l2_leaf_reg': 1,
            'border_count': 128,
            'verbose': False,
            'random_state': 42
        }
    
    def calculate_metrics(self, y_true, y_pred):
        """Calculate comprehensive metrics"""
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        mape = np.mean(np.abs((y_true - y_pred) / np.where(y_true != 0, y_true, 1))) * 100
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        return {'MAE': mae, 'R2': r2, 'MAPE': mape, 'RMSE': rmse}
    
    def load_and_prepare_data(self, data_path=None):
        """Load and prepare data for training"""
        logger.info("Loading training data...")
        
        # Updated path for new structure
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            data_path = os.path.join(base_dir, 'data', 'raw', 'simulations', 'extended_winter_dataset_clean.csv')
        
        try:
            df = pd.read_csv(data_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            logger.info(f"Data loaded: {len(df):,} rows, {len(df.columns)} columns")
            
            # Sort by timestamp for time-series split
            df = df.sort_values(['timestamp'])
            
            # Calculate split points (70/15/15)
            total_rows = len(df)
            train_end = int(total_rows * 0.7)
            val_end = int(total_rows * 0.85)
            
            # Create splits
            train_data = df.iloc[:train_end].copy()
            val_data = df.iloc[train_end:val_end].copy()
            test_data = df.iloc[val_end:].copy()
            
            # Prepare features
            def prepare_features(df):
                df_ml = df.copy()
                exclude_cols = ['timestamp']
                df_ml = df_ml.drop(columns=[col for col in exclude_cols if col in df_ml.columns], errors='ignore')
                
                for col in df_ml.columns:
                    if df_ml[col].dtype == 'object' or df_ml[col].dtype == 'bool':
                        df_ml[col] = pd.to_numeric(df_ml[col], errors='coerce')
                
                df_ml = df_ml.fillna(0)
                return df_ml
            
            train_features = prepare_features(train_data)
            val_features = prepare_features(val_data)
            test_features = prepare_features(test_data)
            
            # Prepare target variables
            y_train = train_features['heat_demand_kW']
            y_val = val_features['heat_demand_kW']
            y_test = test_features['heat_demand_kW']
            
            # Remove target from features
            X_train = train_features.drop('heat_demand_kW', axis=1)
            X_val = val_features.drop('heat_demand_kW', axis=1)
            X_test = test_features.drop('heat_demand_kW', axis=1)
            
            # Store feature names
            self.feature_names = list(X_train.columns)
            
            logger.info(f"Training set: {X_train.shape}")
            logger.info(f"Validation set: {X_val.shape}")
            logger.info(f"Test set: {X_test.shape}")
            logger.info(f"Features: {len(self.feature_names)}")
            
            return X_train, y_train, X_val, y_val, X_test, y_test
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def train_model(self, X_train, y_train, X_val, y_val):
        """Train the CatBoost model"""
        logger.info("Training CatBoost model...")
        
        try:
            # Initialize model with best parameters
            self.model = CatBoostRegressor(**self.best_params)
            
            # Train model
            self.model.fit(
                X_train, y_train,
                eval_set=(X_val, y_val),
                early_stopping_rounds=50,
                verbose=False
            )
            
            # Store training date
            self.training_date = datetime.now().isoformat()
            
            logger.info("Model training completed successfully!")
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise
    
    def evaluate_model(self, X_train, y_train, X_val, y_val, X_test, y_test):
        """Evaluate model performance"""
        logger.info("Evaluating model performance...")
        
        try:
            # Make predictions
            y_train_pred = self.model.predict(X_train)
            y_val_pred = self.model.predict(X_val)
            y_test_pred = self.model.predict(X_test)
            
            # Calculate metrics
            train_metrics = self.calculate_metrics(y_train, y_train_pred)
            val_metrics = self.calculate_metrics(y_val, y_val_pred)
            test_metrics = self.calculate_metrics(y_test, y_test_pred)
            
            metrics = {
                'train': train_metrics,
                'validation': val_metrics,
                'test': test_metrics
            }
            
            # Log results
            logger.info("Training Metrics:")
            logger.info(f"  R²: {train_metrics['R2']:.3f}")
            logger.info(f"  MAE: {train_metrics['MAE']:.3f}")
            logger.info(f"  RMSE: {train_metrics['RMSE']:.3f}")
            logger.info(f"  MAPE: {train_metrics['MAPE']:.2f}%")
            
            logger.info("Validation Metrics:")
            logger.info(f"  R²: {val_metrics['R2']:.3f}")
            logger.info(f"  MAE: {val_metrics['MAE']:.3f}")
            logger.info(f"  RMSE: {val_metrics['RMSE']:.3f}")
            logger.info(f"  MAPE: {val_metrics['MAPE']:.2f}%")
            
            logger.info("Test Metrics:")
            logger.info(f"  R²: {test_metrics['R2']:.3f}")
            logger.info(f"  MAE: {test_metrics['MAE']:.3f}")
            logger.info(f"  RMSE: {test_metrics['RMSE']:.3f}")
            logger.info(f"  MAPE: {test_metrics['MAPE']:.2f}%")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            raise
    
    def save_model(self):
        """Save the trained model and configuration"""
        logger.info("Saving model and configuration...")
        
        try:
            # Create output directory
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            output_dir = os.path.join(base_dir, 'data', 'processed', 'models')
            os.makedirs(output_dir, exist_ok=True)
            
            # Save model
            model_path = os.path.join(output_dir, 'best_heating_model.pkl')
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            # Save configuration
            config = {
                'model_type': 'CatBoost',
                'feature_names': self.feature_names,
                'training_date': self.training_date,
                'hyperparameters': self.best_params,
                'model_path': model_path
            }
            
            config_path = os.path.join(output_dir, 'model_config.json')
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info(f"Model saved to: {model_path}")
            logger.info(f"Configuration saved to: {config_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise
    
    def load_model(self):
        """Load a saved model"""
        logger.info("Loading saved model...")
        
        try:
            # Load model
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load configuration
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            
            self.feature_names = config['feature_names']
            self.training_date = config['training_date']
            
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def predict(self, input_data):
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Ensure input_data has the same features as training data
            if isinstance(input_data, pd.DataFrame):
                # Check if all required features are present
                missing_features = set(self.feature_names) - set(input_data.columns)
                if missing_features:
                    raise ValueError(f"Missing features: {missing_features}")
                
                # Select only the features used in training
                input_data = input_data[self.feature_names]
                
                # Handle missing values
                input_data = input_data.fillna(0)
                
                # Convert to numeric
                for col in input_data.columns:
                    if input_data[col].dtype == 'object' or input_data[col].dtype == 'bool':
                        input_data[col] = pd.to_numeric(input_data[col], errors='coerce')
                
                input_data = input_data.fillna(0)
            
            # Make prediction
            prediction = self.model.predict(input_data)
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            raise
    
    def get_feature_importance(self, top_n=10):
        """Get feature importance from the trained model"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return feature_importance.head(top_n)

def main():
    """Main function to train and save production model"""
    logger.info("Starting production model training...")
    
    try:
        # Initialize model
        production_model = ProductionCatBoostModel()
        
        # Load and prepare data
        X_train, y_train, X_val, y_val, X_test, y_test = production_model.load_and_prepare_data()
        
        # Train model
        production_model.train_model(X_train, y_train, X_val, y_val)
        
        # Evaluate model
        metrics = production_model.evaluate_model(X_train, y_train, X_val, y_val, X_test, y_test)
        
        # Save model
        production_model.save_model()
        
        # Get feature importance
        feature_importance = production_model.get_feature_importance()
        logger.info("Top 10 Feature Importance:")
        logger.info(feature_importance.head(10).to_string(index=False))
        
        logger.info("Production model training completed successfully!")
        
        return production_model, metrics
        
    except Exception as e:
        logger.error(f"Error in main training process: {e}")
        raise

if __name__ == "__main__":
    main()





