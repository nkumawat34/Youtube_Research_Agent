import https from 'https';
import { fetch, Headers, Request, Response } from 'undici';
import { GoogleGenAI } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'to', 'with', 'that', 'this', 'is', 'are', 'by', 'from', 'as', 'at', 'be', 'it', 'its', 'how', 'what', 'why', 'when', 'who', 'can', 'your', 'you', 'our', 'into', 'then', 'than'
]);

function normalizeTopic(topic) {
  return (topic || '').toString().trim() || 'AI tools';
}

function slugifyTopic(topic) {
  return normalizeTopic(topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSampleVideos(topic = 'AI tools') {
  const safeTopic = normalizeTopic(topic);
  return {
    videos: [
      {
        id: 'sample-1',
        title: `${safeTopic}: the biggest breakout trend this week`,
        channelTitle: 'Trend Watch',
        views: '1250000',
        likes: '98000',
        thumbnail: 'https://i.ytimg.com/vi/ScMzIvxBSi4/hqdefault.jpg',
        publishedAt: '2026-07-10T12:00:00Z',
        description: `A fast-paced breakdown of ${safeTopic} for curious viewers.`
      },
      {
        id: 'sample-2',
        title: `Creators are testing ${safeTopic} in new ways`,
        channelTitle: 'Creator Pulse',
        views: '980000',
        likes: '64000',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: '2026-07-08T10:30:00Z',
        description: `A practical walkthrough of how ${safeTopic} is changing creator workflows.`
      },
      {
        id: 'sample-3',
        title: `3 mistakes people make when learning ${safeTopic}`,
        channelTitle: 'Viral Lab',
        views: '780000',
        likes: '52000',
        thumbnail: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
        publishedAt: '2026-07-06T15:45:00Z',
        description: `A simple guide to avoid common beginner errors around ${safeTopic}.`
      }
    ]
  };
}

export function extractThemesFromVideos(videos = [], maxThemes = 5) {
  const titles = (videos || []).map((v) => (v.title || '')).filter(Boolean);
  if (!titles.length) return getTrendingThemes().slice(0, maxThemes);

  const words = {};
  const bigrams = {};

  titles.forEach((t) => {
    const cleaned = t.toLowerCase().replace(/["'’‘.,!?:;()\[\]{}\/\\]/g, '');
    const parts = cleaned.split(/\s+/).filter(Boolean);
    parts.forEach((w, i) => {
      const wSan = w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
      if (wSan.length < 3) return;
      if (STOPWORDS.has(wSan)) return;
      words[wSan] = (words[wSan] || 0) + 1;
      if (i > 0) {
        const prevSan = parts[i - 1].replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
        if (!STOPWORDS.has(prevSan) && prevSan.length >= 3) {
          const bigram = `${prevSan} ${wSan}`;
          bigrams[bigram] = (bigrams[bigram] || 0) + 1;
        }
      }
    });
  });

  const sortedBigrams = Object.entries(bigrams).sort((a, b) => b[1] - a[1]).map((e) => e[0]);
  const sortedWords = Object.entries(words).sort((a, b) => b[1] - a[1]).map((e) => e[0]);

  const themes = [];
  for (const b of sortedBigrams) {
    if (themes.length >= maxThemes) break;
    themes.push(b);
  }
  for (const w of sortedWords) {
    if (themes.length >= maxThemes) break;
    if (!themes.includes(w)) themes.push(w);
  }

  return themes
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, maxThemes);
}

export function getTrendingThemes() {
  return [
    'AI tools',
    'short-form video',
    'creator economy',
    'tech gadgets',
    'lifestyle hacks'
  ];
}

function parseJSONFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();

  const firstBrace = body.indexOf('{');
  const lastBrace = body.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = body.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // continue to try full-body parse
    }
  }

  try {
    return JSON.parse(body);
  } catch (e) {
    return null;
  }
}

