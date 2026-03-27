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
import { styles } from '../styles/app/customerCenter.styles';

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
