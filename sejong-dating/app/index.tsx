import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { styles } from '../styles/app/index.styles';
import { AppLogo } from '../components/AppLogo';

const API_URL = `${process.env.EXPO_PUBLIC_SERVER_URL}/auth`;

export default function LoginScreen() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 
  const { setMyInfo, setIsAdmin } = useUser();
  const { showAlert } = useAlert();

  useEffect(() => {
    // 모바일 환경에서만 자동 로그인 체크
    if (Platform.OS !== 'web') {
      checkAutoLogin();
    }
  }, []);

  const checkAutoLogin = async () => {
    try {
      const savedId = await SecureStore.getItemAsync('studentId');
      const savedPw = await SecureStore.getItemAsync('password');

      if (savedId && savedPw) {
        setStudentId(savedId);
        setPassword(savedPw);
        setAutoLogin(true);

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const authResult = await LocalAuthentication.authenticateAsync({
            promptMessage: '세종설렘 자동 로그인을 위해 인증해 주세요.',
            fallbackLabel: '비밀번호 사용',
          });

          if (authResult.success) {
            performLogin(savedId, savedPw, true);
          }
        } else {
          performLogin(savedId, savedPw, true);
        }
      }
    } catch (error) {
      console.error('자동 로그인 확인 중 오류:', error);
    }
  };

  const handleLogin = () => {
    performLogin(studentId, password, autoLogin);
  };

  const performLogin = async (id: string, pw: string, isAutoLoginEnabled: boolean) => {
    if (!id || !pw) {
      showAlert('알림', '학번과 비밀번호를 모두 입력해주세요!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, {
        id,
        pw
      }, { timeout: 15000 });

      if (response.data.success) {
        // ⭐️ 핵심: 웹 브라우저에서는 SecureStore를 건너뛰어 에러 방지
        if (Platform.OS !== 'web') {
          if (isAutoLoginEnabled) {
            await SecureStore.setItemAsync('studentId', id);
            await SecureStore.setItemAsync('password', pw);
          } else {
            await SecureStore.deleteItemAsync('studentId');
            await SecureStore.deleteItemAsync('password');
          }
        }

        const { isNewUser, isProfileComplete, role } = response.data;
        const { name, major, studentId: loggedInId } = response.data.data;

        setMyInfo({ studentId: loggedInId, name, major });
        setIsAdmin(role === 'admin');

        if (!isNewUser && isProfileComplete) {
          showAlert('환영합니다', `${name}님, 다시 만나서 반갑네요!`);
          router.replace('/(tabs)/home');
        } else {
          router.replace({
            pathname: '/profileSetup',
            params: { name, major, studentId: loggedInId }
          });
        }
      } else {
        showAlert('로그인 실패', '학번 또는 비밀번호를 다시 확인해 주세요!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      // 여기서의 에러는 진짜 API 통신 오류이거나, 위에서 발생한 SecureStore 에러입니다.
      showAlert('오류', '인증 서버와 통신할 수 없거나 웹 환경에서 보안 기능을 사용할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#D29793', '#E9C2C0', '#F5F5F5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.innerContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.headerContainer}>
            <AppLogo size={80} style={{ marginBottom: 20 }} />
            <Text style={styles.mainTitle}>세종설렘</Text>
            <Text style={styles.subTitle}>세종대학교 학생들을 위한{'\n'}프리미엄 데이팅 앱</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#FF4D6D" />
              <Text style={styles.cardHeaderText}>학사정보시스템 로그인</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="학번 (예: 21011234)"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={studentId}
                onChangeText={setStudentId}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* 웹에서는 자동 로그인 체크박스 숨김 */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.autoLoginCheckboxContainer} 
                onPress={() => setAutoLogin(!autoLogin)}
              >
                <Ionicons 
                  name={autoLogin ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={autoLogin ? "#FF4D6D" : "#888"} 
                />
                <Text style={styles.autoLoginCheckboxText}>자동 로그인 (Face ID / Touch ID)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>{isLoading ? '인증 중...' : '로그인 >'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
