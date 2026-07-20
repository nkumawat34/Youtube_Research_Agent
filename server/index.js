import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { generateIdeasFromThemes, getTrendingThemes, getViralVideos, extractThemesFromVideos, generateResearchReport } from './viralService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.get('/api/viral', async (req, res) => {
  try {
    const data = await getViralVideos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch viral videos', error: error.message });
  }
});

app.get('/api/trends', async (req, res) => {
  try {
    const viralData = await getViralVideos();
    const themes = extractThemesFromVideos(viralData.videos, 5);
    const ideas = await generateIdeasFromThemes(themes);
    res.json({ themes, ideas });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trends', error: error.message });
  }
});

app.post('/api/research', async (req, res) => {
  try {
    const topic = req.body?.topic || 'AI tools';
    const report = await generateResearchReport(topic);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate research report', error: error.message });
  }
});

// POST /api/feedback - Sends user feedback email via Nodemailer
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, rating, category, message } = req.body || {};

    if (!message || !email) {
      return res.status(400).json({ message: 'Email and message are required fields.' });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.FEEDBACK_RECIPIENT_EMAIL || smtpUser || 'admin@youtuberesearchagent.io';

    console.log('📬 Feedback Received:', { name, email, rating, category, message });

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `"${name || 'Feedback Form'}" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `[YouTube Research Agent Feedback] ${category || 'General'} - Rating: ${rating || 5}/5 ⭐`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb; margin-top: 0;">🚀 New User Feedback Received</h2>
            <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
            <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
            <p><strong>User Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Category:</strong> ${category || 'General'}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(rating || 5)} (${rating || 5}/5)</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
            <h3 style="color: #1f2937;">Message:</h3>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message}
            </div>
            <br/>
            <p style="font-size: 12px; color: #6b7280;">Sent automatically from YouTube Research Agent SaaS App.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Feedback email sent successfully via Nodemailer to', recipientEmail);
      return res.json({ success: true, message: 'Feedback sent successfully! Thank you for your review.' });
    } else {
      console.log('ℹ️ Nodemailer info: SMTP_USER or SMTP_PASS not set in server/.env. Feedback logged on server.');
      return res.json({
        success: true,
        message: 'Thank you! Your feedback was received successfully.'
      });
    }
  } catch (error) {
    console.error('❌ Error sending feedback email:', error);
    res.status(500).json({ message: 'Failed to process feedback email', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

