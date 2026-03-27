const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// 활성화된 최신 공지사항 조회
router.get('/notices/active', async (req, res) => {
  try {
    const now = new Date();
    const latestNotice = await Notice.findOne({ expiresAt: { $gt: now } }).sort({ createdAt: -1 });
    res.json({ success: true, data: latestNotice });
  } catch (err) {
    res.status(500).json({ success: false, message: '공지사항 조회 실패' });
  }
});

module.exports = router;
