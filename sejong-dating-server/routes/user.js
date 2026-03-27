const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');

// 1. 사용자 목록 조회 (프런트엔드: GET /users)
router.get('/users', async (req, res) => {
  const { myId, chatOnly } = req.query;
  try {
    const query = myId ? { studentId: { $ne: myId } } : {};
    const users = await User.find(query, 'name major studentId age bio interests profileImage').lean();

    if (myId) {
      const rooms = await ChatRoom.find({ participants: myId }).lean();
      const roomMap = {};
      rooms.forEach(room => {
        const otherId = room.participants.find(id => id !== myId);
        if (otherId) {
          roomMap[otherId] = {
            lastMessage: room.lastMessage,
            updatedAt: room.updatedAt,
            unreadCount: room.unreadCounts ? (room.unreadCounts[myId] || 0) : 0
          };
        }
      });

      let usersWithChat = users.map(user => {
        const chatInfo = roomMap[user.studentId];
        return {
          ...user,
          hasChat: !!chatInfo,
          lastMessage: chatInfo ? chatInfo.lastMessage : '채팅을 시작해 보세요!',
          updatedAt: chatInfo ? chatInfo.updatedAt : null,
          unreadCount: chatInfo ? chatInfo.unreadCount : 0
        };
      });

      if (chatOnly === 'true') {
        usersWithChat = usersWithChat.filter(u => u.hasChat);
      }
      
      usersWithChat.sort((a, b) => {
        if (!a.updatedAt && !b.updatedAt) return 0;
        if (!a.updatedAt) return 1;
        if (!b.updatedAt) return -1;
        return b.updatedAt - a.updatedAt;
      });

      res.json({ success: true, data: usersWithChat });
    } else {
      res.json({ success: true, data: users });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 2. 프로필 조회 (프런트엔드: GET /profile/:studentId)
router.get('/profile/:studentId', async (req, res) => {
  try {
    const user = await User.findOne({ studentId: req.params.studentId });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 3. 프로필 수정 (프런트엔드: POST /profile)
router.post('/profile', async (req, res) => {
  const { studentId, age, bio, interests, profileImage } = req.body;
  try {
    const updateData = { age, bio, interests, isProfileComplete: true };
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    const user = await User.findOneAndUpdate({ studentId }, updateData, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false }); }
});

// 4. 회원 탈퇴 (프런트엔드: DELETE /users/:studentId)
router.delete('/users/:studentId', async (req, res) => {
  try {
    await User.findOneAndDelete({ studentId: req.params.studentId });
    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '회원 탈퇴 실패' });
  }
});

// 5. 피드백 전송 (프런트엔드: POST /feedback)
router.post('/feedback', async (req, res) => {
  try {
    const { studentId, content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: '내용을 입력해주세요.' });
    const newFeedback = new Feedback({ studentId, content });
    await newFeedback.save();
    res.json({ success: true, message: '피드백이 전송되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '피드백 전송 실패' });
  }
});

// 6. 사용자 신고 접수 (프런트엔드: POST /report)
router.post('/report', async (req, res) => {
  try {
    const { reporterId, reportedId, messageContent } = req.body;
    if (!reporterId || !reportedId || !messageContent) return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    const newReport = new Report({ reporterId, reportedId, messageContent });
    await newReport.save();
    res.json({ success: true, message: '신고가 접수되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '신고 접수 실패' });
  }
});

// 7. 푸시 토큰 저장 (프런트엔드: POST /push-token)
router.post('/push-token', async (req, res) => {
  const { studentId, pushToken } = req.body;
  if (!studentId || pushToken === undefined) return res.status(400).json({ success: false });
  try {
    await User.findOneAndUpdate({ studentId }, { pushToken });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
