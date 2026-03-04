FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by LightGBM/CatBoost
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model files
COPY . .

# Expose port
EXPOSE 5000

# Start Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
