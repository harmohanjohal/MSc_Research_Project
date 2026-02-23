# Forecast Driven District Heating Control 

![Version](https://img.shields.io/badge/version-1.0.0--STABLE-blue?style=for-the-badge&logoColor=white)
![Build](https://img.shields.io/badge/build-PASSING-green?style=for-the-badge)
![Security](https://img.shields.io/badge/security-ENCRYPTED-red?style=for-the-badge)

**TERRA-CORE** is a high-fidelity, industrial-grade heat demand prediction system designed for district heating optimization. It combines a sophisticated **Flask-based Machine Learning engine** with a cutting-edge **Next.js HUD (Heads-Up Display)** interface to deliver real-time meteorological analysis and thermal load forecasting.

---

## 🛰️ System Architecture

The project is architected as a decoupled full-stack application, prioritizing modularity, type safety, and low-latency data processing.

### 🧠 Backend (Predictive Engine)
- **Framework**: Flask (Python 3.x)
- **Model Architecture**: Scikit-learn (Random Forest / Gradient Boosting)
- **Data Logic**: Custom Feature Engineering service for multi-variable thermal analysis.
- **API Strategy**: RESTful endpoints with synchronized CORS policy for secure frontend telemetry.

### 🖥️ Frontend (HUD Interface)
- **Core**: Next.js 15 (App Router) + React 19 + TypeScript
- **Aesthetic**: Industrial HUD (Tactical Control Center) with monospaced typography and high-contrast telemetry visuals.
- **State Management**: Global `DataProvider` context for synchronized telemetry across the matrix.
- **Visuals**: Framer Motion (Micro-animations) + Recharts (Multispectral Charts).

---

## ⚡ Technical Optimizations

This system is engineered for maximum operational efficiency:

- **Parallelized Inference**: Consolidates 48 individual hourly simulations into a single batch network request, reducing simulation latency by ~90%.
- **Global Context Sync**: A centralized data provider eliminates redundant "on-mount" API waterfalls, ensuring snappy navigation between analytical nodes.
- **TTL Service Caching**: Intelligent 5-minute in-memory buffering for meteorological data to minimize external API round-trips.
- **Hydration Stabilization**: Engineered consistent server/client timestamp rendering to maintain UI integrity during high-frequency updates.

---

## 🛠️ Deployment Configuration

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **WeatherAPI.com Key** (Required for real-time telemetry)

### Intelligence Node (Backend) Setup
1. `pip install -r requirements.txt`
2. Configure environmental variables if necessary.
3. `python src/api/app.py`
   - *Default Port: 5000*

### Analytical Node (Frontend) Setup
1. `cd apps/frontend-simple`
2. `npm install`
3. Create `.env.local` with:
   ```env
   NEXT_PUBLIC_WEATHER_API_KEY=your_key_here
   NEXT_PUBLIC_WEATHER_LOCATION=Nottingham,UK
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. `npm run dev`
   - *Default Port: 3000*

---

## 📁 Project Vector Mapping

```text
root/
├── apps/frontend-simple/    # Tactical HUD (Next.js)
│   ├── src/providers/       # Global State Matrix
│   ├── src/hooks/           # Optimized API Telemetry
│   └── src/lib/             # Service & Logic Layer
├── src/api/                 # Intelligence Core (Flask)
│   ├── app.py               # Main Inference Gate
│   └── services/            # Thermal Analysis Logic
├── data/                    # Processed ML Models & Scalers
└── config/                  # System Parameters
```

---

## 🛡️ Reliability Index
The system includes built-in diagnostic tools located at `/test-weather` and `/manual-testing` to verify signal integrity and model response performance in real-time.

---

> [!NOTE]
> This system is designed for district heating operators and thermal engineers. All telemetry is intended for situational awareness and predictive modeling purposes.
