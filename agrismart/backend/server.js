require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

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