async function generateIdeasWithGemini(themes) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Themes: ${themes.join(', ')}\n\nYou are a YouTube creator coach helping video makers brainstorm viral content. Create exactly 5 concise, clickable YouTube video ideas aimed at creators, each with a strong title, a 1-line hook, and 3 short keywords. Return only valid JSON with shape:{"ideas":[{"title":"...","hook":"...","tags":["...","...","..."]} ...]}.`;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  const content = response.text || response.output?.[0]?.content || '';
  const parsed = parseJSONFromText(content);
  if (parsed && Array.isArray(parsed.ideas)) {
    return parsed.ideas.slice(0, 5).map((it) => `${it.title} — ${it.hook}`);
  }

  return content
    .split('\n')
    .map((line) => line.replace(/^[-*0-9.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

export async function generateIdeasFromThemes(themes = []) {
  const normalizedThemes = themes.length ? themes : getTrendingThemes();

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for idea generation. No OpenAI fallback is configured.');
  }

  try {
    return await generateIdeasWithGemini(normalizedThemes);
  } catch (error) {
    console.error('generateIdeasFromThemes error:', error?.message || error);
    const templates = [
      'Behind the scenes of {theme}',
      'Why {theme} is trending right now',
      '3 quick facts about {theme}',
      'How to react to {theme} in 30 seconds',
      '{theme}: A fast breakdown'
    ];
    const results = [];
    for (let i = 0; results.length < 5; i++) {
      const theme = normalizedThemes.length ? normalizedThemes[i % normalizedThemes.length] : 'this trend';
      const template = templates[i % templates.length];
      const title = template.replace('{theme}', theme);
      const hook = `Open with a striking stat or visual about ${theme} to hook viewers.`;
      results.push(`${title} — ${hook}`);
    }
    return results;
  }
}

export async function getViralVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return getSampleVideos();
  }

  const url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=10&regionCode=US&key=' + apiKey;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve(getSampleVideos());
            return;
          }

          const videos = (parsed.items || []).map((item) => ({
            id: item.id,
            title: item.snippet?.title || 'Untitled',
            channelTitle: item.snippet?.channelTitle || 'Unknown',
            views: item.statistics?.viewCount || '0',
            likes: item.statistics?.likeCount || '0',
            thumbnail: item.snippet?.thumbnails?.high?.url || '',
            publishedAt: item.snippet?.publishedAt || '',
            description: item.snippet?.description || ''
          }));

          resolve({ videos });
        } catch (error) {
          resolve(getSampleVideos());
        }
      });
    }).on('error', () => {
      resolve(getSampleVideos());
    });
  });
}

export async function searchYouTubeVideos(topic) {
  const normalizedTopic = normalizeTopic(topic);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return getSampleVideos(normalizedTopic).videos;
  }

  const query = encodeURIComponent(normalizedTopic);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&safeSearch=moderate&key=${apiKey}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve(getSampleVideos(normalizedTopic).videos);
            return;
          }

          const videos = (parsed.items || []).map((item) => ({
            id: item.id?.videoId || item.id,
            title: item.snippet?.title || 'Untitled video',
            channelTitle: item.snippet?.channelTitle || 'Unknown creator',
            thumbnail: item.snippet?.thumbnails?.high?.url || '',
            publishedAt: item.snippet?.publishedAt || '',
            description: item.snippet?.description || '',
            url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`
          }));

          resolve(videos);
        } catch (error) {
          resolve(getSampleVideos(normalizedTopic).videos);
        }
      });
    }).on('error', () => {
      resolve(getSampleVideos(normalizedTopic).videos);
    });
  });
}

function extractTitleSignals(videos = []) {
  const titleTexts = (videos || []).map((video) => video.title || '').filter(Boolean);
  const recurring = [];
  const counts = {};

  titleTexts.forEach((title) => {
    const cleanWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    cleanWords.forEach((word) => {
      if (word.length < 3 || STOPWORDS.has(word)) return;
      counts[word] = (counts[word] || 0) + 1;
    });
  });

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([word]) => recurring.push(word));

  return recurring;
}

function buildVideoNarrativeBlueprint(topic, videos = []) {
  const titleSignals = extractTitleSignals(videos);
  const talkingPoints = [
    `The strongest videos around ${topic} usually open with a clear problem statement.`,
    `Creators frequently compare tools, methods, or workflows instead of just listing features.`,
    `A practical demo or case study tends to outperform simple commentary.`,
    `Viewer retention improves when the narrator answers common objections early.`
  ];

  if (titleSignals.length) {
    talkingPoints.push(`Recurring title language includes: ${titleSignals.join(', ')}.`);
  }

  return {
    summary: `The likely transcript pattern is a rapid hook, a quick explanation of why ${topic} matters, then an example or comparison that keeps viewers engaged.`,
    talkingPoints
  };
}

