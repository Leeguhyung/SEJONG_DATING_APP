import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useAlert } from '../context/AlertContext';

// 선택 가능한 관심사 목록
const INTEREST_LIST = ['러닝', '맛집탐방', '영화', '웹개발', '게임', '카페', '음악', '전시회'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert } = useAlert();
  
  // 인증 API로부터 전달받은 정보를 초기값으로 설정
  const [name, setName] = useState(params.name?.toString() || '');
  const [age, setAge] = useState('');
  const [major, setMajor] = useState(params.major?.toString() || '');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Image);
    }
  };

  // 관심사 선택/해제 토글 함수
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 3) return; // 최대 3개까지만 선택 가능
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // 완료 버튼 누를 때 실행 (홈으로 이동)
  const handleComplete = async () => {
    // 1. 필수 정보 확인
    if (!age || !bio || selectedInterests.length === 0) {
      showAlert('알림', '모든 정보를 입력하고 관심사를 최소 1개 이상 선택해 주세요!');
      return;
    }

    if (!profileImage) {
      showAlert('알림', '자신을 잘 나타내는 프로필 사진을 등록해 주세요!');
      return;
    }

    try {
      // 2. 서버로 프로필 정보 전송
      const response = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/profile`, {
        studentId: params.studentId || '',
        age: parseInt(age),
        bio,
        interests: selectedInterests,
        profileImage
      });

      if (response.data.success) {
        showAlert('환영합니다!', '프로필 설정이 완료되었습니다.');
        router.replace('/(tabs)/home');
      } else {
        showAlert('오류', '프로필 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Profile Save Error:', error);
      showAlert('오류', '서버와 통신하는 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필 설정</Text>
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
            <Text style={styles.photoText}>사진 등록</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>이름 (자동입력됨)</Text>
            <TextInput 
              style={[styles.input, params.name && styles.disabledInput]} 
              value={name} 
              onChangeText={setName}
              editable={!params.name}
            />

            <Text style={styles.label}>나이</Text>
            <TextInput style={styles.input} placeholder="예: 22" keyboardType="numeric" value={age} onChangeText={setAge} />

            <Text style={styles.label}>학과 (자동입력됨)</Text>
            <TextInput 
              style={[styles.input, params.major && styles.disabledInput]} 
              value={major} 
              onChangeText={setMajor}
              editable={!params.major}
            />

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
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleComplete}>
            <Text style={styles.submitButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContainer: { flex: 1, paddingHorizontal: 24 },

  photoSection: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F5F6F8', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  photoText: { fontSize: 14, color: '#888' },
  formSection: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F5F6F8', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#333' },
  disabledInput: { backgroundColor: '#EBECEF', color: '#777' },
  bioInput: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F5F6F8', borderWidth: 1, borderColor: '#E0E0E0' },
  chipSelected: { backgroundColor: '#FFF0F2', borderColor: '#FF4D6D' },
  chipText: { fontSize: 14, color: '#666' },
  chipTextSelected: { color: '#FF4D6D', fontWeight: 'bold' },
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitButton: { backgroundColor: '#FF4D6D', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
