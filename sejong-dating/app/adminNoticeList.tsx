import React, { useState, useEffect, useCallback } from 'react';
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

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

interface NoticeData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  expiresAt: string;
}

export default function AdminNoticeListScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/admin/notices`);
      if (response.data.success) {
        setNotices(response.data.data);
      }
    } catch (error) {
      console.error('공지 목록 로딩 실패:', error);
      showAlert('오류', '공지사항 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotices();
    }, [])
  );

  const handleDelete = (id: string, title: string) => {
    showAlert('공지 삭제', `"${title}" 공지를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await axios.delete(`${SERVER_URL}/admin/notices/${id}`);
            if (response.data.success) {
              showAlert('완료', '공지사항이 삭제되었습니다.');
              fetchNotices();
            }
          } catch (error) {
            console.error('공지 삭제 실패:', error);
            showAlert('오류', '공지 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
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
        <Text style={styles.headerTitle}>공지사항 관리</Text>
        <TouchableOpacity 
          onPress={() => router.push('/adminNoticeCreate')} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color="#FF4D6D" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notices}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const expired = isExpired(item.expiresAt);
          return (
            <View style={styles.noticeCard}>
              <View style={styles.noticeInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.noticeTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.statusBadge, expired ? styles.expiredBadge : styles.activeBadge]}>
                    <Text style={[styles.statusText, expired ? styles.expiredText : styles.activeText]}>
                      {expired ? '만료됨' : '게시중'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dateText}>작성일: {formatDate(item.createdAt)}</Text>
                <Text style={styles.dateText}>만료일: {formatDate(item.expiresAt)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDelete(item._id, item.title)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF4D6D" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 공지사항이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  addButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  listContainer: { padding: 16 },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noticeInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  noticeTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  dateText: { fontSize: 12, color: '#999', marginTop: 2 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadge: { backgroundColor: '#FFF0F2' },
  expiredBadge: { backgroundColor: '#F0F1F4' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  activeText: { color: '#FF4D6D' },
  expiredText: { color: '#888' },
  deleteButton: { padding: 8, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 15, color: '#999' },
});
