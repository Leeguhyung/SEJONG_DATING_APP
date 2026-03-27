import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  withTiming
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { styles } from '../../styles/app/(tabs)/home.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL; 

export default function HomeScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { myInfo } = useUser();

  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/users`, {
        params: { myId: myInfo?.studentId }
      });

      if (response.data.success) {
        const formattedProfiles = response.data.data.map(user => ({
          id: user._id,
          studentId: user.studentId,
          name: user.name,
          age: user.age || 20,
          major: `${user.major || '세종대'} · ${user.studentId?.substring(0, 2)}학번`,
          tags: user.interests?.map(t => `#${t}`) || ['#세종대', '#설렘'],
          bio: user.bio || '안녕하세요! 반갑습니다. 😊',
          profileImage: user.profileImage,
          colors: ['#E9C2C0', '#F5F5F5']
        }));
        setProfiles(formattedProfiles);
        // 인덱스가 범위를 벗어나지 않게 조정
        if (currentIndex >= formattedProfiles.length) {
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfiles();
      fetchActiveNotice();
    }, [myInfo])
  );

  const fetchActiveNotice = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/notices/active`);
      if (response.data.success && response.data.data) {
        const activeNotice = response.data.data;
        const confirmedId = await AsyncStorage.getItem('confirmedNoticeId');
        
        if (confirmedId !== activeNotice._id) {
          setNotice(activeNotice);
          setShowNotice(true);
        }
      }
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    }
  };

  const handleConfirmNotice = async () => {
    if (notice) {
      await AsyncStorage.setItem('confirmedNoticeId', notice._id);
      setShowNotice(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  const nextProfile = useCallback((silent = false) => {
    translateX.value = 0;
    translateY.value = 0;
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!silent) {
        showAlert('알림', '주변에 더 이상 새로운 친구가 없어요!');
      }
      setCurrentIndex(0);
    }
  }, [currentIndex, profiles.length, showAlert]);

  const onLikePressed = useCallback(() => {
    if (!currentProfile) return;
    
    // 다음 프로필로 먼저 넘김 (알럿이 뜨는 동안 배경이 바뀌게)
    // 이때 'silent'를 true로 주어 '친구 없음' 알럿이 매칭 알럿을 가리지 않게 함
    nextProfile(true);

    showAlert('매칭 확인', `${currentProfile.name}님과 매칭하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '매칭하기', 
        onPress: () => router.push({ 
          pathname: '/chatRoom', 
          params: { name: currentProfile.name, studentId: currentProfile.studentId } 
        }) 
      }
    ]);
  }, [currentProfile, nextProfile, router, showAlert]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
          if (direction === 1) {
            runOnJS(onLikePressed)();
          } else {
            runOnJS(nextProfile)();
          }
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10]);
    return { transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }] };
  });

  const handleButtonAction = (type: 'pass' | 'like') => {
    if (!currentProfile) return;
    const direction = type === 'like' ? 1 : -1;
    translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
      if (type === 'like') {
        runOnJS(onLikePressed)();
      } else {
        runOnJS(nextProfile)();
      }
    });
  };

  if (loading) return <SafeAreaView style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#FF4D6D" /></SafeAreaView>;

  if (!currentProfile) return <SafeAreaView style={[styles.container, styles.center]}><Text style={styles.emptyText}>새로운 친구를 찾을 수 없어요. 😢</Text><TouchableOpacity style={styles.retryButton} onPress={fetchProfiles}><Text style={styles.retryText}>다시 불러오기</Text></TouchableOpacity></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      {/* ⭐️ 공지사항 팝업 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNotice}
        onRequestClose={() => setShowNotice(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="megaphone" size={24} color="#FF4D6D" />
              <Text style={styles.modalTitle}>{notice?.title}</Text>
            </View>
            <Text style={styles.modalBody}>{notice?.content}</Text>
            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmNotice}>
              <Text style={styles.modalConfirmText}>확인했습니다</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>세종설렘</Text>
      </View>

      <View style={styles.cardWrapper}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardContainer, animatedStyle]}>
            {currentProfile.profileImage ? (
              <Image source={{ uri: currentProfile.profileImage }} style={styles.cardImage} />
            ) : (
              <LinearGradient colors={currentProfile.colors} style={styles.cardImage}>
                <Ionicons name="person" size={100} color="#FFFFFF" />
              </LinearGradient>
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.infoContainer}
            >
              <View style={styles.nameRow}>
                <Text style={styles.name}>{currentProfile.name}</Text>
                <Text style={styles.age}>{currentProfile.age}</Text>
              </View>
              <Text style={styles.major}>{currentProfile.major}</Text>
              <View style={styles.tagsContainer}>
                {currentProfile.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                ))}
              </View>
              <Text style={styles.bio}>{currentProfile.bio}</Text>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={() => handleButtonAction('pass')}>
          <Ionicons name="close" size={36} color="#B0B0B0" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => handleButtonAction('like')}>
          <Ionicons name="heart" size={36} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
