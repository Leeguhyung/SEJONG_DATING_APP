import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from '../context/UserContext';
import { AlertProvider } from '../context/AlertContext';
import GlobalAlert from '../components/GlobalAlert';
import * as Notifications from 'expo-notifications';

// 앱이 실행 중(포그라운드)일 때도 상단 배너 알림을 띄우기 위한 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('푸시 알림 권한이 거부되었습니다.');
      }
    };

    requestNotificationPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AlertProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profileSetup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="adminUserList" options={{ presentation: 'card' }} />
            <Stack.Screen name="adminNoticeList" options={{ presentation: 'card' }} />
            <Stack.Screen name="adminNoticeCreate" options={{ presentation: 'modal' }} />
            <Stack.Screen name="adminFeedbackList" options={{ presentation: 'card' }} />
            <Stack.Screen name="adminReportList" options={{ presentation: 'card' }} />
            <Stack.Screen name="customerCenter" options={{ presentation: 'card' }} />
            <Stack.Screen name="chatRoom" options={{ presentation: 'card' }} />
            <Stack.Screen name="editProfile" options={{ presentation: 'modal' }} />
            {/* 알림 설정 페이지 추가 */}
            <Stack.Screen name="notificationSettings" options={{ presentation: 'modal' }} />
          </Stack>
          <GlobalAlert />
        </AlertProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
