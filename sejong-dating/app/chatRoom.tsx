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
import { styles } from '../styles/app/chatRoom.styles';

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
