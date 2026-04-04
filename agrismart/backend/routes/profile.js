const express = require('express');
const router = express.Router();
const { db } = require('../services/firebaseService');

// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) return res.status(404).json({ error: 'Profile not found' });

    res.json({ profile: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/:userId
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData.uid;

    await db.collection('users').doc(userId).set(updateData, { merge: true });
    res.json({ success: true, profile: updateData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
