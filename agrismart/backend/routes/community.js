const express = require('express');
const router = express.Router();
const { db } = require('../services/firebaseService');

// GET /api/community/posts
router.get('/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('communityPosts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/posts
router.post('/posts', async (req, res) => {
  try {
    const { userId, userName, userRole, content, tags } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'userId and content required' });

    const post = {
      userId,
      userName: userName || 'Anonymous',
      userRole: userRole || 'Farmer',
      content,
      tags: tags || [],
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('communityPosts').add(post);
    res.json({ success: true, id: docRef.id, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/reply
router.post('/reply', async (req, res) => {
  try {
    const { postId, userId, userName, content } = req.body;
    if (!postId || !userId || !content) return res.status(400).json({ error: 'postId, userId and content required' });

    const reply = {
      postId,
      userId,
      userName: userName || 'Anonymous',
      content,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('communityReplies').add(reply);

    // Update reply count on post
    const postRef = db.collection('communityPosts').doc(postId);
    const postDoc = await postRef.get();
    if (postDoc.exists) {
      await postRef.update({ replyCount: (postDoc.data().replyCount || 0) + 1 });
    }

    res.json({ success: true, id: docRef.id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/community/replies/:postId
router.get('/replies/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const snapshot = await db.collection('communityReplies')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc')
      .get();

    const replies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
