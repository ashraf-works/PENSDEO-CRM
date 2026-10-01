const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Read SMTP environment variables with fallback configuration
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || 'pensdeo_crm@example.com';
    const pass = process.env.SMTP_PASS || 'crm_pass_123';
    const from = process.env.SMTP_FROM || 'noreply@pensdeo.com';

    // Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocking in dev
      },
    });

    const mailOptions = {
      from: `"PENSDEO Workspace" <${from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email dispatched to ${to}: ${info.messageId || 'Success'}`);
    return info;
  } catch (error) {
    console.error('❌ Detailed SMTP Email Transmission Error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    });
    // Return error payload so caller can handle gracefully
    return { error: error.message };
  }
};

module.exports = sendEmail;
