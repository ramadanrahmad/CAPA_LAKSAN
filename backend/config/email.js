const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  // Paksa menggunakan IPv4 dengan custom lookup
  lookup: (hostname, options, callback) => {
    const dns = require('dns');
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      if (err) return callback(err);
      callback(null, address, family);
    });
  } 
});

// Verify connection (optional, logs to console)
transporter.verify((error) => {
  if (error) {
    console.log('⚠️  Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

module.exports = transporter;
