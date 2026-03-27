const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// 메시지 조회
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { myId } = req.query; 
  try {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    if (myId) {
      await ChatRoom.updateOne(
        { roomId },
        { $set: { [`unreadCounts.${myId}`]: 0 } }
      );
    }
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: '메시지 조회 실패' });
  }
});

// 채팅방 나가기
router.delete('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { myId } = req.query;
    const room = await ChatRoom.findOne({ roomId });
    if (room) {
      room.participants = room.participants.filter(id => id !== myId);
      if (room.participants.length === 0) {
        await ChatRoom.deleteOne({ roomId });
        await Message.deleteMany({ roomId });
      } else {
        await room.save();
      }
    }
    res.json({ success: true, message: '대화방에서 나갔습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '나가기 실패' });
  }
});

module.exports = router;
