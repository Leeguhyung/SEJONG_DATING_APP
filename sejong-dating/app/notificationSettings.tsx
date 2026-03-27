import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/app/notificationSettings.styles';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [chatPushEnabled, setChatPushEnabled] = useState(true);

  // 화면 진입 시 저장된 알림 설정 가져오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSetting = await AsyncStorage.getItem('chatNotification');
        if (savedSetting !== null) {
          setChatPushEnabled(savedSetting === 'true');
        } else {
          // 기본값은 true로 설정
          setChatPushEnabled(true);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, []);

  // 토글 스위치 변경 시 AsyncStorage에 저장
  const toggleSwitch = async (value: boolean) => {
    setChatPushEnabled(value);
    try {
      await AsyncStorage.setItem('chatNotification', value.toString());
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.settingList}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>채팅 알림</Text>
            <Text style={styles.settingDescription}>새로운 메시지가 도착했을 때 푸시 알림을 받습니다.</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#FFC0CB' }}
            thumbColor={chatPushEnabled ? '#FF4D6D' : '#F4F3F4'}
            onValueChange={toggleSwitch}
            value={chatPushEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
