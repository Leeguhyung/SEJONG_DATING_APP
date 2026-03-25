import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

interface UserData {
  studentId: string;
  name: string;
  major: string;
  role: 'user' | 'admin';
  createdAt: string;
  superuser?: boolean;
}

export default function AdminUserListScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/admin/users`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error);
      showAlert('오류', '사용자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = (studentId: string, currentRole: string, isSuperuser?: boolean) => {
    if (isSuperuser) {
      showAlert('권한 변경 불가', '최고 관리자의 권한은 변경할 수 없습니다.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? '관리자로 지정' : '일반 유저로 변경';

    showAlert('권한 변경', `${studentId} 사용자를 ${actionText}하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '변경',
        onPress: async () => {
          try {
            const response = await axios.patch(`${SERVER_URL}/admin/users/${studentId}/role`, { role: newRole });
            if (response.data.success) {
              showAlert('완료', '권한이 변경되었습니다.');
              fetchUsers();
            }
          } catch (error) {
            console.error('권한 변경 실패:', error);
            showAlert('오류', '권한 변경에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleDeleteUser = (studentId: string, name: string, isSuperuser?: boolean) => {
    if (isSuperuser) {
      showAlert('추방 불가', '최고 관리자는 추방할 수 없습니다.');
      return;
    }

    showAlert('회원 추방', `${name}(${studentId}) 사용자를 정말로 추방하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '추방',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await axios.delete(`${SERVER_URL}/admin/users/${studentId}`);
            if (response.data.success) {
              showAlert('완료', '사용자가 추방되었습니다.');
              fetchUsers();
            }
          } catch (error) {
            console.error('사용자 삭제 실패:', error);
            showAlert('오류', '사용자 추방에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const filteredUsers = users.filter((user) => 
    user.name.includes(searchQuery) || user.studentId.includes(searchQuery)
  );

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
        <Text style={styles.headerTitle}>전체 사용자 관리</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="이름 또는 학번으로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={[styles.roleBadge, item.superuser ? styles.superBadge : item.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
                  <Text style={[styles.roleText, item.superuser && { color: '#8A2BE2' }]}>
                    {item.superuser ? '최고관리자' : item.role === 'admin' ? '관리자' : '일반'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userDetail}>{item.studentId} | {item.major}</Text>
              <Text style={styles.dateText}>가입일: {formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.roleButton, item.superuser && { opacity: 0.5 }]}
                onPress={() => handleToggleRole(item.studentId, item.role, item.superuser)}
                disabled={item.superuser}
              >
                <Ionicons name="shield-outline" size={16} color="#555" />
                <Text style={styles.actionButtonText}>{item.role === 'admin' ? '일반전환' : '관리자부여'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, item.superuser && { opacity: 0.5 }]}
                onPress={() => handleDeleteUser(item.studentId, item.name, item.superuser)}
                disabled={item.superuser}
              >
                <Ionicons name="trash-outline" size={16} color={item.superuser ? '#999' : '#FF4D6D'} />
                <Text style={[styles.actionButtonText, { color: item.superuser ? '#999' : '#FF4D6D' }]}>추방</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 15, color: '#333' },
  listContainer: { padding: 16 },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: { marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#333', marginRight: 8 },
  userDetail: { fontSize: 14, color: '#666', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#999' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  superBadge: { backgroundColor: '#F3E8FF' },
  adminBadge: { backgroundColor: '#FFF0F2' },
  userBadge: { backgroundColor: '#F0F1F4' },
  roleText: { fontSize: 11, fontWeight: '600', color: '#FF4D6D' },
  actionButtons: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  roleButton: { borderColor: '#DDD', backgroundColor: '#FFF' },
  deleteButton: { borderColor: '#FFC0CB', backgroundColor: '#FFF' },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#555' },
});
