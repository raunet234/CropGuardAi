# AgriSmart - Full Stack AI Farming Platform

## OVERVIEW
Build a complete full-stack web application called "AgriSmart" — an AI-powered smart farming platform for Indian farmers. Match the UI from the screenshots exactly.

---

## TECH STACK
- Frontend: React + Vite + TailwindCSS + React Router
- Backend: Node.js + Express
- Database & Auth: Firebase (use Firebase MCP already configured in environment)
- AI (Text/Chat): Groq API with llama-3.3-70b-versatile model (free tier)
- AI (Disease Detection): Placeholder stub only — MobileNetV3 custom trained model will be integrated later by developer
- Weather: OpenWeatherMap API (free tier)
- Market Prices: data.gov.in Agmarknet API (no key needed)
- File Upload: Firebase Storage (for plant disease images)

---

## IMPORTANT NOTES BEFORE STARTING
- Use Firebase MCP for all database and auth operations — it is already configured
- Use Groq API (free) for all text AI features — model: llama-3.3-70b-versatile
- Disease detection through image must be a clean placeholder stub with a clearly marked TODO comment so developer can drop in MobileNetV3 model later
- Do NOT use Anthropic/Claude API anywhere in the code
- Do NOT use any paid APIs

---

## PROJECT STRUCTURE
agrismart/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── backend/
│   ├── routes/
│   ├── services/
│   │   ├── groqService.js
│   │   └── diseaseDetectionService.js   ← MobileNetV3 stub goes here
│   ├── .env
│   └── package.json
├── PROMPT.md
└── README.md

---

## COLOR SCHEME & DESIGN
- Primary green: #2D6A2D
- Light green: #4CAF50
- Background: #F0F7F0
- Card background: white
- Sidebar background: #1a3d1a (dark green)
- Font: Inter
- Rounded corners: rounded-2xl on all cards
- Subtle box shadows on cards
- Clean, modern, professional look

---

## ENVIRONMENT VARIABLES

### backend/.env
GROQ_API_KEY=your_groq_free_api_key
OPENWEATHER_API_KEY=your_openweather_free_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

### frontend/.env

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3001

---

## FIREBASE COLLECTIONS
users/{userId}

fullName, phone, language, role, state, district, city
farmSize, farmSizeUnit, soilType, irrigationType, createdAt

activityHistory/{docId}

userId, type (chat/crop/disease/weather/market)
title, cropName, data (object), createdAt

communityPosts/{postId}

userId, userName, userRole, content, tags, createdAt

communityReplies/{replyId}

postId, userId, userName, content, createdAt

---

## BACKEND API ENDPOINTS
POST   /api/auth/profile
GET    /api/weather?city=Ludhiana
GET    /api/market?state=Punjab&crop=wheat
POST   /api/ai/chat
POST   /api/ai/crop-recommend
POST   /api/ai/disease              ← stub only, returns mock response
POST   /api/ai/guideline
POST   /api/ai/scheme-detail
GET    /api/community/posts
POST   /api/community/posts
POST   /api/community/reply
GET    /api/history/:userId
POST   /api/history
DELETE /api/history/:userId
GET    /api/profile/:userId
PUT    /api/profile/:userId

---

## DISEASE DETECTION STUB — CRITICAL

In `backend/services/diseaseDetectionService.js` create this exact structure:
```javascript
// TODO: Replace this entire function with MobileNetV3 custom trained model
// Developer will integrate their own trained model here later
// Model type: MobileNetV3 (TensorFlow.js or Python Flask microservice)
// Input: base64 image string
// Output: { disease, crop, confidence, symptoms, treatment, pesticides, prevention }

async function detectDisease(base64Image) {
  // STUB — returns mock response until real model is integrated
  return {
    disease: "Model Not Integrated Yet",
    crop: "Unknown",
    confidence: 0,
    symptoms: "MobileNetV3 model will be integrated here by the developer.",
    treatment: [],
    pesticides: [],
    prevention: [],
    isStub: true
  };
}

module.exports = { detectDisease };
```

The disease detection frontend page must still be fully built with:
- Image upload zone (drag and drop)
- Preview of uploaded image
- Detect Disease button
- Full results display panel (disease name, confidence gauge, treatment plan, pesticides, prevention)
- When stub is active, show a yellow banner: "AI model integration pending — results are placeholder only"

---

## GROQ AI INTEGRATION

Install: `npm install groq-sdk`
```javascript
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use this for all AI features
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 1024,
});
```

---

## PAGES TO BUILD

### 1. Landing Page — route: /
- Navbar: AgriSmart logo left, Login + Sign Up buttons right
- Hero left: heading "Grow Smarter with AI Farming", subtitle about crop recommendations, disease detection, weather, market prices in your language, two buttons "Start for Free" and "Sign In"
- Hero right: large rounded farm/wheat field image
- Light mint gradient background

