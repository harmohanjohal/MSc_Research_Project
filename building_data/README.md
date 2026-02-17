Building Data Directory

This directory contains building energy models and related data for the Heat Optimization Project.

Directory Structure

models
Contains EnergyPlus building model files (.idf) and simulation outputs for different house types:

bungalow
bungalow_basic.idf - Bungalow building model with district heating system
bungalow_basic.csv - EnergyPlus simulation results (534KB)
bungalow_basic.eso - EnergyPlus output data (961KB)
bungalow_basic.sql - EnergyPlus SQL database output (1.6MB)
bungalow_basicTable.csv - EnergyPlus tabular results (86KB)
Additional EnergyPlus output files: .audit, .bnd, .err, .mtd, .dbg, .eio, .mdd, .rdd, .shd, .svg, .rvaudit

detached
detached_basic.idf - Detached house building model
detached_basic.csv - EnergyPlus simulation results (518KB)
detached_basic.eso - EnergyPlus output data (964KB)
detached_basic.sql - EnergyPlus SQL database output (1.6MB)
detached_basicTable.csv - EnergyPlus tabular results (89KB)
Additional EnergyPlus output files: .audit, .bnd, .err, .mtd, .dbg, .eio, .mdd, .rdd, .shd, .svg, .rvaudit

semi_detached
semi_detached_basic.idf - Semi-detached house building model
semi_detached_basic.csv - EnergyPlus simulation results (826KB)
semi_detached_basic.eso - EnergyPlus output data (1.3MB)
semi_detached_basic.sql - EnergyPlus SQL database output (1.9MB)
semi_detached_basicTable.csv - EnergyPlus tabular results (85KB)
Additional EnergyPlus output files: .audit, .bnd, .err, .mtd, .dbg, .eio, .mdd, .rdd, .shd, .svg, .rvaudit

mid_terrace
mid_terrace_district_heating.idf - Mid terrace house building model with district heating
mid_terrace_district_heating.csv - EnergyPlus simulation results (689KB)
mid_terrace_district_heating.eso - EnergyPlus output data (1.1MB)
mid_terrace_district_heating.sql - EnergyPlus SQL database output (1.7MB)
mid_terrace_district_heatingTable.csv - EnergyPlus tabular results (86KB)
Additional EnergyPlus output files: .audit, .bnd, .err, .mtd, .dbg, .eio, .mdd, .rdd, .shd, .svg, .rvaudit

end_terrace
end_terrace_district_heating.idf - End terrace house building model with district heating
end_terrace_district_heating.csv - EnergyPlus simulation results (827KB)
end_terrace_district_heating.eso - EnergyPlus output data (1.2MB)
end_terrace_district_heating.sql - EnergyPlus SQL database output (1.8MB)
end_terrace_district_heatingTable.csv - EnergyPlus tabular results (87KB)
Additional EnergyPlus output files: .audit, .bnd, .err, .mtd, .dbg, .eio, .mdd, .rdd, .shd, .svg, .rvaudit

weather
Contains weather data files for energy simulations:
nottingham_2009-2023.epw - Weather data for Nottingham, UK (2009-2023)

processed
Contains processed simulation data and training datasets:
bungalow_with_weather.csv - Merged bungalow simulation data with weather information (928KB)
bungalow_basic_district_heating.csv - Bungalow simulation results (534KB)
heat_demand_processed.csv - Processed heat demand data (497KB)
heating_ml_features.csv - Machine learning features dataset (868KB)
heating_processed_data.csv - Processed heating data (781KB)
X_train_processed.csv - Training features dataset (536KB)
y_train.csv - Training target dataset (54KB)

outputs
Reserved for simulation output files (EnergyPlus results, logs, etc.)

Building Types

The project includes five standard UK house types:

1. Bungalow - Single-story detached house
2. Detached - Two-story detached house
3. Semi-detached - Two-story house sharing one wall
4. Mid Terrace - Two-story house sharing two walls
5. End Terrace - Two-story house sharing one wall

File Formats

IDF - EnergyPlus Input Data File format for building energy models
EPW - EnergyPlus Weather file format
CSV - Processed simulation results and merged data
ESO - EnergyPlus output data files
SQL - EnergyPlus SQL database output files

Usage

These building models are used for:
Energy consumption simulations
Heat demand calculations
District heating system analysis
Machine learning model training data generation

Model Specifications

All building models are based on UK housing standards and include:
Realistic geometry and construction materials
District heating system integration
Weather-responsive simulations
Energy performance calculations

Simulation Outputs

Each building model directory contains comprehensive EnergyPlus simulation outputs including:
Energy consumption data (.eso files)
Tabular results (.csv files)
SQL database outputs (.sql files)
Audit and error logs (.audit, .err files)
Boundary condition data (.bnd files)
Material and construction data (.mtd files)
Debug information (.dbg files)
Input/output summaries (.eio files)
Report data dictionaries (.rdd files)
Shading data (.shd files)
Visualization files (.svg files)

File Sizes

Total building models: ~150KB
Weather data: ~1.5MB
Simulation outputs: ~15MB
Processed data: ~4.2MB
Total directory: ~21MB
