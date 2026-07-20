import { useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth';
import LandingPage from './LandingPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [topic, setTopic] = useState('');
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');
  const [copiedKey, setCopiedKey] = useState('');
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'auth' | 'dashboard'

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey('');
    }, 2000);
  };

  // Monitor Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setViewMode('dashboard');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      setUser(null);
    }
    setViewMode('landing');
  };

  const handleLaunchApp = () => {
    if (user) {
      setViewMode('dashboard');
    } else {
      setViewMode('auth');
    }
  };

  const runResearch = async (event) => {
    event.preventDefault();
    setReportLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const nextReport = await response.json();
      setReport(nextReport);
      setActiveTab('metrics'); // Default to metrics tab on new search
    } catch (error) {
      setReport({ topic, overview: 'Unable to generate a report right now. Please try again later.' });
    } finally {
      setReportLoading(false);
    }
  };

  if (authLoading) {
    return <div className="loading-state">Loading user session...</div>;
  }

  // 1. Landing / Home Page view
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onLaunchApp={handleLaunchApp}
        onOpenAuth={() => setViewMode('auth')}
      />
    );
  }

  // 2. Auth view (if unauthenticated and chosen)
  if (viewMode === 'auth' && !user) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ padding: '1rem 2rem', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
          <button
            className="ghost-button"
            onClick={() => setViewMode('landing')}
            style={{ fontSize: '0.85rem' }}
          >
            ← Back to Home Page
          </button>
        </div>
        <Auth onMockLogin={(mockUser) => {
          setUser(mockUser);
          setViewMode('dashboard');
        }} />
      </div>
    );
  }

  // Safe variables for reports
  const metrics = report?.marketMetrics || { opportunityScore: 70, searchVolume: 'Medium', competition: 'Medium', cpmTier: 'Standard' };
  const thumb = report?.thumbnailStrategy || { visualHook: '', colorPalette: '', textOverlay: '' };
  const kit = report?.creatorKit || { highCtrTitles: [], introHookScript: '', seoDescription: '', seoTags: [] };
  const sentiment = report?.audienceSentiment || { score: 75, breakdown: '' };

  const getScoreClass = (score) => {
    if (score >= 75) return 'score-high';
    if (score >= 45) return 'score-med';
    return 'score-low';
  };

  return (
    <div className="app">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            className="ghost-button"
            onClick={() => setViewMode('landing')}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            🌐 View Home Page
          </button>

          <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
            Logged in as: <strong style={{ color: '#f8fafc' }}>{user.email}</strong>
          </span>
        </div>
        <button
          className="ghost-button"
          onClick={handleSignOut}
          style={{
            padding: '0.5rem 1.1rem',
            fontSize: '0.85rem',
            borderRadius: '999px'
          }}
        >
          Sign Out
        </button>
      </header>

      <h1>YouTube Research Agent</h1>
      <p>Enter a topic and generate a research report from YouTube data with AI-powered analysis.</p>

      <form className="search-form" onSubmit={runResearch}>
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Search topic like AI tools or productivity hacks"
        />
        <button type="submit" disabled={reportLoading}>
          {reportLoading ? 'Researching...' : 'Generate Report'}
        </button>
      </form>

      {reportLoading ? (
        <p>Loading research report...</p>
      ) : null}

      {report ? (
        <section className="report-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#ffffff' }}>{report.topic} Insights</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>{report.overview}</p>
            </div>
            {report.generatedAt && (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Generated: {new Date(report.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Tab Navigation */}
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
              🎥 Competitor Analysis ({report.topVideos?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              🛠️ Creator SEO Kit
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
            <div>
              <div className="metrics-row">
                <div className="metric-box">
                  <span className="metric-label">Opportunity Score</span>
                  <span className="metric-value">{metrics.opportunityScore}/100</span>
                  <span className={`score-badge ${getScoreClass(metrics.opportunityScore)}`}>
                    {metrics.opportunityScore >= 75 ? 'Excellent' : metrics.opportunityScore >= 50 ? 'Good' : 'High Competition'}
                  </span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Search Volume</span>
                  <span className="metric-value" style={{ color: '#60a5fa' }}>{metrics.searchVolume}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Competition</span>
                  <span className="metric-value" style={{ color: metrics.competition === 'Low' ? '#4ade80' : metrics.competition === 'Medium' ? '#facc15' : '#f87171' }}>
                    {metrics.competition}
                  </span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">CPM potential</span>
                  <span className="metric-value" style={{ color: '#a5b4fc' }}>{metrics.cpmTier}</span>
                </div>
              </div>

              <div className="strategy-card" style={{ borderLeftColor: '#10b981' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#10b981', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  Audience Sentiment Index
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', minWidth: '80px' }}>
                    {sentiment.score}%
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${sentiment.score}%` }}></div>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      {sentiment.breakdown}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Competitors */}
          {activeTab === 'competitors' && (
            <div>
              <div className="report-grid">
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginTop: 0 }}>Top Ranking Videos for "{report.topic}"</h3>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    Analyze these active ranking benchmarks to study their structure, timing, and engagement signals.
                  </p>
                  <div>
                    {report.topVideos?.map((video) => (
                      <div key={`${video.rank}-${video.title}`} className="competitor-list-item">
                        <span className="competitor-rank">{video.rank}</span>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.95rem' }}>{video.title}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{video.channelTitle}</span>
                        </div>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          Watch Video
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', marginTop: 0 }}>Video Narrative Blueprint</h3>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    {report.videoNarrativeBlueprint?.summary}
                  </p>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {report.videoNarrativeBlueprint?.talkingPoints?.map((point, i) => (
                      <li key={i} style={{ color: '#cbd5e1', marginBottom: '0.55rem', fontSize: '0.9rem' }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Creator SEO Kit */}
          {activeTab === 'seo' && (
            <div>
              {/* Thumbnail strategy */}
              <h3 style={{ fontSize: '1.2rem', marginTop: 0 }}>Thumbnail Design Framework</h3>
              <div className="metrics-row" style={{ marginBottom: '2rem' }}>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#818cf8' }}>Visual Concept</span>
                  <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{thumb.visualHook}</span>
                </div>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#fb7185' }}>Color Palette</span>
                  <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{thumb.colorPalette}</span>
                </div>
                <div className="metric-box" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span className="metric-label" style={{ color: '#fb923c' }}>Text Overlays</span>
                  <code style={{ fontSize: '1rem', color: '#fed7aa', fontWeight: 'bold' }}>
                    {Array.isArray(thumb.textOverlay)
                      ? thumb.textOverlay.join(' | ')
                      : (thumb.textOverlay || '').split('|').map(s => s.trim()).join(' | ')}
                  </code>
                </div>
              </div>

              {/* Title ideas */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Optimized High-CTR Title Options</h3>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                  These titles utilize standard hook formulas engineered for high click-through-rates.
                </p>
                {kit.highCtrTitles?.map((title, index) => (
                  <div key={index} className="copier-box">
                    <span className="copier-text"><strong>{index + 1}.</strong> {title}</span>
                    <button
                      className={`action-btn ${copiedKey === `title-${index}` ? 'copied' : ''}`}
                      onClick={() => handleCopy(title, `title-${index}`)}
                    >
                      {copiedKey === `title-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Hook Script */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>The 15-Second Intro Hook</h3>
                  <button
                    className={`action-btn ${copiedKey === 'hook-script' ? 'copied' : ''}`}
                    onClick={() => handleCopy(kit.introHookScript, 'hook-script')}
                  >
                    {copiedKey === 'hook-script' ? 'Copied Script!' : 'Copy Script'}
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.25rem 0 0.75rem' }}>
                  A script designed to grab immediate viewer attention and maximize retention.
                </p>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  fontStyle: 'italic',
                  color: '#e2e8f0',
                  lineHeight: '1.5'
                }}>
                  "{kit.introHookScript}"
                </div>
              </div>

              {/* Description & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Description Template</h3>
                    <button
                      className={`action-btn ${copiedKey === 'desc' ? 'copied' : ''}`}
                      onClick={() => handleCopy(kit.seoDescription, 'desc')}
                    >
                      {copiedKey === 'desc' ? 'Copied!' : 'Copy Template'}
                    </button>
                  </div>
                  <pre style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>{kit.seoDescription}</pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>SEO Tags ({kit.seoTags?.length || 0})</h3>
                    {kit.seoTags?.length > 0 && (
                      <button
                        className={`action-btn ${copiedKey === 'tags' ? 'copied' : ''}`}
                        onClick={() => handleCopy(kit.seoTags.join(', '), 'tags')}
                      >
                        {copiedKey === 'tags' ? 'Tags Copied!' : 'Copy Tags List'}
                      </button>
                    )}
                  </div>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    minHeight: '200px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {kit.seoTags?.map((tag) => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Audience Research */}
          {activeTab === 'audience' && (
            <div>
              <div className="report-grid">
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Most Recurring Questions</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0.75rem' }}>
                    Critical pain points compiled from comments on top-performing videos:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {report.commentAnalysis?.questions?.map((question, i) => (
                      <li key={i} style={{ color: '#cbd5e1', marginBottom: '0.55rem', fontSize: '0.9rem' }}>
                        {question}
                      </li>
                    ))}
                    {(!report.commentAnalysis?.questions || report.commentAnalysis.questions.length === 0) && (
                      <li style={{ color: '#94a3b8', fontStyle: 'italic', listStyleType: 'none', marginLeft: '-1.25rem' }}>
                        No recurring questions identified.
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Content Gaps & Opportunities</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0.75rem' }}>
                    Demands of the audience that are currently under-served by existing creators:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {report.contentGaps?.map((gap, i) => (
                      <li key={i} style={{ color: '#cbd5e1', marginBottom: '0.55rem', fontSize: '0.9rem' }}>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Recommended Creator Angles</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0.75rem' }}>
                  Direct conceptual angles you can use to frame your video scripts:
                </p>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {report.recommendedContentAngles?.map((angle, i) => (
                    <li key={i} style={{ color: '#cbd5e1', marginBottom: '0.55rem', fontSize: '0.9rem' }}>
                      {angle}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      ) : null}

    </div>
  );
}

export default App;
