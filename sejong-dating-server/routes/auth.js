const express = require('express');
const router = express.Router();
const { authenticateWithSejong } = require('../utils/auth');
const User = require('../models/User');

// 세종대 인증 및 로그인 (POST /auth)
router.post('/', async (req, res) => {
  const { id, pw } = req.body;
  const authResult = await authenticateWithSejong(id, pw);
  if (!authResult.success) return res.status(401).json(authResult);
  
  const { studentId, name, major } = authResult.data;
  try {
    let user = await User.findOne({ studentId });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const role = studentId === '23011679' ? 'admin' : 'user';
      const superuser = studentId === '23011679';
      user = new User({ studentId, name, major, role, superuser, isProfileComplete: false, lastLogin: new Date() });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    res.json({ success: true, isNewUser, isProfileComplete: user.isProfileComplete, role: user.role, data: { name, major, studentId } });
  } catch (err) { 
    res.status(500).json({ success: false }); 
  }
});

module.exports = router;
