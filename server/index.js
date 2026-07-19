import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
