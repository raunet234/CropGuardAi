const axios = require('axios');

const DISEASE_DB = {
  'Pepper__bell___Bacterial_spot': {
    crop: 'Bell Pepper',
    symptoms: 'Small, water-soaked spots on leaves that enlarge and turn brown with yellow halos. Lesions may appear on fruit as raised, scabby spots.',
    treatment: [
      'Remove and destroy infected plant material immediately',
      'Apply copper-based bactericide (e.g., Copper Oxychloride) at 7–10 day intervals',
      'Avoid overhead irrigation; use drip irrigation instead',
    ],
    pesticides: ['Copper Oxychloride', 'Mancozeb', 'Streptomycin Sulphate'],
    prevention: [
      'Use certified disease-free seeds and resistant varieties',
      'Practice crop rotation — avoid planting Solanaceae crops in the same field for 2–3 years',
      'Sanitise tools and equipment between rows',
      'Maintain proper plant spacing for good air circulation',
    ],
  },

  'Pepper__bell___healthy': {
    crop: 'Bell Pepper',
    symptoms: 'No disease symptoms detected. Leaves appear uniformly green and healthy.',
    treatment: [],
    pesticides: [],
    prevention: [
      'Maintain regular irrigation and balanced fertilisation',
      'Monitor weekly for early signs of pests or disease',
      'Practice crop rotation each season',
    ],
  },

  'Potato___Early_blight': {
    crop: 'Potato',
    symptoms: 'Dark brown to black lesions with concentric rings (target-board pattern) on older leaves. Lesions are surrounded by yellow tissue. Severely affected leaves die and drop.',
    treatment: [
      'Apply Mancozeb or Chlorothalonil fungicide at first sign of disease',
      'Remove and destroy heavily infected leaves and plant debris',
      'Apply fungicide every 7–10 days during humid conditions',
    ],
    pesticides: ['Mancozeb', 'Chlorothalonil', 'Azoxystrobin', 'Iprodione'],
    prevention: [
      'Use certified disease-free seed potatoes',
      'Ensure adequate plant nutrition — potassium strengthens disease resistance',
      'Avoid excessive nitrogen which promotes lush foliage susceptible to blight',
      'Practice 3-year crop rotation away from Solanaceae crops',
    ],
  },

  'Potato___Late_blight': {
    crop: 'Potato',
    symptoms: 'Water-soaked, pale green to brown lesions on leaves, often with white mould on the underside in humid conditions. Lesions expand rapidly and can destroy the entire plant within days.',
    treatment: [
      'Apply Metalaxyl + Mancozeb (Ridomil Gold) immediately upon detection',
      'Remove and bag infected plants — do not compost',
      'Apply fungicide preventively every 5–7 days in wet conditions',
      'Check tubers for infection before storage',
    ],
    pesticides: ['Metalaxyl + Mancozeb (Ridomil Gold)', 'Cymoxanil + Mancozeb', 'Dimethomorph', 'Copper Hydroxide'],
    prevention: [
      'Plant resistant varieties (e.g., Kufri Jyoti, Kufri Bahar)',
      'Avoid planting in fields with poor drainage',
      'Destroy volunteer potato plants that can harbour the pathogen',
      'Store tubers in cool, dry, well-ventilated conditions',
    ],
  },

  'Potato___healthy': {
    crop: 'Potato',
    symptoms: 'No disease symptoms detected. Plant appears vigorous with healthy green foliage.',
    treatment: [],
    pesticides: [],
    prevention: [
      'Apply preventive fungicide sprays during high-risk wet weather periods',
      'Monitor fields weekly, especially during humid and cool conditions',
      'Maintain proper hill-up to protect tubers from exposure',
    ],
  },

  'Tomato_Early_blight': {
    crop: 'Tomato',
    symptoms: 'Dark brown lesions with concentric rings on older lower leaves. Yellow chlorotic areas surround lesions. Stems may show dark cankers. Fruit can develop dark, sunken lesions near the stem.',
    treatment: [
      'Apply Mancozeb or Chlorothalonil fungicide at 7–10 day intervals',
      'Remove infected lower leaves and dispose of them away from the field',
      'Stake plants to improve air circulation and reduce leaf wetness',
    ],
    pesticides: ['Mancozeb', 'Chlorothalonil', 'Iprodione', 'Azoxystrobin'],
    prevention: [
      'Avoid wetting foliage — use drip irrigation',
      'Rotate crops — do not plant tomato after potato or other Solanaceae',
      'Apply organic mulch to reduce soilborne splash-up of spores',
      'Use resistant varieties where available',
    ],
  },

  'Tomato_Late_blight': {
    crop: 'Tomato',
    symptoms: 'Greasy, water-soaked lesions on leaves that turn brown and papery. White sporulation visible on leaf undersides in humid conditions. Fruit shows large, firm, brown rot.',
    treatment: [
      'Apply Metalaxyl + Mancozeb (Ridomil Gold) at first sign',
      'Remove and destroy all infected plant parts immediately',
      'Apply fungicide every 5–7 days during wet weather',
    ],
    pesticides: ['Metalaxyl + Mancozeb (Ridomil Gold)', 'Cymoxanil + Mancozeb', 'Copper Oxychloride', 'Dimethomorph'],
    prevention: [
      'Plant in well-drained soil with good air circulation',
      'Use certified disease-free transplants',
      'Apply preventive copper sprays before onset of monsoon',
      'Destroy infected crop debris thoroughly after harvest',
    ],
  },

  'Tomato__Target_Spot': {
    crop: 'Tomato',
    symptoms: 'Small brown spots with lighter centres and concentric rings on leaves, resembling a target. Spots may merge, causing large dead areas. Fruit can also be affected with sunken dark lesions.',
    treatment: [
      'Apply Chlorothalonil or Mancozeb fungicide at 7–14 day intervals',
      'Remove and destroy infected leaves',
      'Improve canopy ventilation by pruning',
    ],
    pesticides: ['Chlorothalonil', 'Mancozeb', 'Azoxystrobin', 'Boscalid'],
    prevention: [
      'Avoid overhead irrigation — use drip irrigation',
      'Train plants on stakes/trellises to keep foliage off the ground',
      'Maintain good field hygiene and remove crop debris after harvest',
    ],
  },

  'Tomato__Tomato_YellowLeaf__Curl_Virus': {
    crop: 'Tomato',
    symptoms: 'Upward curling and yellowing of leaves, particularly young leaves. Plants appear stunted with a bushy appearance. Flowers may drop and fruit set is severely reduced.',
    treatment: [
      'Remove and destroy infected plants immediately to prevent spread',
      'Apply systemic insecticides to control whitefly vector (Bemisia tabaci)',
      'Use yellow sticky traps to monitor and reduce whitefly populations',
    ],
    pesticides: ['Imidacloprid', 'Thiamethoxam', 'Acetamiprid', 'Spirotetramat'],
    prevention: [
      'Use virus-resistant or tolerant tomato varieties (e.g., Arka Rakshak)',
      'Install insect-proof netting in nurseries',
      'Plant reflective silver/aluminium mulch to repel whiteflies',
      'Avoid planting near other infected Solanaceae crops',
    ],
  },

  'Tomato__Tomato_mosaic_virus': {
    crop: 'Tomato',
    symptoms: 'Mosaic pattern of light and dark green on leaves, leaf distortion and curling. Fruits may show yellow mottling or uneven ripening. Plants may be stunted.',
    treatment: [
      'Remove and destroy infected plants — no chemical cure exists for viral disease',
      'Disinfect tools with 1% sodium hypochlorite or 70% alcohol between plants',
      'Control aphid vectors with appropriate insecticides',
    ],
    pesticides: ['Imidacloprid (for aphid control)', 'Mineral oil sprays (to reduce virus transmission)'],
    prevention: [
      'Use certified virus-free seed and resistant varieties',
      'Wash hands thoroughly before handling plants',
      'Avoid using tobacco products near tomato plants (TMV can be seed-transmitted)',
      'Control aphids and other insect vectors early',
    ],
  },

  'Tomato_Bacterial_spot': {
    crop: 'Tomato',
    symptoms: 'Small, water-soaked circular spots on leaves that turn dark brown with yellow halos. Spots may coalesce causing leaf blight. Fruit shows small, raised, scabby lesions.',
    treatment: [
      'Apply copper-based bactericide (Copper Oxychloride 50 WP) at first symptom',
      'Combine copper with Mancozeb for better efficacy',
      'Apply at 7–10 day intervals during wet weather',
    ],
    pesticides: ['Copper Oxychloride', 'Copper Hydroxide', 'Mancozeb', 'Streptomycin Sulphate'],
    prevention: [
      'Use disease-free certified seed — hot water treat seeds at 50°C for 25 minutes',
      'Avoid working in fields when foliage is wet',
      'Practice 2–3 year crop rotation away from Solanaceae',
      'Remove and destroy crop debris after harvest',
    ],
  },

  'Tomato_Leaf_Mold': {
    crop: 'Tomato',
    symptoms: 'Pale greenish-yellow spots on upper leaf surface. Corresponding olive-green to brown velvety mould growth on the underside of leaves. Affected leaves curl, wither, and drop.',
    treatment: [
      'Improve greenhouse ventilation to reduce humidity below 85%',
      'Apply Mancozeb, Chlorothalonil or Copper fungicide immediately',
      'Remove and destroy severely infected leaves',
    ],
    pesticides: ['Mancozeb', 'Chlorothalonil', 'Copper Oxychloride', 'Thiram'],
    prevention: [
      'Maintain relative humidity below 85% in protected cultivation',
      'Use resistant varieties bred for leaf mould tolerance',
      'Ensure adequate plant spacing for air circulation',
      'Avoid overhead watering — use drip irrigation',
    ],
  },

  'Tomato_Septoria_leaf_spot': {
    crop: 'Tomato',
    symptoms: 'Numerous small circular spots with dark brown margins and grey or tan centres on lower leaves. Tiny black dots (pycnidia) visible inside spots. Severely infected leaves turn yellow and drop.',
    treatment: [
      'Apply Mancozeb or Chlorothalonil fungicide at 7–10 day intervals',
      'Remove infected lower leaves as soon as symptoms appear',
      'Apply fungicide before rain events for best protection',
    ],
    pesticides: ['Mancozeb', 'Chlorothalonil', 'Copper Oxychloride', 'Azoxystrobin'],
    prevention: [
      'Rotate tomatoes with non-Solanaceae crops for 2–3 years',
      'Mulch the soil to prevent soilborne spore splash',
      'Avoid wetting leaves — water at the base of plants',
      'Stake plants to improve air circulation',
    ],
  },

  'Tomato_Spider_mites Two-spotted_spider_mite': {
    crop: 'Tomato',
    symptoms: 'Tiny yellow or white stippling on upper leaf surface caused by mite feeding. Fine webbing on underside of leaves in heavy infestations. Leaves turn bronze, dry out, and fall prematurely.',
    treatment: [
      'Apply Abamectin or Spiromesifen miticide — rotate between modes of action to prevent resistance',
      'Spray forcefully on leaf undersides where mites congregate',
      'Release predatory mites (Phytoseiulus persimilis) for biological control',
    ],
    pesticides: ['Abamectin', 'Spiromesifen', 'Fenpyroximate', 'Bifenazate'],
    prevention: [
      'Maintain adequate soil moisture — water-stressed plants are more susceptible',
      'Avoid excessive nitrogen fertilisation which promotes lush, mite-attractive growth',
      'Monitor with hand lens weekly, especially on leaf undersides',
      'Introduce natural predators and avoid broad-spectrum insecticides that kill beneficials',
    ],
  },

  'Tomato_healthy': {
    crop: 'Tomato',
    symptoms: 'No disease symptoms detected. Plant is healthy with uniform green foliage and good vigour.',
    treatment: [],
    pesticides: [],
    prevention: [
      'Apply preventive fungicide sprays during monsoon and humid periods',
      'Monitor weekly for early signs of pests, disease, or nutritional deficiency',
      'Maintain consistent irrigation and balanced NPK fertilisation',
      'Practice crop rotation each season',
    ],
  },
};

async function detectDisease(base64Image) {
  const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:5000';
  const response = await axios.post(`${MODEL_API_URL}/predict`, {
    image: base64Image,
  });

  const { disease, confidence } = response.data;

  const info = DISEASE_DB[disease] || {
    crop: 'Auto-detected',
    symptoms: '',
    treatment: [],
    pesticides: [],
    prevention: [],
  };

  return {
    disease,
    confidence,
    crop: info.crop,
    symptoms: info.symptoms,
    treatment: info.treatment,
    pesticides: info.pesticides,
    prevention: info.prevention,
    isStub: false,
  };
}

module.exports = { detectDisease };
