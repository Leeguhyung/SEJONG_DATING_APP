require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const { authenticateWithSejong } = require('./utils/auth');
const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const Notice = require('./models/Notice');
const Feedback = require('./models/Feedback');
const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sejong-dating';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));


// ⭐️ 관리자: 전체 사용자 조회

// ⭐️ 관리자: 공지사항 생성

// ⭐️ 관리자: 전체 공지사항 목록 조회
app.get('/admin/notices', async (req, res) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: '목록 조회 실패' });
  }
});

// ⭐️ 관리자: 공지사항 삭제
app.delete('/admin/notices/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '공지사항이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

app.post('/admin/notices', async (req, res) => {
  try {
    const { title, content, durationDays } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));

    const newNotice = new Notice({ title, content, expiresAt });
    await newNotice.save();
    res.json({ success: true, data: newNotice });
  } catch (err) {
    res.status(500).json({ success: false, message: '공지사항 생성 실패' });
  }
});

// ⭐️ 사용자: 활성화된 최신 공지사항 조회

// ⭐️ 사용자: 피드백 전송

// ⭐️ 사용자: 채팅방 나가기 (대화 삭제)
app.delete('/chat/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { myId } = req.query;
    
    // 1. ChatRoom에서 내 학번 제거
    const room = await ChatRoom.findOne({ roomId });
    if (room) {
      room.participants = room.participants.filter(id => id !== myId);
      if (room.participants.length === 0) {
        // 참가자가 아무도 없으면 방 자체를 삭제
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

app.post('/feedback', async (req, res) => {
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

// ⭐️ 관리자: 피드백 목록 조회 (나중에 관리자 페이지에서 필요할 수 있음)
// ⭐️ 관리자: 피드백 목록 조회 (발송인 이름 포함)
// ⭐️ 사용자: 사용자 신고 접수
app.post('/report', async (req, res) => {
  try {
    const { reporterId, reportedId, messageContent } = req.body;
    if (!reporterId || !reportedId || !messageContent) {
      return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }
    
    const newReport = new Report({ reporterId, reportedId, messageContent });
    await newReport.save();
    res.json({ success: true, message: '신고가 접수되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '신고 접수 실패' });
  }
});

// ⭐️ 관리자: 신고 내역 조회 (이름 포함)
app.get('/admin/reports', async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
    
    // 각 신고에 대해 신고자, 피신고자 이름을 찾아서 병합
    const reportsWithNames = await Promise.all(reports.map(async (r) => {
      const reporter = await User.findOne({ studentId: r.reporterId }, 'name').lean();
      const reported = await User.findOne({ studentId: r.reportedId }, 'name').lean();
      return { 
        ...r, 
        reporterName: reporter ? reporter.name : '알 수 없음',
        reportedName: reported ? reported.name : '알 수 없음'
      };
    }));

    res.json({ success: true, data: reportsWithNames });
  } catch (err) {
    res.status(500).json({ success: false, message: '신고 내역 조회 실패' });
  }
});

// ⭐️ 관리자: 특정 신고 내역 삭제
app.delete('/admin/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndDelete(id);
    res.json({ success: true, message: '신고 내역이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

app.get('/admin/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    
    // 각 피드백에 대해 유저 이름을 찾아서 병합
    const feedbacksWithNames = await Promise.all(feedbacks.map(async (f) => {
      const user = await User.findOne({ studentId: f.studentId }, 'name').lean();
      return { ...f, userName: user ? user.name : '알 수 없음' };
    }));

    res.json({ success: true, data: feedbacksWithNames });
  } catch (err) {
    res.status(500).json({ success: false, message: '피드백 조회 실패' });
  }
});
  

app.get('/notices/active', async (req, res) => {
  try {
    const now = new Date();
    const latestNotice = await Notice.findOne({ expiresAt: { $gt: now } }).sort({ createdAt: -1 });
    res.json({ success: true, data: latestNotice });
  } catch (err) {
    res.status(500).json({ success: false, message: '공지사항 조회 실패' });
  }
});


// ⭐️ 관리자: 대시보드 통계 (DAU, WAU, MAU, Total) 조회
app.get('/admin/stats', async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, dau, wau, mau] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: oneDayAgo } }),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        dau,
        wau,
        mau
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '통계 조회 실패' });
  }
});

