import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';
import { styles } from '../styles/app/editProfile.styles';

const INTEREST_LIST = ['러닝', '맛집탐방', '영화', '웹개발', '게임', '카페', '음악', '전시회'];
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function EditProfileScreen() {
  const router = useRouter();
  const { myInfo, setMyInfo } = useUser();
  const { showAlert } = useAlert();

  const [name, setName] = useState(myInfo?.name || '');
  const [major, setMajor] = useState(myInfo?.major || '');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!myInfo?.studentId) return;
      try {
        const response = await axios.get(`${SERVER_URL}/profile/${myInfo.studentId}`);
        if (response.data.success) {
          const data = response.data.data;
          setAge(data.age?.toString() || '');
          setBio(data.bio || '');
          setSelectedInterests(data.interests || []);
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
        }
      } catch (error) {
        console.error('프로필 불러오기 실패:', error);
        showAlert('오류', '기존 프로필 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, [myInfo]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // 정방형 크롭
      quality: 0.5, // 0~1 사이 (용량 최적화를 위해 0.5로 설정)
      base64: true, // Base64 문자열로 가져오기
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // 이미지 Base64 데이터를 상태에 저장
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Image);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 3) return;
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async () => {
    if (!age || !bio || selectedInterests.length === 0) {
      showAlert('알림', '모든 정보를 입력하고 관심사를 최소 1개 이상 선택해 주세요!');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${SERVER_URL}/profile`, {
        studentId: myInfo?.studentId,
        age: parseInt(age, 10),
        bio,
        interests: selectedInterests,
        profileImage,
      });

      if (response.data.success) {
        if (Platform.OS === 'web') {
          window.alert('프로필이 성공적으로 수정되었습니다.');
          router.back();
        } else {
          showAlert('완료', '프로필이 성공적으로 수정되었습니다.', [
            { text: '확인', onPress: () => router.back() }
          ]);
        }
      } else {
        showAlert('오류', '프로필 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Profile Save Error:', error);
      showAlert('오류', '서버와 통신하는 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = () => {
    showAlert(
      '회원 탈퇴',
      '정말로 세종설렘에서 탈퇴하시겠습니까?\n모든 프로필 정보가 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '탈퇴하기', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await axios.delete(`${SERVER_URL}/users/${myInfo?.studentId}`);
              if (response.data.success) {
                showAlert('완료', '탈퇴가 완료되었습니다.');
                setMyInfo(null);
                router.replace('/');
              }
            } catch (error) {
              console.error('Withdraw Error:', error);
              showAlert('오류', '탈퇴 처리 중 문제가 발생했습니다.');
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4D6D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 프로필 수정</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Ionicons name="camera" size={32} color="#A0A0A0" />
              )}
            </TouchableOpacity>
            <Text style={styles.photoText}>사진 변경</Text>
          </View>


          <View style={styles.formSection}>
            <Text style={styles.label}>이름 (수정 불가)</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={name} editable={false} />

            <Text style={styles.label}>나이</Text>
            <TextInput style={styles.input} placeholder="예: 22" keyboardType="numeric" value={age} onChangeText={setAge} />

            <Text style={styles.label}>학과 (수정 불가)</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={major} editable={false} />

            <Text style={styles.label}>자기소개</Text>
            <TextInput 
              style={[styles.input, styles.bioInput]} 
              placeholder="나를 간단하게 표현해 보세요 (최대 150자)" 
              multiline 
              maxLength={150}
              value={bio} 
              onChangeText={setBio} 
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>관심사 (최대 3개)</Text>
            <View style={styles.chipContainer}>
              {INTEREST_LIST.map((interest, index) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{interest}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={styles.withdrawSection}>
            <TouchableOpacity onPress={handleWithdraw} style={styles.withdrawButton}>
              <Text style={styles.withdrawButtonText}>회원 탈퇴</Text>
            </TouchableOpacity>
            <Text style={styles.withdrawInfoText}>
              회원 탈퇴는 세종설렘 서비스에만 적용되며, 학교 학사정보시스템 계정에는 어떠한 영향도 주지 않습니다.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.submitButtonText}>{saving ? '저장 중...' : '저장하기'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
