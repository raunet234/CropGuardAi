# CropGuardAI — Complete Deployment Guide

> **This file has EVERYTHING you need to deploy your app so anyone can access it via one link.**
> Follow it step by step even without AI assistance.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Best Strategy: Split Across 3 Free Services](#2-best-strategy-split-across-3-free-services)
3. [STEP 1 — Deploy ML Model API on Render (Python)](#step-1--deploy-ml-model-api-on-render-python)
4. [STEP 2 — Deploy Node.js Backend on Railway](#step-2--deploy-nodejs-backend-on-railway)
5. [STEP 3 — Deploy Frontend on Vercel](#step-3--deploy-frontend-on-vercel)
6. [STEP 4 — Connect Everything Together](#step-4--connect-everything-together)
7. [Code Changes Required (EXACT)](#code-changes-required-exact)
8. [Environment Variables Cheat Sheet](#environment-variables-cheat-sheet)
9. [Troubleshooting](#troubleshooting)
10. [Alternative: Single Service Deployment](#alternative-single-service-deployment)

---

## 1. Architecture Overview

Your app has **3 services** that need to be running:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FRONTEND   │────▶│   BACKEND    │────▶│   ML MODEL   │
│   React/Vite │     │   Express.js │     │  Flask/Keras  │
│   Port 5173  │     │   Port 3001  │     │   Port 5000  │
└──────────────┘     └──────────────┘     └──────────────┘
    Vercel              Railway              Render
   (Static)           (Node.js)            (Python)
```

**User flow:** User opens Vercel link → Frontend calls Railway backend → Backend calls Render ML API for disease detection

---

## 2. Best Strategy: Split Across 3 Free Services

| Service | Platform | Why This Platform | Free Tier Limits |
|---------|----------|-------------------|------------------|
| **Frontend** (React/Vite) | **Vercel** | Built for frontend, global CDN, instant deploys, NO cold starts | Unlimited bandwidth, 100 deploys/day |
| **Backend** (Node.js/Express) | **Railway** | $5 free credit, fast, no cold start spin-down like Render | $5/month free trial, 512MB RAM |
| **ML Model API** (Python/Flask/Keras) | **Render** | Free Python hosting, works well for APIs | 750 hrs/month, 512MB RAM, spins down after 15min idle |

### Why Split Instead of One Service?
- **Load balancing** — Each platform handles only one job
- **Free tier maximization** — You get 3x the free resources
- **No single point of failure** — If one goes down, others keep working
- **Vercel frontend NEVER goes down** — It's static hosting, always fast

### Cold Start Warning ⚠️
Render free tier **sleeps after 15 minutes of no traffic**. First request after sleep takes ~30-50 seconds (model needs to reload). This is normal on free tier. Railway doesn't have this issue as badly.

---

## STEP 1 — Deploy ML Model API on Render (Python)

### 1.1 Create These Files

Your ML model is at `agrismart/model_api.py` and `agrismart/model_v2.h5`. Render needs a few config files.

#### File: `agrismart/requirements.txt`
```
flask==3.1.3
flask-cors==6.0.2
keras==3.10.0
tensorflow==2.20.0
numpy==1.26.4
pillow==11.3.0
gunicorn==23.0.0
```

> **IMPORTANT**: If tensorflow 2.20.0 fails on Render, try `tensorflow-cpu==2.16.1` instead (uses less RAM).
> If that also fails, try `tensorflow-cpu==2.15.0` + `keras==2.15.0`.

#### File: `agrismart/Procfile`
```
web: gunicorn model_api:app --bind 0.0.0.0:$PORT --timeout 120
```

#### File: `agrismart/runtime.txt`
```
python-3.11.9
```

### 1.2 Remove model_v2.h5 from .gitignore

Your `.gitignore` currently blocks `model_v2.h5` and `*.h5`. You MUST remove those lines so the model file gets pushed to GitHub. The model is only 9.2MB which is fine for GitHub (limit is 100MB).

**In `.gitignore`, DELETE these lines:**
```
model_v2.h5
*.h5
model_api.py
agrismart/model_v2.h5
```

Then force-add the model:
```bash
git add -f agrismart/model_v2.h5 agrismart/model_api.py
git add agrismart/requirements.txt agrismart/Procfile agrismart/runtime.txt
git commit -m "Add ML model files for deployment"
git push
```

### 1.3 Deploy on Render

1. Go to **https://render.com** → Sign up (use GitHub login)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `raunet234/CropGuardAi`
4. Configure:
   - **Name:** `cropguard-ml-api`
   - **Region:** Oregon (US West) or Singapore (closest to India)
   - **Branch:** `main`
   - **Root Directory:** `agrismart`  ← IMPORTANT!
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn model_api:app --bind 0.0.0.0:$PORT --timeout 120`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**
6. Wait 5-10 minutes for build to complete
7. You'll get a URL like: `https://cropguard-ml-api.onrender.com`
8. Test it: `https://cropguard-ml-api.onrender.com/health` should return `{"status":"ok"}`

**Save this URL** — you'll need it in Step 2.

---

## STEP 2 — Deploy Node.js Backend on Railway

### 2.1 Update Code for Deployment

#### File: `agrismart/backend/server.js` — Replace with:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from your Vercel frontend + localhost for dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,  // Your Vercel URL (set in Railway env vars)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/market', require('./routes/market'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/community', require('./routes/community'));
app.use('/api/history', require('./routes/history'));
app.use('/api/profile', require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'AgriSmart API' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriSmart backend running on port ${PORT}`));
```

#### File: `agrismart/backend/services/diseaseDetectionService.js` — Change line 247:

**Find this line (line 247):**
```javascript
const response = await axios.post('http://localhost:5000/predict', {
```

**Replace with:**
```javascript
const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:5000';
const response = await axios.post(`${MODEL_API_URL}/predict`, {
```

The full function becomes:
```javascript
async function detectDisease(base64Image) {
  const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:5000';
  const response = await axios.post(`${MODEL_API_URL}/predict`, {
    image: base64Image,
  });
  // ... rest stays the same
```

### 2.2 Deploy on Railway

1. Go to **https://railway.com** → Sign up (use GitHub login)
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your repo: `raunet234/CropGuardAi`
4. Railway will auto-detect Node.js. Configure:
   - Click on the service → **Settings**
   - **Root Directory:** `agrismart/backend`  ← IMPORTANT!
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Go to **Variables** tab → Add these environment variables:

   | Variable | Value |
   |----------|-------|
   | `GROQ_API_KEY` | (copy from `agrismart/backend/.env` — starts with `gsk_`) |
   | `OPENWEATHER_API_KEY` | (copy from `agrismart/backend/.env`) |
   | `FIREBASE_PROJECT_ID` | `agrismart-c4c7e` |
   | `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@agrismart-c4c7e.iam.gserviceaccount.com` |
   | `FIREBASE_PRIVATE_KEY` | (copy full private key from `agrismart/backend/.env`) |
   | `MODEL_API_URL` | `https://cropguard-ml-api.onrender.com` ← URL from Step 1 |
   | `FRONTEND_URL` | (fill in after Vercel deploy in Step 3) |
   | `PORT` | `3001` |

6. Go to **Settings** → **Networking** → **Generate Domain**
7. You'll get a URL like: `https://cropguard-backend-production-xxxx.up.railway.app`
8. Test it: `https://YOUR-RAILWAY-URL/api/health` should return `{"status":"ok"}`

**Save this URL** — you'll need it in Step 3.

---

## STEP 3 — Deploy Frontend on Vercel

### 3.1 Deploy on Vercel

1. Go to **https://vercel.com** → Sign up (use GitHub login)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo: `raunet234/CropGuardAi`
4. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `agrismart/frontend`  ← IMPORTANT! Click "Edit" to set this
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `dist`
5. Go to **Environment Variables** → Add these:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_BASE_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` ← URL from Step 2 |
   | `VITE_FIREBASE_API_KEY` | (copy from `agrismart/frontend/.env`) |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `agrismart-c4c7e.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `agrismart-c4c7e` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `agrismart-c4c7e.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | (copy from `agrismart/frontend/.env`) |
   | `VITE_FIREBASE_APP_ID` | (copy from `agrismart/frontend/.env`) |

6. Click **"Deploy"**
7. You'll get a URL like: `https://cropguard-ai.vercel.app`

### 3.2 Update Firebase Auth Domain

Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains** → Add your Vercel URL (e.g., `cropguard-ai.vercel.app`)

### 3.3 Go Back to Railway — Set FRONTEND_URL

Now go back to Railway dashboard → your backend service → **Variables** → Update:
```
FRONTEND_URL = https://cropguard-ai.vercel.app
```
(Use your actual Vercel URL)

Railway will auto-redeploy.

---

## STEP 4 — Connect Everything Together

### Final Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Model API running on Render → test `/health` endpoint | ⬜ |
| 2 | Backend running on Railway → test `/api/health` endpoint | ⬜ |
| 3 | Frontend running on Vercel → opens in browser | ⬜ |
| 4 | `MODEL_API_URL` set on Railway → points to Render URL | ⬜ |
| 5 | `VITE_API_BASE_URL` set on Vercel → points to Railway URL | ⬜ |
| 6 | `FRONTEND_URL` set on Railway → points to Vercel URL | ⬜ |
| 7 | Firebase Auth → Vercel domain added to authorized domains | ⬜ |
| 8 | Disease detection works end-to-end | ⬜ |

### Test Disease Detection End-to-End

1. Open your Vercel URL in browser
2. Login / Sign up
3. Go to Disease Detection
4. Upload a leaf image
5. Click "Detect Disease"
6. **First request might take 30-50 sec** (Render cold start — this is normal on free tier)
7. After first request, subsequent requests should be fast (2-3 sec)

---

## Code Changes Required (EXACT)

Here's every single code change you need to make, file by file.

### Change 1: `.gitignore` — Remove ML model blocks

**File:** `.gitignore` (project root)

DELETE these lines:
```diff
- # ML model files - large and contain sensitive trained weights
- model_v2.h5
- *.h5
- model_api.py
- agrismart/model_v2.h5
```

Also DELETE this line (so backend folder gets pushed):
```diff
- # Backend folder
- backend/
```

### Change 2: `agrismart/backend/server.js` — Dynamic CORS

Replace the ENTIRE file content with:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from Vercel frontend + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/market', require('./routes/market'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/community', require('./routes/community'));
app.use('/api/history', require('./routes/history'));
app.use('/api/profile', require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'AgriSmart API' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriSmart backend running on port ${PORT}`));
```

### Change 3: `agrismart/backend/services/diseaseDetectionService.js` — Dynamic model URL

Change ONLY lines 246-249. Replace:
```javascript
async function detectDisease(base64Image) {
  const response = await axios.post('http://localhost:5000/predict', {
    image: base64Image,
  });
```

With:
```javascript
async function detectDisease(base64Image) {
  const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:5000';
  const response = await axios.post(`${MODEL_API_URL}/predict`, {
    image: base64Image,
  });
```

### Change 4: Create `agrismart/requirements.txt`

Create this NEW file:
```
flask==3.1.3
flask-cors==6.0.2
keras==3.10.0
tensorflow-cpu==2.16.1
numpy==1.26.4
pillow==11.3.0
gunicorn==23.0.0
h5py==3.12.1
```

> Note: Using `tensorflow-cpu` instead of full `tensorflow` to fit in Render's 512MB RAM limit

### Change 5: Create `agrismart/Procfile`

Create this NEW file (no extension):
```
web: gunicorn model_api:app --bind 0.0.0.0:$PORT --timeout 120
```

### Change 6: Create `agrismart/runtime.txt`

Create this NEW file:
```
python-3.11.9
```

### Git Commands After All Changes
```bash
cd /Users/rauneetraj/Desktop/projects/CropGuardAi

# Stage everything
git add -A
git add -f agrismart/model_v2.h5
git add -f agrismart/model_api.py
git add -f agrismart/backend/.env.example

# Commit and push
git commit -m "Prepare for deployment: Vercel + Railway + Render"
git push
```

---

## Environment Variables Cheat Sheet

### Render (ML Model API) — No env vars needed!
The Flask app doesn't need any env vars. It uses `PORT` which Render sets automatically.

### Railway (Node.js Backend) — 7 variables
| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | (copy from `agrismart/backend/.env` — starts with `gsk_`) |
| `OPENWEATHER_API_KEY` | (copy from `agrismart/backend/.env`) |
| `FIREBASE_PROJECT_ID` | `agrismart-c4c7e` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@agrismart-c4c7e.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | (copy full private key from `agrismart/backend/.env`) |
| `MODEL_API_URL` | `https://cropguard-ml-api.onrender.com` (your Render URL) |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` (your Vercel URL) |

### Vercel (Frontend) — 7 variables
| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` (your Railway URL) |
| `VITE_FIREBASE_API_KEY` | (copy from `agrismart/frontend/.env`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `agrismart-c4c7e.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `agrismart-c4c7e` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `agrismart-c4c7e.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (copy from `agrismart/frontend/.env`) |
| `VITE_FIREBASE_APP_ID` | (copy from `agrismart/frontend/.env`) |

---

## Troubleshooting

### Problem: "Detection failed" error on deployed app
**Cause:** Render ML API is sleeping (cold start)
**Fix:** Wait 30-50 seconds and try again. First request wakes up the server.

### Problem: Render build fails — "Out of memory"
**Cause:** Full TensorFlow is too big for 512MB free tier
**Fix:** Use `tensorflow-cpu==2.16.1` in requirements.txt (already done above). If still fails, try:
```
tensorflow-cpu==2.15.0
keras==2.15.0
```

### Problem: CORS error on Vercel
**Cause:** Railway backend doesn't have your Vercel URL in CORS list
**Fix:** Make sure `FRONTEND_URL` env var on Railway matches your exact Vercel URL (no trailing slash)

### Problem: Firebase Auth not working on Vercel
**Cause:** Vercel domain not added to Firebase authorized domains
**Fix:** Firebase Console → Authentication → Settings → Authorized domains → Add `YOUR-APP.vercel.app`

### Problem: Login redirect fails on Vercel
**Cause:** Google Auth redirect URI not updated
**Fix:** Firebase Console → Authentication → Sign-in method → Google → Add Vercel domain to authorized redirect URIs

### Problem: Railway says "build failed"
**Cause:** Root directory not set correctly  
**Fix:** Railway Settings → Set Root Directory to `agrismart/backend`

### Problem: API calls return 404 on Railway
**Cause:** Railway assigned a random port, but your app might be trying port 3001
**Fix:** Railway automatically sets `PORT` env var. Your server.js already uses `process.env.PORT || 3001`, so this should work automatically. If not, check there's no hardcoded port.

---

## Alternative: Single Service Deployment (Simpler but Limited)

If you want everything on ONE platform, the best option is **Railway** (because it supports both Node.js and Python):

### Option: Merge Flask into Node.js Backend (Render Not Needed)

You could embed the Python model API call directly in the Node.js backend using `child_process`, but this is complex and unreliable.

### Option: Railway Monorepo (2 services, 1 project)

Deploy both backend + model API on Railway in the same project:
1. Create 1 Railway project
2. Add 2 services from the same repo:
   - Service 1: Root = `agrismart/backend`, Start = `npm start`
   - Service 2: Root = `agrismart`, Start = `gunicorn model_api:app`
3. Railway's internal networking lets them talk to each other
4. Frontend still goes on Vercel (free, always-on)

This uses more of your $5 Railway credit but eliminates Render cold starts.

---

## Quick Command Reference

### Local Development (3 terminals)
```bash
# Terminal 1: ML Model API
cd agrismart && python3 model_api.py

# Terminal 2: Node.js Backend
cd agrismart/backend && npm run dev

# Terminal 3: Frontend
cd agrismart/frontend && npm run dev
```

### Deploy Commands
```bash
# After making code changes, push to trigger auto-deploy on all 3 platforms
git add -A
git add -f agrismart/model_v2.h5 agrismart/model_api.py
git commit -m "Update for deployment"
git push
```

All three platforms (Vercel, Railway, Render) auto-deploy when you push to `main`.

---

## Summary: The 3 URLs You'll Share

After deployment, you'll have:

| Service | URL | Share This? |
|---------|-----|-------------|
| **Frontend** | `https://YOUR-APP.vercel.app` | ✅ YES — share this link! |
| **Backend** | `https://YOUR-APP.up.railway.app` | ❌ No (API only) |
| **ML API** | `https://cropguard-ml-api.onrender.com` | ❌ No (internal only) |

**The ONE link you share with everyone is your Vercel URL.** Everything else is internal.
