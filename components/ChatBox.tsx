import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Message {
  id: string;
  from: 'user' | 'support';
  text: string;
  time: string;
}

const GREETINGS: Message[] = [
  {
    id: 'g1',
    from: 'support',
    text: 'Hello! Welcome to CityHup Customer Care. How can we help you today?',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const AUTO_REPLIES: Record<string, string> = {
  default: 'Thank you for reaching out. Our team will get back to you shortly. For urgent matters, call our support line.',
  register: 'To register your business, click "Register" in the top navigation. A City Hup agent will assist you through the process.',
  payment: 'All payments are made via Interswitch, Remita, or Paystack. Please include your City Hup Client ID in the payment description.',
  complaint: 'To file a complaint about a service provider, visit their profile page and click "Report / Complaint" at the bottom.',
  find: 'Use the search bar at the top of the homepage or browse by category to find service providers near you.',
};

function getReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('register') || t.includes('list') || t.includes('add')) return AUTO_REPLIES.register;
  if (t.includes('pay') || t.includes('subscription') || t.includes('fee')) return AUTO_REPLIES.payment;
  if (t.includes('complaint') || t.includes('report') || t.includes('problem')) return AUTO_REPLIES.complaint;
  if (t.includes('find') || t.includes('search') || t.includes('look')) return AUTO_REPLIES.find;
  return AUTO_REPLIES.default;
}

export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(GREETINGS);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const replyMsg: Message = {
      id: (Date.now() + 1).toString(),
      from: 'support',
      text: getReply(input),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg, replyMsg]);
    setInput('');
  }

  return (
    <>
      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(v => !v)}>
        <Ionicons name={open ? 'close' : 'chatbubble-ellipses'} size={24} color={Colors.white} />
        {!open && <View style={styles.fabDot} />}
      </TouchableOpacity>

      {open && (
        <View style={styles.box}>
          <View style={styles.boxHeader}>
            <View style={styles.boxHeaderLeft}>
              <View style={styles.avatar}><Ionicons name="headset" size={18} color={Colors.white} /></View>
              <View>
                <Text style={styles.boxTitle}>CityHup Support</Text>
                <Text style={styles.boxSub}>Typically replies instantly</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messages} showsVerticalScrollIndicator={false}>
            {messages.map(m => (
              <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleSupport]}>
                <Text style={[styles.bubbleText, m.from === 'user' && styles.bubbleTextUser]}>{m.text}</Text>
                <Text style={[styles.bubbleTime, m.from === 'user' && { color: 'rgba(255,255,255,0.7)' }]}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message…"
              placeholderTextColor={Colors.textMuted}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send}>
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            Powered by CityHup Ltd Customer Care
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 999,
  },
  fabDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  box: {
    position: 'absolute',
    bottom: 88,
    right: 16,
    width: 300,
    maxHeight: 420,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    zIndex: 998,
  },
  boxHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  boxHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  boxTitle: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  boxSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  messages: { flex: 1, padding: 10, maxHeight: 250 },
  bubble: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
  },
  bubbleSupport: {
    backgroundColor: Colors.bgLight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 3,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 3,
  },
  bubbleText: { fontSize: 13, color: Colors.textDark, lineHeight: 18 },
  bubbleTextUser: { color: Colors.white },
  bubbleTime: { fontSize: 9, color: Colors.textMuted, marginTop: 3, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: 8,
    gap: 6,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingBottom: 6,
  },
});
