const express = require('express');
const router = express.Router();
const { db } = require('../services/firebaseService');

// POST /api/auth/profile — create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const { uid, fullName, phone, language, role, state, district, city,
            farmSize, farmSizeUnit, soilType, irrigationType } = req.body;

    if (!uid) return res.status(400).json({ error: 'uid is required' });

    const profileData = {
      fullName: fullName || '',
      phone: phone || '',
      language: language || 'English',
      role: role || 'Farmer',
      state: state || '',
      district: district || '',
      city: city || '',
      farmSize: farmSize || '',
      farmSizeUnit: farmSizeUnit || 'Acres',
      soilType: soilType || '',
      irrigationType: irrigationType || '',
      updatedAt: new Date().toISOString(),
    };

    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      profileData.createdAt = new Date().toISOString();
      await docRef.set(profileData);
    } else {
      await docRef.update(profileData);
    }

    res.json({ success: true, profile: profileData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