### 2. Login Page — route: /login
- Split layout: left = farm photo, right = login form
- Fields: Email Address, Password
- Forgot Password link
- Sign In button (green)
- Admin Login button (darker green)
- OR divider
- Continue with Google button
- Link: Don't have an account? Sign Up
- Auth via Firebase

### 3. Signup Page — route: /signup
- Split layout same as login
- Fields: Full Name, Email, Password, Role (Farmer / Expert / Admin)
- Auth via Firebase

### 4. Dashboard — route: /dashboard
- Left sidebar: AgriSmart logo, navigation links (Dashboard, AI Assistant, Crop Recommend, Disease Detection, Expert Guidelines, Weather, Market Prices, Govt Policies, Community), Account section (History, My Profile), user name + role + Sign Out at bottom
- Top bar: search bar center, notification bell with badge, user avatar
- Green welcome banner: "Good [morning/afternoon/evening], [name], your farm is ready." with today's date, location pill, season pill, stat counters (Queries, Scans, Markets)
- Four feature cards: Crop Recommendation, Disease Detection, AI Assistant, Market Prices — each with icon, title, subtitle, Open arrow link
- Activity Summary section: Live badge, Chat Queries count, Crop AI count, Disease Scans count
- Weather widget right side

### 5. AI Assistant — route: /assistant
- Header: Hi [name]! subtitle
- Language selector top right: English, Hindi, Punjabi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Odia, Urdu, Assamese
- Center logo + AgriSmart AI Assistant title + subtitle
- Six quick prompt buttons in 2x3 grid: "What crop should I grow?", "Tell me about PM-KISAN", "My plant has yellow spots", "Best fertilizer for wheat", "Government loan schemes", "Organic farming tips"
- Dark bottom chat input bar with Ask anything placeholder, mic icon, attach icon, send button
- Full chat interface with message history
- Groq system prompt: "You are AgriSmart AI, an expert agricultural assistant for Indian farmers. Answer questions about crops, diseases, weather, government schemes, fertilizers, irrigation, and farming practices. Always respond in the language the user writes in. Be practical, specific, and farmer-friendly."

### 6. Crop Recommendation — route: /crop-recommend
- Header with subtitle
- Location auto-detect banner
- Left panel Soil and Climate Parameters card:
  - Quick crop preset buttons: Rice, Wheat, Cotton, Maize, Banana, Groundnut
  - Region preset buttons: Punjab, Haryana, Maharashtra, Bihar
  - Input sliders and fields: Nitrogen 0-200 kg/ha, Phosphorus 0-200 kg/ha, Potassium 0-200 kg/ha, Temperature celsius, Humidity percent, pH 0-14, Rainfall mm
  - Get Recommendation green button
- Right panel: seedling placeholder until results load, then shows top 3 crop cards
- Groq prompt: "Based on these soil and climate parameters for an Indian farm: Nitrogen={N}kg/ha, Phosphorus={P}kg/ha, Potassium={K}kg/ha, Temperature={temp}C, Humidity={humidity}%, pH={ph}, Rainfall={rainfall}mm — recommend the top 3 best crops. For each crop provide: cropName, suitabilityScore (0-100), reasons array, expectedYield, bestSeason, cultivationTips array of 3. Return only valid JSON."

### 7. Disease Detection — route: /disease-detection
- Header: Plant Disease Detection with AI Vision Analysis badge
- Large dashed upload zone: leaf icon, Drop image here or click to browse, JPEG PNG WEBP max 10MB
- Image preview after upload
- Detect Disease green button (disabled until image uploaded)
- Tips section: take clear close-up photo, use natural daylight, include symptomatic and healthy areas, use plain background
- Results panel right side: disease name, confidence circular gauge (SVG, red above 70, orange 40-70, green below 40), crop identified, symptom description, treatment plan numbered steps, recommended pesticides chips, prevention practices checklist
- Yellow banner when stub is active: "AI model integration pending — connect your MobileNetV3 model in backend/services/diseaseDetectionService.js"
- Save result to Firebase activityHistory on detection

### 8. Expert Guidelines — route: /expert-guidelines
- Header: Expert Agricultural Guidelines, subtitle about ICAR FAO State Universities
- Search bar
- Banner: 7 Expert Knowledge Modules Available, filter pills: Disease, IPM, Soil, Water, PostHarvest, Organic
- Cards grid 4 columns:
  - Plant Disease Management Protocols — CRITICAL badge red — Disease Control category — 4 Topics 4 Tips
  - Integrated Pest Management IPM — HIGH badge orange — Pest Control — 4 Topics 4 Tips
  - Soil Health and Fertility Management — HIGH badge — Soil Management — 4 Topics 4 Tips
  - Irrigation and Water Management — HIGH badge blue — Water Management — 3 Topics 4 Tips
  - Post-Harvest Handling and Storage — MEDIUM badge — Post-Harvest — 3 Topics 4 Tips
  - Organic Farming and Natural Methods — MEDIUM badge — Organic Farming — 3 Topics 4 Tips
  - Seed Selection and Variety Advice — MEDIUM badge — Seed Management — 3 Topics 4 Tips
