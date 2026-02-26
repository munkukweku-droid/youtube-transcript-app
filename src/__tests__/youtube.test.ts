import { extractVideoId } from '@/lib/youtube';

describe('extractVideoId', () => {
  it('extracts ID from standard watch URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be short URL', () => {
    const url = 'https://youtu.be/abcdef12345';
    expect(extractVideoId(url)).toBe('abcdef12345');
  });

  it('extracts ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/abcdefghijk';
    expect(extractVideoId(url)).toBe('abcdefghijk');
  });

  it('extracts ID from /v/ URL', () => {
    const url = 'https://www.youtube.com/v/12345678901';
    expect(extractVideoId(url)).toBe('12345678901');
  });

  it('returns bare ID unchanged', () => {
    expect(extractVideoId('a1b2c3d4e5f')).toBe('a1b2c3d4e5f');
  });

  it('rejects playlist URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL12345';
    expect(() => extractVideoId(url)).toThrow();
  });

  it('rejects shorts URLs', () => {
    const url = 'https://www.youtube.com/shorts/abcdef12345';
    expect(() => extractVideoId(url)).toThrow();
  });

  it('throws on invalid URL', () => {
    expect(() => extractVideoId('not a youtube url')).toThrow();
  });
});