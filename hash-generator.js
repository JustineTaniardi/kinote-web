const bcrypt = require('bcryptjs');

async function generateHash() {
  const hash = await bcrypt.hash('Test@123456', 10);
  console.log('Bcrypt hash for "Test@123456":', hash);
}

generateHash().catch(console.error);