- Clicking card opens full content generated by Groq on demand
- Knowledge Base Sources footer: ICAR, FAO, State Agricultural Universities, NHM, PMKSY

### 9. Weather — route: /weather
- Header: Farmer Weather Advisory
- Location search input, Get Weather green button, My Location button
- Quick city pills: Delhi, Ludhiana, Chandigarh, Jaipur, Lucknow, Mumbai, Bengaluru, Hyderabad, Patna, Pune
- Dark weather card: location, large temperature, condition, feels like, low/high, stats row with Humidity Wind Pressure Clouds UV Index Rain
- Field Activity score circle 0-100 with Good/Moderate/Poor, Irrigation advice, Spray advice
- Tabs: Weekly Dashboard, Overview, Advisory, 7-Day Forecast, Hourly
- Advisory tab uses Groq to generate farming-specific advice based on current weather data
- Uses OpenWeatherMap API for real data

### 10. Market Prices — route: /market-prices
- Header: Market Prices with Live green badge
- Mandis in Live Data section with state and mandi name pills
- Search crop input, State dropdown, Refresh button, Reset button
- Source label: Live — Agmarknet / data.gov.in with date
- Info bar: Showing N live mandi records from State, Prices in rupees per quintal
- Crop list rows: crop icon, crop name, mandi name, colored min-max price bar, price in rupees per quintal, Tap for details
- Clicking row opens right panel Market Analysis: crop name, MSP Govt price, Modal Price live rate, Price Change percent, High/Low, Mandis in Dataset chips, Price Trend
- Uses data.gov.in Agmarknet API free

### 11. Govt Policies — route: /govt-policies
- Header: Government Policies and Schemes, subtitle Updated 2025-26
- Search bar
- Filter pills: All Schemes, Credit and Finance, Crop Insurance, Food Security, Income Support, Infrastructure, Market Access, Organic Farming, Pension, Soil Health, Solar Energy
- Cards grid 3 columns with colored left borders:
  - PM-KISAN — Income Support — Active
  - PMFBY — Crop Insurance — Active
  - PM-KUSUM — Solar Energy — Active
  - e-NAM — Market Access — Active
  - Soil Health Card Scheme — Soil Health — Active
  - Kisan Credit Card — Credit and Finance — Active
  - And more schemes
- Each card: icon, name, category chip, Active badge, description, ministry, Click for details expander
- Expanding card uses Groq to generate eligibility, benefits, how to apply, documents needed

### 12. Community — route: /community
- Header: Community Forum, subtitle: Connect with fellow farmers
- Post composer: user avatar, textarea Ask a question or share farming knowledge, tags input with placeholder Tags: rice, fertilizer, Post button
- Posts list: avatar circle with initials, username, Farmer/Expert badge, time ago, post content, reply count
- Clicking post shows replies
- Stored in Firebase communityPosts and communityReplies collections

### 13. History — route: /history
- Header: Activity History, Feedback button, Clear All button
- Stats row: Total Queries, Crop Topics, Grouped count, Other count
- Filter tabs: All, Chat, Crops, Disease, Weather, Market
- Toggle: Grouped view / All view
- Queries by Crop section with crop groupings
- Other Activities section with type badge, timestamp, delete icon per item
- All data from Firebase activityHistory for logged-in user

### 14. My Profile — route: /profile
- Header: My Profile
- Left card: Avatar circle with initials, Full Name, Email, Role badge, Edit Profile button, fields for Full Name, Phone, Language dropdown
- Right card: Farm Details — State dropdown, District text, City/Village text, Farm Size number, Unit dropdown (Acres/Hectares/Bigha), Soil Type dropdown, Irrigation Type dropdown
- Save Profile button
- Data stored in Firebase users collection

---

## SHARED COMPONENTS TO BUILD
- Sidebar navigation component (collapsible)
- Top bar component with search, notifications, avatar
- Activity logger hook — automatically saves every AI interaction to Firebase
- Loading skeleton component
- Confidence gauge SVG component (for disease detection)
- Price bar component (for market prices)
- Toast notification system

---

## STARTUP COMMANDS
After building everything the app must run with:

cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

---

## FINAL INSTRUCTIONS FOR CLAUDE CODE
1. Start by scaffolding the full project structure
2. Set up Firebase config using the MCP already configured in environment
3. Build backend routes and Groq service first
4. Build frontend pages in the order listed
5. Ensure every AI interaction saves to Firebase activityHistory automatically
6. Leave disease detection as a clean stub with clear TODO comments
7. Test that all routes work before finishing
8. Create a README.md with setup instructions