import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/store/settingsStore';
import { useEntryStore } from '@/store/entryStore';
import { useStreakStore } from '@/store/streakStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PROMPTS = [
  "How am I feeling lately?",
  "Help me reflect on today",
  "What patterns do you see?",
  "Give me a journaling prompt",
];

function TypingIndicator() {
  const colors = useColors();
  const dot1 = useSharedValue(0.4);
  const dot2 = useSharedValue(0.4);
  const dot3 = useSharedValue(0.4);

  React.useEffect(() => {
    dot1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })), -1);
    setTimeout(() => { dot2.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })), -1); }, 130);
    setTimeout(() => { dot3.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })), -1); }, 260);
  }, []);

  const d1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const d2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const d3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.dots}>
        {[d1Style, d2Style, d3Style].map((s, i) => (
          <Animated.View key={i} style={[styles.dot, { backgroundColor: colors.primary }, s]} />
        ))}
      </View>
    </View>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const colors = useColors();
  const isUser = msg.role === 'user';
  return (
    <Animated.View entering={FadeInUp.springify()} style={[styles.bubbleWrap, isUser ? styles.userWrap : styles.aiWrap]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]]}>
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.foreground }]}>{msg.content}</Text>
      </View>
    </Animated.View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();
  const { entries } = useEntryStore();
  const { currentStreak } = useStreakStore();

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "Hi, I'm Roz! I've read your recent journal entries and I'm here to help you reflect. What's on your mind?" },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.aiApiKey || '');
  const [showKeyInput, setShowKeyInput] = useState(!settings.aiApiKey);
  const flatRef = useRef<FlatList>(null);

    const topPad = (Platform.OS === 'web' ? 67 : insets.top) ?? 0;
    const bottomPad = insets.bottom ?? 0;
  
    const buildContext = () => {
      const recent = entries.slice(0, 5).map((e) => `Date: ${e.createdAt.split('T')[0]}, Mood: ${e.mood}, Entry: ${e.body.substring(0, 200)}`).join('\n');
      return `You are Roz, a warm and empathetic AI journaling companion. The user has a ${currentStreak}-day journaling streak. Here are their recent journal entries:\n\n${recent}\n\nRespond with warmth, insight, and encouragement. Keep responses concise (under 150 words).`;
    };
  
    const sendMessage = async (text: string) => {
      if (!text.trim() || sending) return;
      const key = settings.aiApiKey;
      if (!key) { setShowKeyInput(true); return; }
  
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSending(true);
  
      try {
        const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
          max_tokens: 500,
          system: buildContext(),
          messages: history,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "I'm having trouble responding right now.";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, aiMsg]);
      useStreakStore.getState().unlockBadge('aiExplorer');
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I couldn't connect. Please check your API key and internet connection." };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="close" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <View>
            <Text style={[styles.aiName, { color: colors.foreground }]}>Roz AI</Text>
            <Text style={[styles.aiSub, { color: colors.mutedForeground }]}>Your journaling companion</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowKeyInput(!showKeyInput)} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="key" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {showKeyInput && (
        <View style={[styles.keyBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}>
          <Text style={[styles.keyLabel, { color: colors.primary }]}>Enter your Claude API key</Text>
          <View style={styles.keyRow}>
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              style={[styles.keyInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            />
            <TouchableOpacity
              onPress={() => { updateSettings({ aiApiKey: apiKeyInput }); setShowKeyInput(false); }}
              style={[styles.keyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={sending ? <TypingIndicator /> : null}
      />

      <View style={styles.promptRow}>
        <FlatList
          data={PROMPTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => sendMessage(item)}
              style={[styles.promptBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Text style={[styles.promptText, { color: colors.foreground }]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      </View>

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message Roz..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.chatInput, { backgroundColor: colors.muted, color: colors.foreground }]}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          onPress={() => sendMessage(input)}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          disabled={!input.trim() || sending}
        >
          <Ionicons name="arrow-up" size={18} color={input.trim() ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: 15, fontWeight: '700' },
  aiSub: { fontSize: 11 },
  keyBanner: { padding: 16, borderBottomWidth: 1, gap: 8 },
  keyLabel: { fontSize: 13, fontWeight: '600' },
  keyRow: { flexDirection: 'row', gap: 8 },
  keyInput: { flex: 1, borderRadius: 10, padding: 10, borderWidth: 1, fontSize: 13 },
  keyBtn: { paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chatList: { padding: 16, gap: 12 },
  bubbleWrap: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  userWrap: { justifyContent: 'flex-end' },
  aiWrap: { justifyContent: 'flex-start', alignItems: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  dots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  promptRow: { paddingVertical: 8 },
  promptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  promptText: { fontSize: 12, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 8 },
  chatInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
