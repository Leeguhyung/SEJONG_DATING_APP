import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { io } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../styles/app/(tabs)/chat.styles';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL; 

export default function ChatScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ⭐️ Context에서 배지 관리 함수 추가
  const { myInfo, setHasUnreadMessage } = useUser();
  const socketRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/users`, {
        params: { 
          myId: myInfo?.studentId,
          chatOnly: true 
        }
      });
      if (response.data.success) {
        const fetchedUsers = response.data.data;
        setUsers(fetchedUsers);
        
        // ⭐️ 안 읽은 메시지가 하나라도 있는지 체크해서 탭 바 배지 업데이트
        const hasUnread = fetchedUsers.some(user => user.unreadCount > 0);
        setHasUnreadMessage(hasUnread);
      }
    } catch (error) {
      console.error('사용자 목록 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 탭에 들어올 때마다 목록 갱신
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [myInfo])
  );

  // ⭐️ 실시간 목록 갱신을 위한 소켓 연결
  useEffect(() => {
    if (!myInfo?.studentId) return;

    // 1. 소켓 연결
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      // 2. 연결 성공 시 내 학번으로 된 개인 채널에 입장
      socketRef.current.emit('login', myInfo.studentId);
    });

    // 3. 누군가 나에게 메시지를 보내서 서버가 새로고침 신호를 주면 목록 갱신 및 알림 발생
    socketRef.current.on('chat_list_update', async () => {
      fetchUsers(); // 목록 새로고침 및 N 배지 활성화

      // ⭐️ 알림 설정 확인 후 휴대폰 상단에 푸시 알림 띄우기
      try {
        const pushEnabled = await AsyncStorage.getItem('chatNotification');
        // 설정값이 아예 없거나(기본 켜짐), 명시적으로 'true'일 때 알림 발생
        if (pushEnabled !== 'false') {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "세종설렘 💌",
              body: "새로운 메시지가 도착했습니다!",
              sound: true, // 소리 활성화
            },
            trigger: null, // 즉시 발생
          });
        }
      } catch (e) {
        console.error('푸시 알림 에러:', e);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [myInfo]);

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
        <Text style={styles.headerTitle}>채팅</Text>
      </View>
      
      {users.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>아직 등록된 사용자가 없습니다.</Text>
          <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 20 }}>
            <Text style={{ color: '#FF4D6D' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.studentId || item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatItem}
              onPress={() => router.push({
                pathname: '/chatRoom',
                params: { name: item.name, studentId: item.studentId }
              })}
            >
              {item.profileImage ? (
                <Image source={{ uri: item.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.major}>{item.major}</Text>
                </View>
                <Text style={[styles.message, item.unreadCount > 0 && styles.unreadMessageText]} numberOfLines={1}>
                  {item.lastMessage || '채팅을 시작해 보세요!'}
                </Text>
              </View>
              
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>N</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
