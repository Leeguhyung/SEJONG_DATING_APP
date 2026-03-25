const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sejong-dating', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');
    const schema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', schema);
    const result = await User.updateOne({ studentId: '23011679' }, { $set: { role: 'admin' } });
    console.log('Update Result:', result);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();