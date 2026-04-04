import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_QUOTES = [
  { content: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { content: 'Write hard and clear about what hurts.', author: 'Ernest Hemingway' },
  { content: 'Journal writing is a voyage to the interior.', author: 'Christina Baldwin' },
  { content: 'Fill your paper with the breathings of your heart.', author: 'William Wordsworth' },
  { content: 'One must always be careful of bookshelves. The life you save might be your own.', author: 'Cassandra Clare' },
  { content: 'In the journal I do not just express myself more openly than I could to any person; I create myself.', author: 'Susan Sontag' },
  { content: 'Writing in a diary is a really strange experience for someone like me.', author: 'Anne Frank' },
  { content: 'Keep a diary and one day it\'ll keep you.', author: 'Mae West' },
  { content: 'The act of writing is the act of discovering what you believe.', author: 'David Hare' },
  { content: 'Almost all good writing begins with terrible first efforts. You need to start somewhere.', author: 'Anne Lamott' },
  { content: 'I write because I don\'t know what I think until I read what I say.', author: 'Flannery O\'Connor' },
  { content: 'To live is to be slowly born.', author: 'Antoine de Saint-Exupéry' },
  { content: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
  { content: 'You have power over your mind, not outside events.', author: 'Marcus Aurelius' },
  { content: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
];

export interface Quote {
  content: string;
  author: string;
}

export async function getDailyQuote(): Promise<Quote> {
  const dateKey = new Date().toISOString().split('T')[0];
  const cacheKey = `quote_${dateKey}`;

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.quotable.io/random?maxLength=100', {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const quote: Quote = { content: data.content, author: data.author };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(quote));
      return quote;
    }
  } catch {}

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];
}
