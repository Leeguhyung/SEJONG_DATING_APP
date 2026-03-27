import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAlert } from '../../context/AlertContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { styles } from '../../styles/app/(tabs)/settings.styles';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function SettingsScreen() {
  const { myInfo, setMyInfo, setIsAdmin } = useUser();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchMyProfile = async () => {
        if (!myInfo?.studentId) return;
        try {
          const response = await axios.get(`${SERVER_URL}/profile/${myInfo.studentId}`);
          if (response.data.success && response.data.data.profileImage) {
            setProfileImage(response.data.data.profileImage);
          } else {
            setProfileImage(null);
          }
        } catch (error) {
          console.error('설정창 프로필 이미지 로딩 실패:', error);
        }
      };
      fetchMyProfile();
    }, [myInfo])
  );

  const handleLogout = () => {
    showAlert('로그아웃', '정말로 로그아웃 하시겠습니까?', [
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

  const SETTINGS_OPTIONS = [
    { icon: 'person-outline', label: '내 프로필 수정', action: () => router.push('/editProfile') },
    { icon: 'notifications-outline', label: '알림 설정', action: () => router.push('/notificationSettings') },
    { icon: 'help-circle-outline', label: '고객센터', action: () => router.push('/customerCenter') },
    { icon: 'log-out-outline', label: '로그아웃', color: '#FF4D6D', action: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView>
        <View style={styles.profileSummary}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.profileName}>{myInfo?.name || '사용자'}</Text>
          <Text style={styles.profileDetail}>
            {myInfo?.studentId || '학번 없음'} | {myInfo?.major || '소속 없음'}
          </Text>
        </View>

        <View style={styles.section}>
          {SETTINGS_OPTIONS.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionItem} onPress={option.action}>
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon as any} size={22} color={option.color || '#333'} />
                <Text style={[styles.optionLabel, option.color ? { color: option.color } : null]}>
                  {option.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
