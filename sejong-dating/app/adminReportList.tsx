import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

interface ReportData {
  _id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  messageContent: string;
  createdAt: string;
}

export default function AdminReportListScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/admin/reports`);
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('신고 내역 로딩 실패:', error);
      showAlert('오류', '신고 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = (id: string) => {
    showAlert('신고 삭제', '이 신고 내역을 삭제하시겠습니까?\n확인 후 처리가 완료되었다면 삭제해 주세요.', [
      { text: '취소', style: 'cancel' },
      { 
        text: '삭제', 
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await axios.delete(`${SERVER_URL}/admin/reports/${id}`);
            if (response.data.success) {
              showAlert('완료', '신고 내역이 삭제되었습니다.');
              fetchReports();
            }
          } catch (error) {
            console.error('신고 삭제 실패:', error);
            showAlert('오류', '신고 내역 삭제에 실패했습니다.');
          }
        }
      }
    ]);
  };

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
        <Text style={styles.headerTitle}>신고 내역 확인</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.personInfo}>
                <Text style={styles.label}>신고자</Text>
                <Text style={styles.name}>{item.reporterName}</Text>
                <Text style={styles.id}>({item.reporterId})</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#CCC" style={{ marginHorizontal: 10 }} />
              <View style={styles.personInfo}>
                <Text style={styles.label}>피신고자</Text>
                <Text style={[styles.name, { color: '#FF4D6D' }]}>{item.reportedName}</Text>
                <Text style={styles.id}>({item.reportedId})</Text>
              </View>
            </View>
            
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>"{item.messageContent}"</Text>
            </View>
            
            <View style={styles.reportFooter}>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteReport(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4D6D" />
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>신고 내역이 없습니다.</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  listContainer: { padding: 16 },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  personInfo: { flex: 1, alignItems: 'center' },
  label: { fontSize: 11, color: '#999', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  id: { fontSize: 12, color: '#666' },
  contentBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D6D',
  },
  contentText: { fontSize: 14, color: '#444', fontStyle: 'italic', lineHeight: 20 },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: { fontSize: 12, color: '#BBB' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FFF0F2',
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#FF4D6D',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16 },
});
