# AgriSmart — AI-Powered Smart Farming Platform

A full-stack web application for Indian farmers with AI crop recommendations, disease detection, weather advisories, live market prices, and government scheme information.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + React Router v6
- **Backend**: Node.js + Express
- **Database & Auth**: Firebase (Firestore + Auth + Storage)
- **AI**: Groq API (llama-3.3-70b-versatile) — free tier
- **Weather**: OpenWeatherMap API
- **Market Prices**: data.gov.in Agmarknet API

---

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage**
5. Go to Project Settings → Service Accounts → Generate new private key (for backend)
6. Go to Project Settings → General → Web app → Copy config (for frontend)

### 2. Get API Keys
- **Groq API** (free): [console.groq.com](https://console.groq.com) → Create API Key
- **OpenWeatherMap** (free): [openweathermap.org/api](https://openweathermap.org/api) → Get API Key

### 3. Backend Setup
```bash
cd agrismart/backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### 4. Frontend Setup
```bash
cd agrismart/frontend
cp .env.example .env
# Fill in your Firebase config in .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

### backend/.env
```
GROQ_API_KEY=gsk_...
OPENWEATHER_API_KEY=...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
PORT=3001
```

### frontend/.env
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_API_BASE_URL=http://localhost:3001
```

---

## Disease Detection (Stub)

The disease detection feature currently returns a placeholder response. To integrate your MobileNetV3 model:

1. Open `backend/services/diseaseDetectionService.js`
2. Replace the `detectDisease` function with your model inference code
3. Input: base64 image string
4. Output: `{ disease, crop, confidence, symptoms, treatment[], pesticides[], prevention[] }`

---

## Features
- 🔐 Firebase Auth (Email + Google)
- 🌾 AI Crop Recommendations (Groq)
- 🔬 Plant Disease Detection (stub — MobileNetV3 ready)
- 💬 AI Chat Assistant (13 Indian languages)
- 🌤 Weather Advisory (OpenWeatherMap)
- 📊 Live Market Prices (Agmarknet / data.gov.in)
- 📋 Expert Agricultural Guidelines (ICAR knowledge)
- 🏛 Government Schemes (PM-KISAN, PMFBY, etc.)
- 👥 Community Forum
- 🕐 Activity History
- 👤 User Profile with farm details
