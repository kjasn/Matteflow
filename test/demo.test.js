import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAppHtml,
  DEMO_WRAP_DEFAULTS,
  getLinePresentation,
  syncReferenceVideo,
} from '../src/demo.js';

test('renders controls for local video input and wrap tuning', () => {
  const html = buildAppHtml();
  assert.match(html, /Choose video/i);
  assert.match(html, /type="file"/);
  assert.match(html, /Wrap strength/i);
  assert.match(html, /Play/i);
  assert.match(html, /Volume/i);
  assert.match(html, /Wrap distance/i);
  assert.match(html, /Wrap follow/i);
  assert.match(html, /Cut threshold/i);
  assert.match(html, /Soft edge/i);
  assert.match(html, /<canvas[^>]+data-role="stage-canvas"/i);
  assert.match(html, /data-role="reference-panel"/i);
  assert.match(html, /data-role="reference-video"/i);
  assert.match(
    html,
    /<section class="paper"[\s\S]*data-role="reference-panel"[\s\S]*data-role="reference-video"[\s\S]*<\/section>/i,
  );
  assert.doesNotMatch(html, /video-placeholder/i);
  assert.doesNotMatch(html, /Choose a local portrait-style video/i);
});

test('uses moderate wrap defaults instead of overly tight spacing', () => {
  assert.equal(DEMO_WRAP_DEFAULTS.gutter, 9);
  assert.equal(DEMO_WRAP_DEFAULTS.profileInset, 0.04);
  assert.equal(DEMO_WRAP_DEFAULTS.follow, 0.58);
});

test('uses left alignment for single-column flowing text', () => {
  const line = getLinePresentation({
    text: 'A single stream of text bends around a subject silhouette',
    width: 280,
    regionWidth: 340,
  });

  assert.equal(line.align, 'left');
});

test('prefers justification for well-filled editorial lines', () => {
  const justified = getLinePresentation({
    text: 'A convincing spread needs two calm reading rivers',
    width: 280,
    regionWidth: 340,
  });
  const ragged = getLinePresentation({
    text: 'And then it rests.',
    width: 128,
    regionWidth: 340,
  });

  assert.equal(justified.justify, true);
  assert.deepEqual(justified.words.slice(0, 3), ['A', 'convincing', 'spread']);
  assert.equal(ragged.justify, false);
});

test('syncs the reference video to the processed stage source', () => {
  const source = {
    currentTime: 3.2,
    playbackRate: 1,
  };
  const reference = {
    currentTime: 2.8,
    playbackRate: 1.5,
  };

  syncReferenceVideo(source, reference);

  assert.equal(reference.currentTime, 3.2);
  assert.equal(reference.playbackRate, 1);
});

test('ignores tiny sync drift unless forced', () => {
  const source = {
    currentTime: 4,
    playbackRate: 1,
  };
  const reference = {
    currentTime: 4.04,
    playbackRate: 1,
  };

  syncReferenceVideo(source, reference, { tolerance: 0.08 });
  assert.equal(reference.currentTime, 4.04);

  syncReferenceVideo(source, reference, { forceSeek: true, tolerance: 0.08 });
  assert.equal(reference.currentTime, 4);
});
