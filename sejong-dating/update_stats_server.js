const fs = require('fs');
const serverRoot = '/home/user/sejongdating/sejong-dating-server';
const indexPath = `${serverRoot}/index.js`;
let indexCode = fs.readFileSync(indexPath, 'utf8');

// 1. /auth API 수정 (lastLogin 업데이트 로직 추가)
const oldAuthLogic = `    let user = await User.findOne({ studentId });
    if (!user) {
      const role = studentId === '23011679' ? 'admin' : 'user';
      user = new User({ studentId, name, major, role, isProfileComplete: false });
      await user.save();
    }
    res.json({ success: true, isNewUser: !user, isProfileComplete: user.isProfileComplete, role: user ? user.role : 'user', data: { name, major, studentId } });`;

const newAuthLogic = `    let user = await User.findOne({ studentId });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const role = studentId === '23011679' ? 'admin' : 'user';
      user = new User({ studentId, name, major, role, isProfileComplete: false, lastLogin: new Date() });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    res.json({ success: true, isNewUser, isProfileComplete: user.isProfileComplete, role: user.role, data: { name, major, studentId } });`;

if (indexCode.includes("let user = await User.findOne({ studentId });") && !indexCode.includes("user.lastLogin = new Date();")) {
  indexCode = indexCode.replace(oldAuthLogic, newAuthLogic);
  console.log('Login API updated to track lastLogin.');
}

// 2. /admin/stats API 추가
if (!indexCode.includes("app.get('/admin/stats'")) {
  const statsEndpoint = `
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
`;
  indexCode = indexCode.replace("app.get('/admin/users', async (req, res) => {", statsEndpoint + "\napp.get('/admin/users', async (req, res) => {");
  console.log('Admin stats API added.');
}

fs.writeFileSync(indexPath, indexCode);
