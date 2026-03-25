const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  participants: [{ type: String, required: true }],
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  unreadCounts: { type: Map, of: Number, default: {} } // 안읽은 메시지 수 저장
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
