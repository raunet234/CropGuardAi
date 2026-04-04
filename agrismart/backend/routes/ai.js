const express = require('express');
const router = express.Router();
const { chat } = require('../services/groqService');
const { detectDisease } = require('../services/diseaseDetectionService');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages, language } = req.body;
    const systemMessage = {
      role: 'system',
      content: 'You are AgriSmart AI, an expert agricultural assistant for Indian farmers. Answer questions about crops, diseases, weather, government schemes, fertilizers, irrigation, and farming practices. Always respond in the language the user writes in. Be practical, specific, and farmer-friendly.',
    };
    const fullMessages = [systemMessage, ...(messages || [])];
    const response = await chat(fullMessages);
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/crop-recommend
router.post('/crop-recommend', async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;
    const prompt = `Based on these soil and climate parameters for an Indian farm: Nitrogen=${N}kg/ha, Phosphorus=${P}kg/ha, Potassium=${K}kg/ha, Temperature=${temperature}C, Humidity=${humidity}%, pH=${ph}, Rainfall=${rainfall}mm — recommend the top 3 best crops. For each crop provide: cropName, suitabilityScore (0-100), reasons (array of 3 strings), expectedYield (string), bestSeason (string), cultivationTips (array of 3 strings). Return ONLY a valid JSON array, no explanation, no markdown.`;

    const response = await chat([{ role: 'user', content: prompt }]);

    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    const crops = JSON.parse(jsonMatch[0]);
    res.json({ crops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/disease
router.post('/disease', async (req, res) => {
  try {
    const { image } = req.body;
    const result = await detectDisease(image);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/guideline
router.post('/guideline', async (req, res) => {
  try {
    const { module: moduleName, topic } = req.body;
    const prompt = `You are an expert agricultural advisor from ICAR. Provide detailed guidelines about "${moduleName}" - "${topic}" for Indian farmers. Structure your response with clear sections:

## Overview
Brief introduction (2-3 sentences)

## Key Practices
List 5 specific, actionable practices

## Common Problems & Solutions
List 3 common problems with their solutions

## Expert Tips
List 3-4 practical tips for Indian conditions

Be specific, practical, and use simple language.`;

    const content = await chat([{ role: 'user', content: prompt }]);
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/scheme-detail
router.post('/scheme-detail', async (req, res) => {
  try {
    const { scheme } = req.body;
    const prompt = `Provide complete details about the Indian government agricultural scheme "${scheme}". Structure as:

## Overview
What is this scheme and its objective (2-3 sentences)

## Eligibility
Who can apply (bullet points)

## Key Benefits
List the main benefits (bullet points with amounts/details)

## How to Apply
Step-by-step process (numbered list)

## Required Documents
List of documents needed (bullet points)

## Contact & Website
Official website and helpline

Be accurate and specific with amounts, dates, and procedures.`;

    const content = await chat([{ role: 'user', content: prompt }]);
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