async function buildRecurringQuestionsWithGemini(topic, comments = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a YouTube audience insight analyst. Topic: ${topic}\nComments:\n${(comments || []).slice(0, 20).join('\n')}\n\nFrom these comments, extract the 10 most recurring and important questions people are asking. Return valid JSON as an array of strings only, like ["How do I... ?", "What is... ?", ...].`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    contents: prompt
  });

  const content = response.text || response.output?.[0]?.content || '';
  const parsed = parseJSONFromText(content);

  if (Array.isArray(parsed)) {
    return parsed.slice(0, 10);
  }

  return [];
}

function buildCommentAnalysis(topic, videos = [], comments = []) {
  const questions = [
    `How do I get started with ${topic} as a beginner?`,
    `What are the best free tools or alternatives for ${topic}?`,
    `Are there any common mistakes to avoid when using ${topic}?`,
    `How does ${topic} compare to other standard workflows?`
  ];

  const commonThemes = [
    `Beginner-friendly guidance for ${topic}`,
    `Cost vs value concerns`,
    `Need for practical examples`,
    `Comparison between tools or methods`
  ];

  const summary = `The audience is looking for clarity, proof, and actionable next steps around ${topic}.`;

  return {
    summary,
    questions,
    commonThemes
  };
}

function buildContentGaps(topic, videos = []) {
  const baseGaps = [
    `A beginner-friendly roadmap for ${topic}`,
    `A side-by-side comparison with alternatives to ${topic}`,
    `Real-world results and before/after examples`,
    `A short-form explainers series that breaks the topic into simple steps`
  ];

  if (videos.length >= 3) {
    baseGaps.push(`A deeper case study showing how ${topic} works in a real workflow`);
  }

  return baseGaps;
}

async function fetchTranscriptsForVideos(videos = []) {
  const results = [];

  for (const video of videos.slice(0, 10)) {
    if (!video?.id) {
      results.push({ id: video?.id || null, transcript: '' });
      continue;
    }

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(video.id, { lang: 'en' });
      const text = (transcript || [])
        .map((entry) => entry.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      results.push({ id: video.id, transcript: text.slice(0, 6000) });
    } catch (error) {
      results.push({ id: video.id, transcript: '' });
    }
  }

  return results;
}

async function fetchTopCommentsForVideos(videos = []) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const results = [];

  if (!apiKey) {
    return results;
  }

  for (const video of videos.slice(0, 10)) {
    if (!video?.id) {
      results.push({ id: video?.id || null, comments: [] });
      continue;
    }

    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video.id}&maxResults=5&order=relevance&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const parsed = await response.json();
      const comments = (parsed.items || [])
        .map((item) => item.snippet?.topLevelComment?.snippet?.textDisplay || '')
        .filter(Boolean)
        .slice(0, 5);

      results.push({ id: video.id, comments });
    } catch (error) {
      results.push({ id: video.id, comments: [] });
    }
  }

  return results;
}

async function generateAnalysisWithGemini(topic, videos) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const transcripts = await fetchTranscriptsForVideos(videos);
  const comments = await fetchTopCommentsForVideos(videos);
  const payload = videos.slice(0, 10).map((video, index) => ({
    index: index + 1,
    title: video.title,
    description: video.description || '',
    transcript: transcripts[index]?.transcript || '',
    commentText: (comments[index]?.comments || []).join(' || ')
  }));

  const prompt = `You are a professional YouTube growth strategist and business analyst. Analyze this research data for the topic: "${topic}".
Videos details:
${payload.map((item) => `- Video #${item.index}: Title: "${item.title}" | Description: "${item.description}" ${item.transcript ? `| Transcript snippet: "${item.transcript}"` : ''} ${item.commentText ? `| Top comments: "${item.commentText}"` : ''}`).join('\n')}

Generate a comprehensive SaaS business analytics report for YouTube creators. You MUST return ONLY valid JSON with exactly the following keys and structure:
{
  "marketMetrics": {
    "opportunityScore": 75,
    "searchVolume": "High",
    "competition": "Medium",
    "cpmTier": "Premium"
  },
  "thumbnailStrategy": {
    "visualHook": "suggested visual focus/ideas",
    "colorPalette": "suggested dominant colors",
    "textOverlay": "suggested click-worthy overlay texts"
  },
  "creatorKit": {
    "highCtrTitles": ["title 1", "title 2", "title 3", "title 4", "title 5"],
    "introHookScript": "first 15 seconds intro speech script that hooks viewers",
    "seoDescription": "fully optimized video description template with placeholders",
    "seoTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
  },
  "audienceSentiment": {
    "score": 82,
    "breakdown": "brief summary of positive vs negative feedback"
  },
  "titleAnalysis": {
    "summary": "summary of title patterns",
    "recurringPhrases": ["phrase 1", "phrase 2", "phrase 3"]
  },
  "videoNarrativeBlueprint": {
    "summary": "summary of video narrative styles and flow patterns",
    "talkingPoints": ["point 1", "point 2", "point 3"]
  },
  "commentAnalysis": {
    "summary": "summary of comment insights",
    "questions": ["question 1", "question 2", "question 3"],
    "commonThemes": ["theme 1", "theme 2", "theme 3"]
  },
  "contentGaps": ["gap 1", "gap 2", "gap 3"],
  "recommendedContentAngles": ["angle 1", "angle 2", "angle 3"]
}`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    contents: prompt
  });

  const content = response.text || response.output?.[0]?.content || '';
  const parsed = parseJSONFromText(content);

  if (parsed) {
    let llmQuestions = [];
    try {
      llmQuestions = await buildRecurringQuestionsWithGemini(topic, comments);
    } catch (error) {
      llmQuestions = [];
    }

    const defaultMarketMetrics = {
      opportunityScore: Math.floor(Math.random() * 30) + 60,
      searchVolume: 'High',
      competition: 'Medium',
      cpmTier: 'Premium'
    };

    const defaultThumbnailStrategy = {
      visualHook: `Show a comparison between a standard workflow and an automated workflow using ${topic}.`,
      colorPalette: 'Deep Blue background with neon Yellow accents for high contrast.',
      textOverlay: `DO THIS FIRST! | 10x Faster | Stop Doing This`
    };

    const defaultCreatorKit = {
      highCtrTitles: [
        `How to 10x your workflow with ${topic} (Step-by-Step)`,
        `I tested every ${topic} tool... here is the winner`,
        `The ONLY ${topic} guide you will ever need in 2026`,
        `Stop doing it manually: The power of ${topic}`,
        `3 simple tricks to master ${topic} fast`
      ],
      introHookScript: `Are you still spending hours doing this manually? In this video, I will show you how to automate your entire workflow using ${topic} in under 5 minutes. Let's dive in!`,
      seoDescription: `In this video, we cover everything you need to know about ${topic}. Learn the top tips, common mistakes, and how to scale your workflow. \n\nTIMESTAMPS:\n0:00 Intro\n1:15 Step 1\n3:00 Step 2\n4:30 Summary`,
      seoTags: [topic, `${topic} tutorial`, `${topic} guide`, `productivity`, `creator tools`, `automation`]
    };

    const defaultAudienceSentiment = {
      score: 82,
      breakdown: `Mostly positive. Viewers are highly interested in practical step-by-step guides but raise minor questions regarding learning curves.`
    };

    return {
      marketMetrics: parsed.marketMetrics || defaultMarketMetrics,
      thumbnailStrategy: parsed.thumbnailStrategy || defaultThumbnailStrategy,
      creatorKit: parsed.creatorKit || defaultCreatorKit,
      audienceSentiment: parsed.audienceSentiment || defaultAudienceSentiment,
      titleAnalysis: parsed.titleAnalysis || {
        summary: `The most common title patterns around ${topic} focus on value, speed, and mistakes.`,
        recurringPhrases: extractTitleSignals(videos).slice(0, 6)
      },
      videoNarrativeBlueprint: parsed.videoNarrativeBlueprint || buildVideoNarrativeBlueprint(topic, videos),
      commentAnalysis: {
        summary: parsed.commentAnalysis?.summary || `The audience is looking for clarity, proof, and actionable next steps around ${topic}.`,
        questions: llmQuestions.length
          ? llmQuestions
          : (Array.isArray(parsed.commentAnalysis?.questions) && parsed.commentAnalysis.questions.length > 0
            ? parsed.commentAnalysis.questions.slice(0, 10)
            : [
              `How do I get started with ${topic} as a beginner?`,
              `What are the best free tools or alternatives for ${topic}?`,
              `Are there any common mistakes to avoid when using ${topic}?`,
              `How does ${topic} compare to other standard workflows?`
            ]),
        commonThemes: Array.isArray(parsed.commentAnalysis?.commonThemes) && parsed.commentAnalysis.commonThemes.length
          ? parsed.commentAnalysis.commonThemes
          : [`Beginner-friendly guidance for ${topic}`, `Cost vs value concerns`, `Need for practical examples`, `Comparison between tools or methods`]
      },
      contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : buildContentGaps(topic, videos),
      recommendedContentAngles: Array.isArray(parsed.recommendedContentAngles) ? parsed.recommendedContentAngles : [
        `Create a beginner guide to ${topic}`,
        `Publish a comparison video around ${topic}`,
        `Answer objections and mistakes people have about ${topic}`
      ]
    };
  }

  throw new Error('Gemini did not return usable JSON');
}

