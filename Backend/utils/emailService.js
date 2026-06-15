const transporter = require("../config/mailer");

// ─────────────────────────────────────────────────────────────────────────────
//  Shared HTML wrapper
// ─────────────────────────────────────────────────────────────────────────────
const emailWrapper = (title, bodyHTML) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: #1a56db; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; letter-spacing: 1px; }
    .body { padding: 36px 40px; color: #374151; font-size: 15px; line-height: 1.7; }
    .body h2 { margin-top: 0; color: #111827; font-size: 20px; }
    .otp-box { display: inline-block; margin: 20px auto; background: #f0f4ff; border: 2px dashed #1a56db; border-radius: 8px; padding: 14px 40px; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #1a56db; }
    .btn { display: inline-block; margin: 24px 0; background: #1a56db; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; }
    .note { background: #fef9c3; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 20px; }
    .footer { padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📋 PostBoard</h1></div>
    <div class="body">${bodyHTML}</div>
    <div class="footer">© ${new Date().getFullYear()} Adroit360. This is an automated message — please do not reply.</div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
//  Send OTP verification email
// ─────────────────────────────────────────────────────────────────────────────
const sendOTPEmail = async ({ to, username, otp, expiresInMinutes }) => {
  const html = emailWrapper(
    "Verify Your PostBoard Account",
    `
    <h2>Welcome to PostBoard, ${username}! 👋</h2>
    <p>Thanks for signing up. Use the one-time passcode below to verify your email address and complete your registration.</p>
    <div style="text-align:center;">
      <div class="otp-box">${otp}</div>
    </div>
    <p>Enter this code on the verification page. It expires in <strong>${expiresInMinutes} minutes</strong>.</p>
    <div class="note">⚠️ If you didn't create a PostBoard account, you can safely ignore this email.</div>
    `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} is your PostBoard verification code`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  Send password reset email
// ─────────────────────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({
  to,
  username,
  resetLink,
  expiresInMinutes,
}) => {
  const html = emailWrapper(
    "Reset Your PostBoard Password",
    `
    <h2>Password Reset Request</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>We received a request to reset the password for your PostBoard account. Click the button below to choose a new password.</p>
    <div style="text-align:center;">
      <a href="${resetLink}" class="btn">Reset My Password</a>
    </div>
    <p style="font-size:13px; color:#6b7280;">Or copy and paste this link into your browser:<br/>
      <a href="${resetLink}" style="color:#1a56db; word-break:break-all;">${resetLink}</a>
    </p>
    <div class="note">⚠️ This link expires in <strong>${expiresInMinutes} minutes</strong>. If you didn't request a password reset, please ignore this email — your password will not change.</div>
    `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your PostBoard password",
    html,
  });
};


// ─────────────────────────────────────────────────────────────────────────────
//  Send decode key email (coded content)
// ─────────────────────────────────────────────────────────────────────────────
const sendDecodeKeyEmail = async ({ to, recipientUsername, senderUsername, contentName, decodeKey }) => {
  const html = emailWrapper(
    "You have a coded content to unlock",
    `
    <h2>Coded Content Shared With You</h2>
    <p>Hi <strong>${recipientUsername}</strong>,</p>
    <p><strong>${senderUsername}</strong> shared a coded content with you on PostBoard.</p>
    <p>Content: <strong>${contentName}</strong></p>
    <p>Use the key below to unlock and access it:</p>
    <div style="text-align:center;">
      <div class="otp-box" style="font-size:20px; letter-spacing:4px;">${decodeKey}</div>
    </div>
    <div class="note">⚠️ Keep this key safe. Do not share it with anyone else.</div>
    `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `PostBoard: Decode key for "${contentName}"`,
    html,
  });
};

module.exports = { sendOTPEmail, sendPasswordResetEmail, sendDecodeKeyEmail };