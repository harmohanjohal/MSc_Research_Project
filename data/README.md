# Data Directory

This directory contains all data files used in the Heat Optimization Project.

## Directory Structure

### `processed/`
Contains processed and cleaned datasets ready for machine learning models.

#### `features/`
- **`X_bungalow.parquet`** - Feature dataset for bungalow building type (753KB)
- **`y_bungalow.parquet`** - Target variable dataset for bungalow building type (79KB)

#### `raw/`
- **`bungalow_raw.feather`** - Raw processed data in feather format (76KB)

### `raw/`
Contains raw data files and building models.

#### `buildings/`
Building model files in gbXML format for different house types:
- **`bungalow.gbxml`** - Bungalow building model
- **`detached.gbxml`** - Detached house building model
- **`end_terrace.gbxml`** - End terrace house building model
- **`mid_terrace.gbxml`** - Mid terrace house building model
- **`semi_detached.gbxml`** - Semi-detached house building model

### `external/`
Reserved for external data sources and third-party datasets.

## Data Formats

- **Parquet**: Efficient columnar storage format for processed features and targets
- **Feather**: Fast binary format for raw processed data
- **gbXML**: Green Building XML format for building energy models

## Usage

The processed data files are used by the machine learning models in `src/ml/` for training and prediction. The building models are used for energy simulation and analysis.

## File Sizes

- Total processed data: ~908KB
- Total building models: ~192KB
- Total data directory: ~1.1MB