export async function generateResearchReport(topic = 'AI tools') {
  const normalizedTopic = normalizeTopic(topic);
  const videos = await searchYouTubeVideos(normalizedTopic);
  const topVideos = (videos || []).slice(0, 10).map((video, index) => ({
    rank: index + 1,
    title: video.title || `Video ${index + 1}`,
    channelTitle: video.channelTitle || 'Unknown creator',
    thumbnail: video.thumbnail || '',
    url: video.url || `https://www.youtube.com/watch?v=${video.id}`,
    reason: `Strong topic match for ${normalizedTopic}`
  }));

  const defaultMarketMetrics = {
    opportunityScore: 78,
    searchVolume: 'High',
    competition: 'Medium',
    cpmTier: 'Premium'
  };

  const defaultThumbnailStrategy = {
    visualHook: `Show a comparison between a standard workflow and an automated workflow using ${normalizedTopic}.`,
    colorPalette: 'Deep Blue background with neon Yellow accents for high contrast.',
    textOverlay: `DO THIS FIRST! | 10x Faster | Stop Doing This`
  };

  const defaultCreatorKit = {
    highCtrTitles: [
      `How to 10x your workflow with ${normalizedTopic} (Step-by-Step)`,
      `I tested every ${normalizedTopic} tool... here is the winner`,
      `The ONLY ${normalizedTopic} guide you will ever need in 2026`,
      `Stop doing it manually: The power of ${normalizedTopic}`,
      `3 simple tricks to master ${normalizedTopic} fast`
    ],
    introHookScript: `Are you still spending hours doing this manually? In this video, I will show you how to automate your entire workflow using ${normalizedTopic} in under 5 minutes. Let's dive in!`,
    seoDescription: `In this video, we cover everything you need to know about ${normalizedTopic}. Learn the top tips, common mistakes, and how to scale your workflow. \n\nTIMESTAMPS:\n0:00 Intro\n1:15 Step 1\n3:00 Step 2\n4:30 Summary`,
    seoTags: [normalizedTopic, `${normalizedTopic} tutorial`, `${normalizedTopic} guide`, `productivity`, `creator tools`, `automation`]
  };

  const defaultAudienceSentiment = {
    score: 82,
    breakdown: `Mostly positive. Viewers are highly interested in practical step-by-step guides but raise minor questions regarding learning curves.`
  };

  let analysis;
  try {
    analysis = await generateAnalysisWithGemini(normalizedTopic, videos);
  } catch (error) {
    analysis = {
      marketMetrics: defaultMarketMetrics,
      thumbnailStrategy: defaultThumbnailStrategy,
      creatorKit: defaultCreatorKit,
      audienceSentiment: defaultAudienceSentiment,
      titleAnalysis: {
        summary: `The most common title patterns around ${normalizedTopic} focus on value, speed, and mistakes.`,
        recurringPhrases: extractTitleSignals(videos).slice(0, 6)
      },
      videoNarrativeBlueprint: buildVideoNarrativeBlueprint(normalizedTopic, videos),
      commentAnalysis: buildCommentAnalysis(normalizedTopic, videos, []),
      contentGaps: buildContentGaps(normalizedTopic, videos),
      recommendedContentAngles: [
        `Create a beginner guide to ${normalizedTopic}`,
        `Publish a comparison video around ${normalizedTopic}`,
        `Answer objections and mistakes people have about ${normalizedTopic}`
      ]
    };
  }

  return {
    topic: normalizedTopic,
    overview: `This research report summarizes the current conversation around ${normalizedTopic} and highlights what the audience is asking for most.`,
    topVideos,
    marketMetrics: analysis.marketMetrics || defaultMarketMetrics,
    thumbnailStrategy: analysis.thumbnailStrategy || defaultThumbnailStrategy,
    creatorKit: analysis.creatorKit || defaultCreatorKit,
    audienceSentiment: analysis.audienceSentiment || defaultAudienceSentiment,
    titleAnalysis: analysis.titleAnalysis,
    videoNarrativeBlueprint: analysis.videoNarrativeBlueprint,
    commentAnalysis: analysis.commentAnalysis,
    contentGaps: analysis.contentGaps,
    recommendedContentAngles: analysis.recommendedContentAngles,
    generatedAt: new Date().toISOString()
  };
}
