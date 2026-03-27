require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// 라우터 가져오기
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 라우터 연결
app.get('/', (req, res) => res.send('🚀 Sejong Dating Server is Running!'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);   // -> POST /auth 처리용
app.use('/admin', adminRoutes); // -> /admin/... 처리용
app.use('/chat', chatRoutes);   // -> /chat/... 처리용
app.use('/', publicRoutes);     // -> /notices/active 처리용
app.use('/', userRoutes);       // -> /users, /profile, /feedback, /report 처리용 (루트에 마운트!)

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sejong-dating';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 모델 (소켓 로직용)
const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');

// 실시간 소켓 통신 로직
io.on('connection', (socket) => {
  socket.on('login', (studentId) => {
    socket.join(studentId);
    console.log(`✅ 개인 채널 입장: ${studentId}`);
  });
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', async (data) => {
    try {
      const { roomId, senderId, text } = data;
      const otherId = roomId.split('_').find(id => id !== senderId);
      const newMessage = new Message({ roomId, senderId, text });
      await newMessage.save();
      await ChatRoom.findOneAndUpdate(
        { roomId },
        { 
          lastMessage: text, 
          updatedAt: Date.now(),
          $addToSet: { participants: { $each: [senderId, otherId] } },
          $inc: { [`unreadCounts.${otherId}`]: 1 } 
        },
        { upsert: true, new: true }
      );
      io.to(roomId).emit('receive_message', newMessage);
      io.to(otherId).emit('chat_list_update');
      const recipient = await User.findOne({ studentId: otherId });
      if (recipient && recipient.pushToken && Expo.isExpoPushToken(recipient.pushToken)) {
        const pushMessages = [{
          to: recipient.pushToken,
          sound: 'default',
          title: '세종설렘 💌',
          body: text.length > 20 ? text.substring(0, 20) + '...' : text,
          data: { roomId },
        }];
        const chunks = expo.chunkPushNotifications(pushMessages);
        for (let chunk of chunks) await expo.sendPushNotificationsAsync(chunk);
      }
    } catch (err) { console.error('메시지 저장 오류:', err); }
  });
  socket.on('disconnect', () => {});
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행 중!!: ${PORT}`);
});
