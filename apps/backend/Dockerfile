FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model files
COPY . .

# Expose port
EXPOSE 5000

# Start Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
