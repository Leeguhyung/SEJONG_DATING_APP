const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sejong-dating');

const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema);

async function run() {
  const result = await User.updateOne({ studentId: '23011679' }, { $set: { role: 'admin' } });
  console.log(result);
  process.exit(0);
}
run();
