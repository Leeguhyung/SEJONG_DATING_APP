import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function ChatRoomScreen() {
  const router = useRouter();
  const { name: otherName, studentId: otherId } = useLocalSearchParams();
  const { myInfo } = useUser();
  const { showAlert } = useAlert();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Menu and Report state
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  const getRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };

  const roomId = myInfo?.studentId && otherId ? getRoomId(myInfo.studentId, otherId as string) : null;

  useEffect(() => {
    if (!roomId || !myInfo) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/chat/${roomId}`, {
          params: { myId: myInfo.studentId }
        });
        if (response.data.success) {
          const loadedMessages = response.data.data.map((msg: any) => ({
            id: msg._id,
            text: msg.text,
            sender: msg.senderId === myInfo.studentId ? 'me' : 'other',
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('메시지 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ 서버 연결 성공');
      socketRef.current.emit('join_room', roomId);
    });

    socketRef.current.on('receive_message', (msg: any) => {
      const formattedMessage = {
        id: msg._id || Date.now().toString(),
        text: msg.text,
        sender: msg.senderId === myInfo.studentId ? 'me' : 'other',
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => {
        if (prev.some(m => m.id === formattedMessage.id)) return prev;
        return [...prev, formattedMessage];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, myInfo]);

  const sendMessage = () => {
    if (inputText.trim() === '' || !socketRef.current || !roomId || !myInfo) return;

    const messageData = {
      roomId,
      senderId: myInfo.studentId,
      text: inputText,
    };

    socketRef.current.emit('send_message', messageData);
    setInputText('');
  };

  const handleLeaveChat = () => {
    setShowMenu(false);
    showAlert('대화 나가기', '정말로 대화를 나가시겠습니까?\n모든 대화 내역이 삭제되며 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { 
        text: '나가기', 
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${SERVER_URL}/chat/${roomId}/leave`, {
              params: { myId: myInfo?.studentId }
            });
            showAlert('알림', '대화방에서 나갔습니다.');
            router.back();
          } catch (err) {
            showAlert('오류', '대화방 나가기에 실패했습니다.');
          }
        }
      }
    ]);
  };

  const handleOpenReportModal = () => {
    setShowMenu(false);
    setShowReportModal(true);
    setSelectedMessageId(null);
  };

  const submitReport = async () => {
    if (!selectedMessageId) {
      showAlert('알림', '신고할 메시지를 선택해주세요.');
      return;
    }
    
    try {
      const reportedMessage = messages.find(m => m.id === selectedMessageId);
      await axios.post(`${SERVER_URL}/report`, {
        reporterId: myInfo?.studentId,
        reportedId: otherId,
        messageContent: reportedMessage?.text
      });
      setShowReportModal(false);
      showAlert('신고 완료', '신고가 접수되었습니다. 관리자 확인 후 조치됩니다.');
    } catch (err) {
      showAlert('오류', '신고 접수에 실패했습니다.');
    }
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherName || '상대방'}</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 헤더 메뉴 */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLeaveChat}>
              <Text style={styles.menuItemText}>대화 나가기</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleOpenReportModal}>
              <Text style={[styles.menuItemText, { color: '#FF4D6D' }]}>신고하기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* 신고 모달 */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>신고할 메시지 선택</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>상대방이 보낸 문제가 되는 메시지를 하나 선택해주세요.</Text>

            <FlatList
              data={messages.filter(m => m.sender === 'other')}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.reportMessageItem, 
                    selectedMessageId === item.id && styles.reportMessageItemSelected
                  ]}
                  onPress={() => setSelectedMessageId(item.id)}
                >
                  <Ionicons 
                    name={selectedMessageId === item.id ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedMessageId === item.id ? "#FF4D6D" : "#999"} 
                  />
                  <Text style={styles.reportMessageText}>{item.text}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>상대방이 보낸 메시지가 없습니다.</Text>
              }
            />

            <TouchableOpacity 
              style={[styles.submitReportButton, !selectedMessageId && { backgroundColor: '#FFC0CB' }]}
              disabled={!selectedMessageId}
              onPress={submitReport}
            >
              <Text style={styles.submitReportText}>신고하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender === 'me' ? styles.myMessageContainer : styles.otherMessageContainer
          ]}>
            <View style={[
              styles.bubble,
              item.sender === 'me' ? styles.myBubble : styles.otherBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.sender === 'me' ? styles.myMessageText : styles.otherMessageText
              ]}>
                {item.text}
              </Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.plusButton}>
            <Ionicons name="add" size={24} color="#999" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    zIndex: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333' },
  menuButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  menuOverlay: {
    position: 'absolute',
    top: 56, // 헤더 높이만큼 아래에 위치 (Safe area 밖이므로 약간 조정이 필요할수도)
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  menuBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 10,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 150,
    zIndex: 30,
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16 },
  menuDivider: { height: 1, backgroundColor: '#EEE' },
  menuItemText: { fontSize: 15, color: '#333', textAlign: 'center' },
  
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  reportMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    marginBottom: 10,
  },
  reportMessageItemSelected: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FF4D6D',
    borderWidth: 1,
  },
  reportMessageText: { fontSize: 15, color: '#333', marginLeft: 10, flex: 1 },
  submitReportButton: {
    backgroundColor: '#FF4D6D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitReportText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  messageList: { padding: 16, paddingBottom: 20 },
  messageContainer: { marginBottom: 16, maxWidth: '80%' },
  myMessageContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  myBubble: { backgroundColor: '#FF4D6D', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EEE' },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: '#FFF' },
  otherMessageText: { color: '#333' },
  timeText: { fontSize: 10, color: '#999', marginTop: 4, marginHorizontal: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  plusButton: { padding: 8 },
  input: {
    flex: 1,
    backgroundColor: '#F0F1F4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4D6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#FFC0CB' },
});
