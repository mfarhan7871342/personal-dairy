import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { getDailyQuote, Quote } from '@/utils/quotes';

export function QuoteCard() {
  const colors = useColors();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyQuote().then((q) => {
      setQuote(q);
      setLoading(false);
    });
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
      <Ionicons name="sparkles" size={18} color={colors.primary} style={styles.icon} />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Text style={[styles.content, { color: colors.foreground }]}>"{quote?.content}"</Text>
          <Text style={[styles.author, { color: colors.primary }]}>— {quote?.author}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginHorizontal: 16, borderWidth: 1 },
  icon: { marginBottom: 8 },
  content: { fontSize: 13, lineHeight: 20, fontStyle: 'italic', marginBottom: 8 },
  author: { fontSize: 12, fontWeight: '700' },
});
