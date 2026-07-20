import { useState } from 'react';

const PRESET_DEMOS = {
  'AI Tools': {
    topic: 'Best AI Tools in 2026',
    metrics: { opportunityScore: 88, searchVolume: 'High', competition: 'Medium', cpmTier: 'Premium ($18-$28 CPM)' },
    sentiment: { score: 86, breakdown: '86% viewers expressed strong interest in workflow automation and free AI tools.' },
    topVideos: [
      { rank: 1, title: 'Top 10 AI Tools That Will Replace Coding in 2026', channelTitle: 'TechVisions' },
      { rank: 2, title: 'I Tested 50 AI Apps So You Don’t Have To', channelTitle: 'Productivity Hacker' },
      { rank: 3, title: 'The Future of AI: Tools You Must Master Today', channelTitle: 'Future Lab' }
    ],
    thumb: {
      visualHook: 'Split screen comparing manual work vs robot hands with glowing futuristic interface.',
      colorPalette: 'Deep Cyan (#0ea5e9), Electric Blue (#3b82f6), Neon Green (#22c55e)',
      textOverlay: 'DO NOT IGNORE THIS | 2026 AI TOOLS'
    },
    kit: {
      highCtrTitles: [
        'I Tested 50 AI Tools in 24 Hours (Only 5 Are Worth It)',
        '10 Insane AI Tools You Need to Try BEFORE 2027',
        'Stop Using ChatGPT: 7 Next-Gen AI Tools That Feel Illegal'
      ],
      introHookScript: 'In the next 8 minutes, I am going to reveal 5 AI tools that saved me over 30 hours of work this week alone. Number 4 will completely change how you create videos...',
      seoDescription: 'Discover the top AI tools driving productivity and creator automation in 2026. Learn how to save hours every day with these cutting-edge artificial intelligence platforms.\n\nCHAPTERS:\n0:00 - Intro\n1:15 - AI Tool #1\n3:40 - AI Tool #2\n6:10 - Game Changing Secret\n\n#AITools #Productivity #Tech2026',
      seoTags: ['ai tools 2026', 'best artificial intelligence apps', 'productivity hacks', 'future tech', 'chatgpt alternatives', 'ai video generators']
    },
    questions: [
      'Are these AI tools completely free or freemium?',
      'Which AI tool is safest for commercial client work?',
      'How do I integrate this into my existing editing software?'
    ],
    gaps: [
      'Lack of step-by-step setup guides for complete beginners',
      'Missing honest pricing breakdowns and hidden subscription costs'
    ]
  },
  'Productivity Hacks': {
    topic: 'Ultimate Productivity Systems for Creators',
    metrics: { opportunityScore: 82, searchVolume: 'High', competition: 'Medium', cpmTier: 'High ($12-$20 CPM)' },
    sentiment: { score: 79, breakdown: '79% viewers suffer from burnout and seek simple, zero-fluff daily routines.' },
    topVideos: [
      { rank: 1, title: 'How I Plan My Life in Notion (2026 Setup)', channelTitle: 'Mindset Daily' },
      { rank: 2, title: 'The 4-Hour Focus Method for Deep Work', channelTitle: 'Peak Performance' }
    ],
    thumb: {
      visualHook: 'High contrast timer ticking down next to organized desk setup with red alert badge.',
      colorPalette: 'Warm Amber (#f59e0b), Dark Slate (#0f172a), Crisp White (#ffffff)',
      textOverlay: 'FIX YOUR DAY | 4-HOUR METHOD'
    },
    kit: {
      highCtrTitles: [
        'How I Get 10 Hours of Work Done in 3 Hours (My Exact System)',
        'The Only Productivity System You Will Ever Need in 2026',
        'Why You Are Always Tired & How to Fix It in 48 Hours'
      ],
      introHookScript: 'If you feel like you are working 12 hours a day but getting nothing done, it is NOT your fault. You are using an outdated daily system. Here is what top 1% creators do instead...',
      seoDescription: 'Master the ultimate deep work productivity framework. Say goodbye to burnout and learn how to double your daily output with half the effort.\n\n#Productivity #TimeManagement #DeepWork',
      seoTags: ['productivity hacks', 'deep work system', 'time management', 'focus tips', 'notion setup 2026']
    },
    questions: [
      'How do you stay consistent when you lack motivation?',
      'What apps do you use for daily habit tracking?'
    ],
    gaps: [
      'Real-world examples for people with full-time jobs',
      'Actionable daily templates instead of theoretical advice'
    ]
  },
  'Finance & Crypto': {
    topic: 'Passive Income & Investing Strategies 2026',
    metrics: { opportunityScore: 94, searchVolume: 'Very High', competition: 'High', cpmTier: 'Ultra High ($35-$50 CPM)' },
    sentiment: { score: 91, breakdown: '91% viewers seeking high-yield passive income with low initial capital.' },
    topVideos: [
      { rank: 1, title: '7 Passive Income Streams That Pay $100/Day', channelTitle: 'Financial Freedom' },
      { rank: 2, title: 'How to Invest $1,000 in 2026 (Step-by-Step)', channelTitle: 'Smart Money' }
    ],
    thumb: {
      visualHook: 'Glowing chart arrow breaking through ceiling with clean stack of currency visual.',
      colorPalette: 'Emerald Green (#10b981), Dark Navy (#020617), Gold (#eab308)',
      textOverlay: '$100/DAY | PASSIVE INCOME'
    },
    kit: {
      highCtrTitles: [
        'How to Make $100/Day Passive Income (Even As a Beginner)',
        '7 Passive Income Streams That Require $0 to Start in 2026',
        'Do THIS With Your Next $1,000 (Don’t Buy Index Funds Yet)'
      ],
      introHookScript: 'Most passive income advice on YouTube is completely fake. Today, I am showing you 3 real revenue streams with proof, numbers, and my exact monthly payout statements...',
      seoDescription: 'Build sustainable passive income streams in 2026. Full breakdown of realistic investment strategies for beginners.\n\n#PassiveIncome #Investing #FinancialFreedom',
      seoTags: ['passive income 2026', 'investing for beginners', 'how to make money online', 'cpm finance', 'wealth building']
    },
    questions: [
      'What is the minimum starting capital needed for stream #2?',
      'How are these income streams taxed in the US/EU?'
    ],
    gaps: [
      'Transparent disclosure of risk factors and setup timelines',
      'No-hype realistic calculation breakdowns'
    ]
  }
};

