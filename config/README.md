Configuration Directory

This directory contains configuration files for the Heat Optimization Project.

Directory Structure

config.ini - Main configuration file containing project-wide settings

Configuration Sections

API Configuration
host = 127.0.0.1 - API server host address
port = 5000 - API server port number
debug = true - Enable debug mode for development

Machine Learning Configuration
model_path = data/processed/models/ - Path to machine learning model files
random_seed = 42 - Random seed for reproducible results

Database Configuration
host = localhost - Database server host
port = 5432 - Database server port (PostgreSQL default)
database = heat_optimization - Database name

Usage

The configuration file is used by:
- API server for web service settings
- Machine learning components for model loading
- Database connections for data storage
- Application startup and initialization

File Format

INI format - Simple key-value configuration format
Easy to read and modify
Supports sections for different components
Standard configuration format for Python applications

Environment Variables

For production deployment, consider using environment variables:
- API_HOST, API_PORT for server settings
- DB_HOST, DB_PORT, DB_NAME for database settings
- MODEL_PATH for model file locations

Security Notes

- Debug mode should be disabled in production
- Database credentials should be stored securely
- API keys and secrets should use environment variables
