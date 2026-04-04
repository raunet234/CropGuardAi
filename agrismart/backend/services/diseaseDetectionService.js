// TODO: Replace this entire function with MobileNetV3 custom trained model
// Developer will integrate their own trained model here later
// Model type: MobileNetV3 (TensorFlow.js or Python Flask microservice)
// Input: base64 image string
// Output: { disease, crop, confidence, symptoms, treatment, pesticides, prevention }

async function detectDisease(base64Image) {
  // STUB — returns mock response until real model is integrated
  return {
    disease: 'Model Not Integrated Yet',
    crop: 'Unknown',
    confidence: 0,
    symptoms: 'MobileNetV3 model will be integrated here by the developer.',
    treatment: [],
    pesticides: [],
    prevention: [],
    isStub: true,
  };
}

module.exports = { detectDisease };
