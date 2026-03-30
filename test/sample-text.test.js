import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTICLE_TEXT } from '../src/sampleText.js';

test('editorial copy avoids demo instructions in the body text', () => {
  assert.doesNotMatch(ARTICLE_TEXT, /pick a local video/i);
  assert.doesNotMatch(ARTICLE_TEXT, /adjust the threshold/i);
});
