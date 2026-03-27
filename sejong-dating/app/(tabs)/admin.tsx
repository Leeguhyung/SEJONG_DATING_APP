import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAlert } from '../../context/AlertContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { styles } from '../../styles/app/(tabs)/admin.styles';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function AdminScreen() {
  const { myInfo, setMyInfo, setIsAdmin } = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [stats, setStats] = useState({ totalUsers: 0, dau: 0, wau: 0, mau: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const response = await axios.get(`${SERVER_URL}/admin/stats`);
          if (response.data.success) {
            setStats(response.data.data);
          }
        } catch (error) {
          console.error('통계 로딩 실패:', error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }, [])
  );

  const handleLogout = () => {
    showAlert('로그아웃', '관리자 계정에서 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { 
        text: '로그아웃', 
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('studentId');
          await SecureStore.deleteItemAsync('password');
          setMyInfo(null);
          setIsAdmin(false);
          router.replace('/');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>관리자 대시보드</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.adminInfoCard}>
          <Ionicons name="shield-checkmark" size={40} color="#FF4D6D" />
          <Text style={styles.adminId}>관리자 계정: {myInfo?.studentId}</Text>
          <Text style={styles.adminDesc}>이곳은 어플 관리를 위한 공간입니다.</Text>
        </View>

        {/* ⭐️ 통계 대시보드 */}
        <Text style={styles.sectionTitle}>이용자 통계</Text>
        {loadingStats ? (
          <ActivityIndicator size="small" color="#FF4D6D" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>총 가입자</Text>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>DAU (1일)</Text>
              <Text style={[styles.statValue, { color: '#FF4D6D' }]}>{stats.dau}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>WAU (7일)</Text>
              <Text style={[styles.statValue, { color: '#FF4D6D' }]}>{stats.wau}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>MAU (30일)</Text>
              <Text style={[styles.statValue, { color: '#FF4D6D' }]}>{stats.mau}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>관리 메뉴</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/adminUserList')}
          >
            <Ionicons name="people" size={24} color="#555" />
            <Text style={styles.menuText}>전체 사용자 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/adminNoticeList')}
          >
            <Ionicons name="megaphone" size={24} color="#555" />
            <Text style={styles.menuText}>공지사항 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/adminFeedbackList')}
          >
            <Ionicons name="chatbox-ellipses" size={24} color="#555" />
            <Text style={styles.menuText}>피드백 확인하기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/adminReportList')}
          >
            <Ionicons name="warning" size={24} color="#555" />
            <Text style={styles.menuText}>신고 내역 확인</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
