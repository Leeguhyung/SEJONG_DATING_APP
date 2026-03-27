import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';
import { styles } from '../styles/components/GlobalAlert.styles';

export default function GlobalAlert() {
  const { alertState, hideAlert } = useAlert();

  if (!alertState.visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={alertState.visible}
      onRequestClose={hideAlert}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons 
              name={alertState.title.includes('오류') ? 'alert-circle' : 'information-circle'} 
              size={24} 
              color={alertState.title.includes('오류') ? '#FF4D6D' : '#333'} 
            />
            <Text style={styles.modalTitle}>{alertState.title}</Text>
          </View>
          <Text style={styles.modalBody}>{alertState.message}</Text>
          
          <View style={styles.modalButtonContainer}>
            {alertState.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalButton,
                  button.style === 'cancel' ? styles.modalCancelButton : styles.modalConfirmButton,
                  button.style === 'destructive' && styles.modalDestructiveButton,
                  alertState.buttons.length === 1 && { flex: 0, minWidth: 100 }
                ]}
                onPress={() => {
                  hideAlert();
                  if (button.onPress) button.onPress();
                }}
              >
                <Text style={[
                  styles.modalButtonText,
                  button.style === 'cancel' ? styles.modalCancelText : styles.modalConfirmText
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
