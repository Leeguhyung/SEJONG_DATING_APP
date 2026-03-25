require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ studentId: '23011679' });
  console.log(user);
  process.exit(0);
}
run();