export default function LandingPage({ onLaunchApp, onOpenAuth }) {
  const [selectedDemoKey, setSelectedDemoKey] = useState('AI Tools');
  const [activeTab, setActiveTab] = useState('metrics');
  const [copiedKey, setCopiedKey] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const demoData = PRESET_DEMOS[selectedDemoKey];

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!feedbackEmail || !feedbackMessage) {
      setFeedbackError('Please provide both your email address and a message.');
      return;
    }

    setFeedbackSubmitting(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          rating: feedbackRating,
          category: feedbackCategory,
          message: feedbackMessage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setFeedbackSuccess(data.message || 'Feedback sent successfully!');
        setFeedbackName('');
        setFeedbackEmail('');
        setFeedbackMessage('');
        setFeedbackRating(5);
      } else {
        setFeedbackError(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setFeedbackError('Could not reach backend server. Please make sure server is running.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* 1. Header Navigation */}
      <header className="landing-nav">
        <div className="nav-container">
          <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-icon">⚡</span>
            <span className="logo-title">YouTube Research Agent</span>
          </div>

          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#playground">Live Demo</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#feedback">Feedback</a>
          </nav>

          <div className="nav-actions">
            <button className="nav-login-btn" onClick={() => onOpenAuth(false)}>
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge-pill">
          <span className="sparkle">✨</span> Powered by YouTube API & AI Data Intelligence
        </div>
        <h1 className="hero-title">
          Turn YouTube Trends into <span className="gradient-text">High-CTR, Viral Hits</span>
        </h1>
        <p className="hero-subtitle">
          Stop guessing content ideas. Analyze high-CPM opportunity scores, extract competitor blueprints,
          generate retention-engineered 15-second intro scripts, and optimize thumbnail formulas in seconds.
        </p>

        <div className="hero-cta-group">
          <button className="hero-primary-btn" onClick={() => onLaunchApp()}>
            Start Free Research Agent 🚀
          </button>
          <a href="#playground" className="hero-secondary-btn">
            Test Interactive Demo 👇
          </a>
        </div>

        <div className="hero-trust-bar">
          <div className="trust-item">
            <strong>10,000+</strong> Channels Researched
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <strong>3.4x</strong> Higher Average CTR
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <strong>98.4%</strong> Retention Hook Optimization
          </div>
        </div>
      </section>

      {/* 3. Interactive Hero Playground / Demo Card */}
      <section id="playground" className="playground-section">
        <div className="section-header">
          <span className="section-tag">Interactive Preview</span>
          <h2>Experience the Research Agent Live</h2>
          <p>Click any trending topic below to preview how our AI agent extracts market signals and creates creator blueprints.</p>
        </div>

        <div className="preset-chips">
          {Object.keys(PRESET_DEMOS).map((key) => (
            <button
              key={key}
              className={`chip-btn ${selectedDemoKey === key ? 'active' : ''}`}
              onClick={() => setSelectedDemoKey(key)}
            >
              🔥 {key}
            </button>
          ))}
        </div>

        {/* Demo Report Card Container */}
        <div className="demo-report-card">
          <div className="demo-card-header">
            <div>
              <span className="demo-live-indicator">LIVE REPORT DEMO</span>
              <h3 className="demo-topic-title">{demoData.topic}</h3>
            </div>
            <button className="demo-unlock-btn" onClick={() => onLaunchApp()}>
              Unlock Full Custom Report 🔓
            </button>
          </div>

          {/* Tab headers */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              📊 Market Intelligence
            </button>
            <button
              className={`tab-btn ${activeTab === 'competitors' ? 'active' : ''}`}
              onClick={() => setActiveTab('competitors')}
            >
              🎥 Competitor Blueprint
            </button>
            <button
              className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              🛠️ Creator SEO & Hook Kit
            </button>
            <button
              className={`tab-btn ${activeTab === 'audience' ? 'active' : ''}`}
              onClick={() => setActiveTab('audience')}
            >
              👥 Audience Research
            </button>
          </div>

          {/* Tab 1: Market Intelligence */}
          {activeTab === 'metrics' && (
            <div className="tab-content">
              <div className="metrics-row">
                <div className="metric-box">
                  <span className="metric-label">Opportunity Score</span>
                  <span className="metric-value">{demoData.metrics.opportunityScore}/100</span>
                  <span className="score-badge score-high">High Potential</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Search Volume</span>
                  <span className="metric-value" style={{ color: '#60a5fa' }}>{demoData.metrics.searchVolume}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Competition</span>
                  <span className="metric-value" style={{ color: '#facc15' }}>{demoData.metrics.competition}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Monetization Tier</span>
                  <span className="metric-value" style={{ color: '#a5b4fc', fontSize: '1.2rem' }}>{demoData.metrics.cpmTier}</span>
                </div>
              </div>

              <div className="strategy-card">
                <h4 style={{ margin: '0 0 0.5rem', color: '#4ade80', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  Audience Sentiment Index
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                    {demoData.sentiment.score}%
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${demoData.sentiment.score}%` }}></div>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      {demoData.sentiment.breakdown}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Competitors */}
          {activeTab === 'competitors' && (
            <div className="tab-content">
              <h4 style={{ margin: '0 0 0.75rem', color: '#93c5fd' }}>Top YouTube Competitor Benchmarks</h4>
              {demoData.topVideos.map((video) => (
                <div key={video.rank} className="competitor-list-item">
                  <span className="competitor-rank">{video.rank}</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', color: '#f8fafc' }}>{video.title}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{video.channelTitle}</span>
                  </div>
                  <span className="tag-pill">Top Ranking</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Creator SEO & Hooks */}
          {activeTab === 'seo' && (
            <div className="tab-content">
              <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>Thumbnail Visual Strategy</h4>
              <div className="metrics-row" style={{ marginBottom: '1.5rem' }}>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#818cf8' }}>Visual Concept</span>
                  <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>{demoData.thumb.visualHook}</span>
                </div>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#fb7185' }}>Color Palette</span>
                  <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>{demoData.thumb.colorPalette}</span>
                </div>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#fb923c' }}>Text Overlays</span>
                  <code style={{ fontSize: '0.95rem', color: '#fed7aa', fontWeight: 'bold' }}>{demoData.thumb.textOverlay}</code>
                </div>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.75rem', color: '#60a5fa' }}>High-CTR Engineered Titles</h4>
              {demoData.kit.highCtrTitles.map((title, idx) => (
                <div key={idx} className="copier-box">
                  <span className="copier-text"><strong>{idx + 1}.</strong> {title}</span>
                  <button
                    className={`action-btn ${copiedKey === `demo-title-${idx}` ? 'copied' : ''}`}
                    onClick={() => handleCopy(title, `demo-title-${idx}`)}
                  >
                    {copiedKey === `demo-title-${idx}` ? 'Copied!' : 'Copy Title'}
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#a78bfa' }}>15-Second Retention Intro Hook Script</h4>
                <div className="script-preview-box">
                  "{demoData.kit.introHookScript}"
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Audience Research */}
          {activeTab === 'audience' && (
            <div className="tab-content">
              <div className="report-grid">
                <div>
                  <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem' }}>Recurring Audience Questions</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    {demoData.questions.map((q, i) => (
                      <li key={i} style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#facc15', margin: '0 0 0.5rem' }}>Unserved Content Gaps</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    {demoData.gaps.map((g, i) => (
                      <li key={i} style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Core Features Showcase Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Powerful Features</span>
          <h2>Everything You Need to Scale Your Channel</h2>
          <p>Built specifically for creators, agencies, and YouTube strategists looking for data-backed growth.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Opportunity Score & CPM Intelligence</h3>
            <p>
              Instantly calculate niche viability (0-100 score), competition intensity, search volume,
              and estimated ad CPM monetization potential before spending days creating a video.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Competitor Narrative Blueprinting</h3>
            <p>
              Analyze active top-ranking videos for any keyword. Extract structural talking points,
              key narrative arcs, and video flow designed to hold viewer retention.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>15-Second Retention Hook Generator</h3>
            <p>
              The first 15 seconds decide if a viewer stays or leaves. Generate scripted retention hooks
              engineered specifically to eliminate viewer drop-off.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Thumbnail Framework & Color Pairing</h3>
            <p>
              Get tailored visual concepts, high-contrast text overlay recommendations, and optimal color palette
              formulas designed to stand out on the YouTube home feed.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Comment Question & Gap Mining</h3>
            <p>
              AI scans audience discussions to highlight recurring unanswered questions and unserved niche subtopics
              that competitors missed.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>1-Click High-CTR Creator SEO Kit</h3>
            <p>
              Generate click-baity titles, structured description templates, and batch SEO tags with 1-click clipboard
              copying for instant upload to YouTube Studio.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <span className="section-tag">Simple 3-Step Process</span>
          <h2>How YouTube Research Agent Works</h2>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Input Topic or Keyword</h3>
            <p>Type any niche, video title idea, or keyword you plan to cover on your channel.</p>
          </div>

          <div className="step-arrow">➔</div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>AI Data & Sentiment Extraction</h3>
            <p>Our agent queries YouTube APIs, top competitor rankings, and viewer comment signals.</p>
          </div>

          <div className="step-arrow">➔</div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Copy Blueprints & Launch</h3>
            <p>Copy high-CTR titles, retention scripts, and thumbnail ideas to film your next viral video.</p>
          </div>
        </div>
      </section>

      {/* 6. Comparison Table */}
      <section className="comparison-section">
        <div className="section-header">
          <span className="section-tag">Why Choose Us</span>
          <h2>Manual Research vs YouTube Research Agent</h2>
        </div>

        <div className="table-responsive">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Manual YouTube Research</th>
                <th className="highlight-col">YouTube Research Agent SaaS ⚡</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Research Time per Video</td>
                <td className="red-text">3 - 5 Hours</td>
                <td className="green-text">Under 30 Seconds</td>
              </tr>
              <tr>
                <td>Competitor Outline Breakdown</td>
                <td className="red-text">Manual video watching & taking notes</td>
                <td className="green-text">Automated Narrative Talking Points</td>
              </tr>
              <tr>
                <td>Title Hook Engineering</td>
                <td className="red-text">Guesswork & trial and error</td>
                <td className="green-text">3 High-CTR Data-Backed Titles</td>
              </tr>
              <tr>
                <td>First 15-Sec Script Hook</td>
                <td className="red-text">Often boring or slow intro</td>
                <td className="green-text">Scripted High-Retention Script</td>
              </tr>
              <tr>
                <td>Thumbnail Visual Formula</td>
                <td className="red-text">Random design choices</td>
                <td className="green-text">Tailored Color & Overlay Framework</td>
              </tr>
              <tr>
                <td>Monetization & CPM Insights</td>
                <td className="red-text">Unknown until monetized</td>
                <td className="green-text">Estimated CPM & Opportunity Score</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <span className="section-tag">Flexible SaaS Pricing</span>
          <h2>Simple, Transparent Plans for Every Creator</h2>
          <p>Choose the plan that fits your production schedule. Cancel anytime.</p>

          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <button
              className="toggle-switch"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            >
              <span className={`toggle-knob ${billingCycle === 'annual' ? 'annual-active' : ''}`}></span>
            </button>
            <span className={billingCycle === 'annual' ? 'active' : ''}>Annual (Save 20% 🎉)</span>
          </div>
        </div>

        <div className="pricing-grid">
          {/* Starter */}
          <div className="price-card">
            <div className="price-header">
              <h3>Starter</h3>
              <p>For beginner creators exploring niche ideas</p>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">0</span>
                <span className="period">/ forever</span>
              </div>
            </div>
            <ul className="price-features">
              <li>✔️ 3 Free Research Reports / Day</li>
              <li>✔️ Basic Opportunity Score (0-100)</li>
              <li>✔️ Competitor Top 5 Videos</li>
              <li>✔️ Starter AI Research Access</li>
              <li>❌ 15s Retention Hook Script</li>
              <li>❌ High-CTR Thumbnail Strategy</li>
            </ul>
            <button className="price-btn secondary" onClick={() => onLaunchApp()}>
              Get Started Free
            </button>
          </div>

          {/* Pro Creator (Featured) */}
          <div className="price-card featured">
            <div className="popular-badge">MOST POPULAR</div>
            <div className="price-header">
              <h3>Creator Pro</h3>
              <p>For active YouTubers seeking channel growth</p>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">{billingCycle === 'monthly' ? '19' : '15'}</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="price-features">
              <li>✔️ Unlimited Research Reports</li>
              <li>✔️ Opportunity Score & CPM Tiering</li>
              <li>✔️ Full Competitor Blueprints & Outlines</li>
              <li>✔️ 15-Second Intro Retention Hook Script</li>
              <li>✔️ High-CTR Title Generator & 1-Click Copy</li>
              <li>✔️ Thumbnail Visual & Color Framework</li>
              <li>✔️ Audience Comment Question Mining</li>
            </ul>
            <button className="price-btn primary" onClick={() => onLaunchApp()}>
              Start Pro Trial 🚀
            </button>
          </div>

          {/* Agency & Studio */}
          <div className="price-card">
            <div className="price-header">
              <h3>Agency & Studio</h3>
              <p>For media teams managing multiple channels</p>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">{billingCycle === 'monthly' ? '49' : '39'}</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="price-features">
              <li>✔️ Everything in Creator Pro</li>
              <li>✔️ Up to 5 Team Member Seats</li>
              <li>✔️ Priority Fast AI Server Processing</li>
              <li>✔️ Export Reports to PDF & CSV</li>
              <li>✔️ Custom CPM & Niche Filters</li>
              <li>✔️ Dedicated Priority Support</li>
            </ul>
            <button className="price-btn secondary" onClick={() => onLaunchApp()}>
              Contact Sales / Try Studio
            </button>
          </div>
        </div>
      </section>

      {/* 9. FAQ Accordion Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <span className="section-tag">Got Questions?</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-container">
          {[
            {
              q: 'How does YouTube Research Agent calculate Opportunity Scores?',
              a: 'Our algorithm combines live search volume, competition density, viewer sentiment index, and monetization CPM tiers to give each topic a clear 0-100 opportunity rating.'
            },
            {
              q: 'What is the 15-Second Intro Retention Hook Script?',
              a: 'YouTube metrics prove that the first 15 seconds determine your video retention rate. Our AI formats an attention-grabbing opening script tailored specifically to your chosen topic.'
            },
            {
              q: 'Can I export the SEO tags and titles to YouTube Studio?',
              a: 'Absolutely. Every title option, intro script, description template, and tag list features a 1-click "Copy" button formatted for direct pasting into YouTube Studio.'
            },
            {
              q: 'Can I cancel my subscription at any time?',
              a: 'Yes, there are no long-term contracts. You can upgrade, downgrade, or cancel your account anytime directly from your dashboard.'
            }
          ].map((item, idx) => (
            <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                <span className="faq-icon">{openFaqIndex === idx ? '−' : '+'}</span>
              </button>
              {openFaqIndex === idx && (
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. Feedback Section */}
      <section id="feedback" className="feedback-section">
        <div className="section-header">
          <span className="section-tag">Your Voice Matters</span>
          <h2>Send Us Your Feedback</h2>
          <p>Have a feature request, question, or suggestion? Submit your thoughts and our team will receive an email via Nodemailer.</p>
        </div>

        <div className="feedback-card">
          {feedbackSuccess && (
            <div className="feedback-alert success">
              <span>✅</span> {feedbackSuccess}
            </div>
          )}

          {feedbackError && (
            <div className="feedback-alert error">
              <span>⚠️</span> {feedbackError}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="feedback-form">
            <div className="rating-picker-row">
              <label>Rate Your Experience:</label>
              <div className="stars-group">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-btn ${feedbackRating >= star ? 'active' : ''}`}
                    onClick={() => setFeedbackRating(star)}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">
                  {feedbackRating === 5 && '😍 Excellent'}
                  {feedbackRating === 4 && '😀 Great'}
                  {feedbackRating === 3 && '🙂 Good'}
                  {feedbackRating === 2 && '😐 Fair'}
                  {feedbackRating === 1 && '🙁 Needs Improvement'}
                </span>
              </div>
            </div>

            <div className="feedback-form-grid">
              <div className="form-group">
                <label htmlFor="fb-name">Your Name</label>
                <input
                  id="fb-name"
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fb-email">Your Email Address *</label>
                <input
                  id="fb-email"
                  type="email"
                  placeholder="name@example.com"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="fb-category">Feedback Category</label>
                <select
                  id="fb-category"
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                >
                  <option value="Feature Request">💡 Feature Request</option>
                  <option value="Bug Report">🐛 Bug Report</option>
                  <option value="General Feedback">💬 General Feedback</option>
                  <option value="Pricing Inquiry">💰 Pricing Inquiry</option>
                  <option value="Strategic Partnership">🤝 Strategic Partnership</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="fb-message">Your Feedback / Message *</label>
                <textarea
                  id="fb-message"
                  rows="4"
                  placeholder="Tell us what features you want or what we can improve..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="feedback-submit-btn" disabled={feedbackSubmitting}>
              {feedbackSubmitting ? 'Sending Email via Nodemailer...' : 'Send Feedback ✉️'}
            </button>
          </form>
        </div>
      </section>

      {/* 11. CTA Banner & Footer */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2>Ready to Supercharge Your YouTube Channel?</h2>
          <p>Join thousands of creators using data-backed AI insights to produce top-performing videos.</p>
          <button className="cta-banner-btn" onClick={() => onLaunchApp()}>
            Get Started Now - It’s Free 🚀
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-title">YouTube Research Agent</span>
            </div>
            <p>Empowering video creators with AI-driven market intelligence & viral strategy tools.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#playground">Live Demo</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">FAQ</a>
              <a href="#feedback">Feedback</a>
            </div>
            <div className="footer-col">
              <h4>System Status</h4>
              <div className="status-badge">
                <span className="status-dot"></span> All Systems Operational
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} YouTube Research Agent SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
