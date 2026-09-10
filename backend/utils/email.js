const transporter = require('../config/email');
require('dotenv').config();

/**
 * Send password reset email
 */
const sendResetEmail = async (to, resetToken, frontendUrl = process.env.FRONTEND_URL) => {
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f9fafb; color: #1f2937; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          h1 { color: #6d28d9; font-size: 24px; }
          p { line-height: 1.6; color: #4b5563; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Reset Password</h1>
          <p>Kami menerima permintaan untuk mereset password akun kamu. Klik tombol di bawah untuk membuat password baru:</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <p>Link ini akan expired dalam <strong>1 jam</strong>.</p>
          <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
          <div class="footer">
            <p>&copy; 2026 Auth App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (to, verificationToken, frontendUrl = process.env.FRONTEND_URL) => {
  const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verifikasi Email Kamu',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f9fafb; color: #1f2937; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          h1 { color: #10b981; font-size: 24px; }
          p { line-height: 1.6; color: #4b5563; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Verifikasi Email</h1>
          <p>Terima kasih telah mendaftar! Harap verifikasi alamat email kamu dengan mengklik tombol di bawah ini agar dapat menggunakan seluruh fitur aplikasi:</p>
          <a href="${verifyUrl}" class="btn">Verifikasi Email</a>
          <p>Link ini akan expired dalam <strong>24 jam</strong>.</p>
          <p>Jika kamu merasa tidak mendaftar di aplikasi ini, silakan abaikan email ini.</p>
          <div class="footer">
            <p>&copy; 2026 Auth App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail, sendVerificationEmail };
