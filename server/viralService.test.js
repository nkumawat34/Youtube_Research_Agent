import test from 'node:test';
import assert from 'node:assert/strict';
import { getViralVideos, generateResearchReport } from './viralService.js';

test('getViralVideos returns a list of viral video cards', async () => {
  const data = await getViralVideos();
  assert.ok(Array.isArray(data.videos));
  assert.ok(data.videos.length > 0);
  assert.ok(data.videos[0].title);
});

test('generateResearchReport creates a structured report', async () => {
  const report = await generateResearchReport('AI tools');
  assert.equal(report.topic, 'AI tools');
  assert.ok(Array.isArray(report.topVideos));
  assert.ok(report.topVideos.length > 0);
  assert.ok(Array.isArray(report.commentAnalysis.questions));
  assert.ok(report.commentAnalysis.questions.length > 0);
  assert.ok(Array.isArray(report.contentGaps));
  assert.ok(report.contentGaps.length > 0);
});
