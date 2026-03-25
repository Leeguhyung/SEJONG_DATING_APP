const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  major: { type: String, required: true },
  
  // 추가될 프로필 정보
  age: { type: Number },
  bio: { type: String },
  interests: [{ type: String }],
  profileImage: { type: String, default: null }, // Base64 이미지 데이터 저장
  
  isProfileComplete: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  superuser: { type: Boolean, default: false },
  pushToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