app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name studentId major role superuser createdAt').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ⭐️ 관리자: 특정 사용자 권한 변경
app.patch('/admin/users/:studentId/role', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { role } = req.body;
    
    const userToUpdate = await User.findOne({ studentId });
    if (!userToUpdate) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    if (userToUpdate.superuser) return res.status(403).json({ success: false, message: '최고 관리자의 권한은 변경할 수 없습니다.' });

    const updatedUser = await User.findOneAndUpdate({ studentId }, { role }, { new: true });
    if (updatedUser) {
      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '권한 변경 실패' });
  }
});

// ⭐️ 관리자: 특정 사용자 추방 (삭제)
app.delete('/admin/users/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const userToDelete = await User.findOne({ studentId });
    if (!userToDelete) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    if (userToDelete.superuser) return res.status(403).json({ success: false, message: '최고 관리자는 추방할 수 없습니다.' });

    const deletedUser = await User.findOneAndDelete({ studentId });
    if (deletedUser) {
      // 해당 사용자가 참여중인 채팅방 및 메시지도 삭제할 수 있지만, 우선 유저 모델만 삭제
      res.json({ success: true, message: '사용자가 추방되었습니다.' });
    } else {
      res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '사용자 추방 실패' });
  }
});

app.get('/users', async (req, res) => {
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
          hasChat: !!chatInfo, // 채팅방 존재 여부
          lastMessage: chatInfo ? chatInfo.lastMessage : '채팅을 시작해 보세요!',
          updatedAt: chatInfo ? chatInfo.updatedAt : null,
          unreadCount: chatInfo ? chatInfo.unreadCount : 0
        };
      });

      // ⭐️ 핵심: chatOnly 파라미터가 'true'로 오면 채팅방이 있는 사람만 남김!
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

app.get('/chat/:roomId', async (req, res) => {
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


// 푸시 토큰 저장 API
app.post('/push-token', async (req, res) => {
  const { studentId, pushToken } = req.body;
  if (!studentId || pushToken === undefined) return res.status(400).json({ success: false });
  try {
    await User.findOneAndUpdate({ studentId }, { pushToken });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/auth', async (req, res) => {
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
  } catch (err) { res.status(500).json({ success: false }); }
});


app.get('/profile/:studentId', async (req, res) => {
  try {
    const user = await User.findOne({ studentId: req.params.studentId });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});


// ⭐️ 사용자: 회원 탈퇴
app.delete('/users/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    await User.findOneAndDelete({ studentId });
    // 탈퇴 시 해당 유저가 쓴 피드백이나 참여한 채팅 등은 정책에 따라 유지하거나 지울 수 있음
    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '회원 탈퇴 실패' });
  }
});

app.post('/profile', async (req, res) => {
  const { studentId, age, bio, interests, profileImage } = req.body;
  try {
    const updateData = { age, bio, interests, isProfileComplete: true };
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }
    const user = await User.findOneAndUpdate({ studentId }, updateData, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false }); }
});

io.on('connection', (socket) => {
  console.log('👤 사용자 접속:', socket.id);

  // ⭐️ 유저가 자신의 고유 채널(학번)에 입장
  socket.on('login', (studentId) => {
    socket.join(studentId);
    console.log(`✅ 개인 채널 입장: ${studentId}`);
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

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

      // 같은 방(채팅방 화면)에 있는 사람에게 메시지 전달
      io.to(roomId).emit('receive_message', newMessage);
      
      // ⭐️ 상대방의 개인 채널(목록 화면)로 새로고침 신호 전달
      io.to(otherId).emit('chat_list_update');

      // 푸시 알림 전송 로직
      const recipient = await User.findOne({ studentId: otherId });
      if (recipient && recipient.pushToken && Expo.isExpoPushToken(recipient.pushToken)) {
        const pushMessages = [{
          to: recipient.pushToken,
          sound: 'default',
          title: '세종설렘 💌',
          body: text.length > 20 ? text.substring(0, 20) + '...' : text, // 메시지 내용을 알림에 포함
          data: { roomId },
        }];
        try {
          const chunks = expo.chunkPushNotifications(pushMessages);
          for (let chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
        } catch (error) {
          console.error('푸시 알림 전송 실패:', error);
        }
      }

      
    } catch (err) {
      console.error('메시지 저장 오류:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ 접속 종료');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 실시간 소켓 서버 실행 중: 3000');
});
