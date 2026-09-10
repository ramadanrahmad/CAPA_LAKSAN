const { sendVerificationEmail } = require('./utils/email');

async function test() {
  try {
    await sendVerificationEmail('ramadanrahmad45@gmail.com', 'testtoken123');
    console.log('Success');
  } catch (err) {
    console.error('Email error:', err);
  }
}

test();
