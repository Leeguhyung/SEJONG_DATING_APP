import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
