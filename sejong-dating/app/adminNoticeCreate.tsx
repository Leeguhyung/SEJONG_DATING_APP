import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function AdminNoticeCreateScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [durationDays, setDurationDays] = useState('1'); // 기본 1일
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      showAlert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/admin/notices`, {
        title,
        content,
        durationDays: parseInt(durationDays),
      });

      if (response.data.success) {
        showAlert('성공', '공지사항이 등록되었습니다.', [
          { text: '확인', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      showAlert('오류', '공지사항 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const durations = [
    { label: '1일', value: '1' },
    { label: '3일', value: '3' },
    { label: '7일', value: '7' },
    { label: '30일', value: '30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항 작성</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="공지 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="공지 내용을 상세히 적어주세요"
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <Text style={styles.label}>게시 기간</Text>
          <View style={styles.durationContainer}>
            {durations.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.durationItem,
                  durationDays === d.value && styles.durationItemSelected,
                ]}
                onPress={() => setDurationDays(d.value)}
              >
                <Text
                  style={[
                    styles.durationText,
                    durationDays === d.value && styles.durationTextSelected,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>공지 등록하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  inputSection: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#555', marginBottom: 12, marginTop: 12 },
  titleInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    height: 200,
  },
  durationContainer: { flexDirection: 'row', gap: 10, marginTop: 4 },
  durationItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationItemSelected: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FF4D6D',
  },
  durationText: { fontSize: 14, color: '#888' },
  durationTextSelected: { color: '#FF4D6D', fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitButton: {
    backgroundColor: '#FF4D6D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
