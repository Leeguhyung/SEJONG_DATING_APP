import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
