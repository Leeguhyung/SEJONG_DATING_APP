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
import { styles } from '../styles/app/adminReportList.styles';

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
