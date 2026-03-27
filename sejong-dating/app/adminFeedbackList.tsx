import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { styles } from '../styles/app/adminFeedbackList.styles';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

interface FeedbackData {
  _id: string;
  studentId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export default function AdminFeedbackListScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/admin/feedbacks`);
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error('피드백 목록 로딩 실패:', error);
      showAlert('오류', '피드백 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedbacks();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF4D6D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피드백 확인하기</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.studentIdText}>발송인: {item.userName} ({item.studentId})</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{item.content}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbox-ellipses-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>아직 접수된 피드백이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
