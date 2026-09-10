const { sendResetEmail } = require('./utils/email');

async function testEmail() {
  try {
    console.log('Sending email...');
    await sendResetEmail('salsabilaswot@gmail.com', 'test-token-123');
    console.log('Email sent successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error sending email:', err);
    process.exit(1);
  }
}

testEmail();
