import { formatPlainText, formatSRT, formatVTT } from '../lib/formatter';

describe('formatter', () => {
  const sample = [
    { start: 0, end: 1.5, text: 'Hello world' },
    { start: 2.5, end: 3.0, text: 'Next line' },
  ];

  test('formatPlainText without timestamps', () => {
    const output = formatPlainText(sample);
    expect(output).toBe('Hello world\nNext line');
  });

  test('formatPlainText with timestamps', () => {
    const output = formatPlainText(sample, true);
    expect(output).toBe('00:00:00,000 Hello world\n00:00:02,500 Next line');
  });

  test('formatSRT', () => {
    const output = formatSRT(sample);
    expect(output).toBe(
      '1\n00:00:00,000 --> 00:00:01,500\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nNext line'
    );
  });

  test('formatVTT', () => {
    const output = formatVTT(sample);
    expect(output).toBe(
      'WEBVTT\n\n00:00:00.000 --> 00:00:01.500\nHello world\n\n00:00:02.500 --> 00:00:03.000\nNext line'
    );
  });
});