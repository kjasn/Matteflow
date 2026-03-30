import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PROFILE } from '../src/profile.js';
import {
  computeWrapRegions,
  createCanvasPreparedText,
  createFlowPlan,
  splitWordForLine,
} from '../src/layout.js';

test('returns one full-width region above the floating stage', () => {
  const regions = computeWrapRegions({
    y: 80,
    lineHeight: 28,
    articleLeft: 40,
    articleWidth: 900,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1,
    gutter: 24,
  });

  assert.deepEqual(regions, [{ x: 40, width: 900 }]);
});

test('returns left and right regions through the silhouette body', () => {
  const regions = computeWrapRegions({
    y: 340,
    lineHeight: 28,
    articleLeft: 40,
    articleWidth: 900,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1,
    gutter: 24,
  });

  assert.equal(regions.length, 2);
  assert.ok(regions[0].width > 0);
  assert.ok(regions[1].width > 0);
});

test('keeps a minimum right column width when the subject drifts right', () => {
  const regions = computeWrapRegions({
    y: 340,
    lineHeight: 28,
    articleLeft: 40,
    articleWidth: 900,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 820,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1.1,
    gutter: 8,
    minRegionWidth: 220,
    offsetDamping: 0.6,
  });

  assert.equal(regions.length, 2);
  assert.ok(regions[1].width >= 220);
});

test('allows a tighter wrap envelope around the subject', () => {
  const loose = computeWrapRegions({
    y: 340,
    lineHeight: 28,
    articleLeft: 40,
    articleWidth: 900,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1.1,
    gutter: 12,
    profileInset: 0,
  });
  const tight = computeWrapRegions({
    y: 340,
    lineHeight: 28,
    articleLeft: 40,
    articleWidth: 900,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1.1,
    gutter: 12,
    profileInset: 0.08,
  });

  assert.ok(tight[0].width > loose[0].width);
  assert.ok(tight[1].width > loose[1].width);
});

test('does not let reduced follow cause text overlap on the moving side', () => {
  const regions = computeWrapRegions({
    y: 340,
    lineHeight: 28,
    articleLeft: 0,
    articleWidth: 600,
    stageTop: 200,
    stageHeight: 360,
    stageCenterX: 300,
    stageWidth: 200,
    profile: [{ width: 0.4, offset: -0.3 }],
    wrapStrength: 1,
    gutter: 10,
    offsetDamping: 0.5,
  });

  assert.equal(regions.length, 2);
  assert.ok(regions[0].width <= 190);
});

test('splits oversized words with a carried hyphenated remainder', () => {
  const split = splitWordForLine('extraordinary', 6, sample => sample.length);

  assert.match(split.head, /-$/);
  assert.ok(split.tail.length >= 3);
});

test('canvas fallback carries the remainder of a hyphenated word', () => {
  const prepared = createCanvasPreparedText({
    text: 'extraordinary motion',
    font: '16px serif',
    context: {
      font: '',
      measureText(sample) {
        return { width: sample.length };
      },
    },
  });

  const first = prepared.nextLine(prepared.startCursor, 6);
  const second = prepared.nextLine(first.end, 6);

  assert.match(first.text, /-$/);
  assert.ok(second.text.length > 0);
  assert.notEqual(second.text, 'motion');
});

test('creates positioned lines for the article body', () => {
  const plan = createFlowPlan({
    prepared: {
      measure(regionWidth) {
        return [
          { text: `region:${regionWidth}`, width: Math.min(regionWidth - 20, 220) },
          { text: 'next-line', width: Math.min(regionWidth - 20, 180) },
        ];
      },
    },
    articleText: 'stub',
    articleLeft: 40,
    articleTop: 120,
    articleWidth: 900,
    articleHeight: 220,
    lineHeight: 28,
    stageTop: 170,
    stageHeight: 120,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1,
    gutter: 24,
  });

  assert.ok(plan.lines.length >= 2);
  assert.equal(plan.lines[0].y, 120);
  assert.ok(plan.lines.every(line => line.width > 0));
});

test('supports cursor-based line sources for browser layout', () => {
  const plan = createFlowPlan({
    prepared: {
      startCursor: 0,
      nextLine(startCursor, regionWidth) {
        if (startCursor >= 3) {
          return null;
        }

        return {
          text: `line-${startCursor}`,
          width: Math.min(regionWidth - 10, 160),
          end: startCursor + 1,
        };
      },
    },
    articleText: 'stub',
    articleLeft: 40,
    articleTop: 120,
    articleWidth: 900,
    articleHeight: 220,
    lineHeight: 28,
    stageTop: 170,
    stageHeight: 120,
    stageCenterX: 490,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1,
    gutter: 24,
  });

  assert.deepEqual(
    plan.lines.map(line => line.text),
    ['line-0', 'line-1', 'line-2'],
  );
});

test('single-flow plan emits lines from one prepared source', () => {
  const plan = createFlowPlan({
    prepared: {
      startCursor: 0,
      nextLine(startCursor, regionWidth) {
        if (startCursor >= 4) {
          return null;
        }

        return {
          text: `line-${startCursor}`,
          width: Math.min(regionWidth - 10, 180),
          end: startCursor + 1,
        };
      },
    },
    articleLeft: 40,
    articleTop: 120,
    articleWidth: 900,
    articleHeight: 220,
    lineHeight: 28,
    stageTop: 120,
    stageHeight: 220,
    stageCenterX: 420,
    stageWidth: 280,
    profile: DEFAULT_PROFILE,
    wrapStrength: 1.1,
    gutter: 9,
    minRegionWidth: 240,
    offsetDamping: 0.58,
    profileInset: 0.04,
  });

  assert.deepEqual(
    plan.lines.map(line => line.text),
    ['line-0', 'line-1', 'line-2', 'line-3'],
  );
  assert.ok(plan.lines.every(line => line.column === undefined));
});
