const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // 속한 채팅방의 roomId
  senderId: { type: String, required: true }, // 보낸 사람의 학번
  text: { type: String, required: true }, // 메시지 내용
  createdAt: { type: Date, default: Date.now } // 보낸 시간
});

module.exports = mongoose.model('Message', messageSchema);
