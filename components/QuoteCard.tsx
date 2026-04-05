import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { getDailyQuote, Quote } from '@/utils/quotes';

export function QuoteCard() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyQuote().then((q) => {
      setQuote(q);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.openQuote}>"</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 12 }} />
      ) : (
        <>
          <Text style={styles.quoteText}>{quote?.content}</Text>
          <Text style={styles.author}>— {quote?.author}</Text>
        </>
      )}
      <Text style={styles.closeQuote}>"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  openQuote: { fontSize: 72, color: 'rgba(255,255,255,0.25)', lineHeight: 60, marginTop: -10, fontWeight: '900' },
  quoteText: { fontSize: 16, lineHeight: 24, color: '#FFFFFF', fontWeight: '500', marginTop: 4, marginBottom: 12 },
  author: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  closeQuote: { fontSize: 72, color: 'rgba(255,255,255,0.25)', lineHeight: 40, textAlign: 'right', fontWeight: '900' },
});
