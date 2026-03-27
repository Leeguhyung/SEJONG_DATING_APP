const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notice = require('../models/Notice');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');

// ⭐️ 관리자: 대시보드 통계 (DAU, WAU, MAU, Total) 조회
router.get('/stats', async (req, res) => {
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

    res.json({ success: true, data: { totalUsers, dau, wau, mau } });
  } catch (err) {
    res.status(500).json({ success: false, message: '통계 조회 실패' });
  }
});

// ⭐️ 관리자: 전체 사용자 조회
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name studentId major role superuser createdAt').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ⭐️ 관리자: 특정 사용자 권한 변경
router.patch('/users/:studentId/role', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { role } = req.body;
    
    const userToUpdate = await User.findOne({ studentId });
    if (!userToUpdate) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    if (userToUpdate.superuser) return res.status(403).json({ success: false, message: '최고 관리자의 권한은 변경할 수 없습니다.' });

    const updatedUser = await User.findOneAndUpdate({ studentId }, { role }, { new: true });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: '권한 변경 실패' });
  }
});

// ⭐️ 관리자: 특정 사용자 추방 (삭제)
router.delete('/users/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const userToDelete = await User.findOne({ studentId });
    if (!userToDelete) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    if (userToDelete.superuser) return res.status(403).json({ success: false, message: '최고 관리자는 추방할 수 없습니다.' });

    await User.findOneAndDelete({ studentId });
    res.json({ success: true, message: '사용자가 추방되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '사용자 추방 실패' });
  }
});

// ⭐️ 관리자: 공지사항 관리
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: '목록 조회 실패' });
  }
});

router.post('/notices', async (req, res) => {
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

router.delete('/notices/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '공지사항이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

// ⭐️ 관리자: 신고 내역 조회
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
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

router.delete('/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '신고 내역이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

// ⭐️ 관리자: 피드백 목록 조회
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    const feedbacksWithNames = await Promise.all(feedbacks.map(async (f) => {
      const user = await User.findOne({ studentId: f.studentId }, 'name').lean();
      return { ...f, userName: user ? user.name : '알 수 없음' };
    }));
    res.json({ success: true, data: feedbacksWithNames });
  } catch (err) {
    res.status(500).json({ success: false, message: '피드백 조회 실패' });
  }
});

module.exports = router;
