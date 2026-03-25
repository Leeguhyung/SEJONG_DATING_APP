import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function CustomerCenterScreen() {
  const router = useRouter();
  const { myInfo } = useUser();
  const { showAlert } = useAlert();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      showAlert('알림', '피드백 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/feedback`, {
        studentId: myInfo?.studentId || 'unknown',
        content: feedback,
      });

      if (response.data.success) {
        showAlert('감사합니다', '보내주신 피드백이 소중히 접수되었습니다.', [
          { text: '확인', onPress: () => setFeedback('') }
        ]);
      }
    } catch (error) {
      console.error('피드백 전송 실패:', error);
      showAlert('오류', '피드백 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고객센터</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>피드백 전송하기</Text>
            <Text style={styles.sectionDesc}>앱 사용 중 불편한 점이나 건의사항을 자유롭게 남겨주세요.</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="여기에 내용을 입력하세요..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
            />
            <TouchableOpacity 
              style={[styles.sendButton, loading && { opacity: 0.7 }]} 
              onPress={handleSendFeedback}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.sendButtonText}>전송하기</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제작자 정보</Text>
            <View style={styles.creatorCard}>
              <View style={styles.creatorHeader}>
                <Ionicons name="code-working" size={24} color="#FF4D6D" />
                <Text style={styles.creatorName}>이규형</Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorText}>23 학번</Text>
                <Text style={styles.creatorText}>학과: 컴퓨터공학과</Text>
                <Text style={styles.creatorText}>이메일: leeknivoc@naver.com</Text>
              </View>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#888', marginBottom: 16, lineHeight: 20 },
  feedbackInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    height: 150,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#FF4D6D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  creatorCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  creatorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  creatorName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  creatorInfo: { gap: 6 },
  creatorText: { fontSize: 14, color: '#666' },
});
