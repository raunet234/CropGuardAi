const express = require('express');
const router = express.Router();
const { db } = require('../services/firebaseService');

// GET /api/history/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('activityHistory')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/history
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, cropName, data } = req.body;
    if (!userId || !type) return res.status(400).json({ error: 'userId and type required' });

    const record = {
      userId,
      type,
      title: title || '',
      cropName: cropName || '',
      data: data || {},
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('activityHistory').add(record);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history/:userId
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('activityHistory')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.json({ success: true, deleted: snapshot.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
