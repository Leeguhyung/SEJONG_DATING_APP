import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F5F6F8',
  },
  modalConfirmButton: {
    backgroundColor: '#FF4D6D',
  },
  modalDestructiveButton: {
    backgroundColor: '#FF4D6D',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalCancelText: {
    color: '#888',
  },
  modalConfirmText: {
    color: '#FFF',
  },
});
