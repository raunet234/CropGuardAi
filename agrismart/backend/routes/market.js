const express = require('express');
const router = express.Router();
const axios = require('axios');

const MOCK_DATA = [
  { commodity: 'Wheat', market: 'Ludhiana', state: 'Punjab', minPrice: '1800', maxPrice: '2200', modalPrice: '2015' },
  { commodity: 'Rice', market: 'Amritsar', state: 'Punjab', minPrice: '1700', maxPrice: '2100', modalPrice: '1900' },
  { commodity: 'Cotton', market: 'Bathinda', state: 'Punjab', minPrice: '5500', maxPrice: '6500', modalPrice: '6000' },
  { commodity: 'Maize', market: 'Patiala', state: 'Punjab', minPrice: '1400', maxPrice: '1800', modalPrice: '1600' },
  { commodity: 'Wheat', market: 'Karnal', state: 'Haryana', minPrice: '1850', maxPrice: '2150', modalPrice: '2000' },
  { commodity: 'Sugarcane', market: 'Muzaffarnagar', state: 'Uttar Pradesh', minPrice: '280', maxPrice: '350', modalPrice: '315' },
  { commodity: 'Tomato', market: 'Nashik', state: 'Maharashtra', minPrice: '800', maxPrice: '1500', modalPrice: '1100' },
  { commodity: 'Onion', market: 'Lasalgaon', state: 'Maharashtra', minPrice: '600', maxPrice: '1200', modalPrice: '900' },
  { commodity: 'Potato', market: 'Agra', state: 'Uttar Pradesh', minPrice: '700', maxPrice: '1100', modalPrice: '900' },
  { commodity: 'Soybean', market: 'Indore', state: 'Madhya Pradesh', minPrice: '3800', maxPrice: '4500', modalPrice: '4200' },
];

// GET /api/market?state=Punjab&crop=wheat
router.get('/', async (req, res) => {
  try {
    const { state, crop } = req.query;

    const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aab825d8b7d3f19c07b';
    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50`;

    if (state) url += `&filters[State.keyword]=${encodeURIComponent(state)}`;
    if (crop) url += `&filters[Commodity.keyword]=${encodeURIComponent(crop)}`;

    try {
      const response = await axios.get(url, { timeout: 8000 });
      const records = response.data?.records || [];

      if (records.length > 0) {
        const mapped = records.map(r => ({
          commodity: r.commodity || r.Commodity,
          market: r.market || r.Market,
          state: r.state || r.State,
          minPrice: r.min_price || r['Min Price'],
          maxPrice: r.max_price || r['Max Price'],
          modalPrice: r.modal_price || r['Modal Price'],
          date: r.arrival_date || r['Arrival Date'],
        }));
        return res.json({ records: mapped, source: 'live', total: mapped.length });
      }
    } catch (apiErr) {
      console.warn('Agmarknet API failed, using mock data:', apiErr.message);
    }

    // Filter mock data
    let filtered = MOCK_DATA;
    if (state) filtered = filtered.filter(r => r.state.toLowerCase().includes(state.toLowerCase()));
    if (crop) filtered = filtered.filter(r => r.commodity.toLowerCase().includes(crop.toLowerCase()));

    res.json({ records: filtered, source: 'mock', total: filtered.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
