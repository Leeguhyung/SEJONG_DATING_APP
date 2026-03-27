import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  profileSummary: { alignItems: 'center', padding: 30, backgroundColor: '#F5F6F8' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF4D6D', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  profileDetail: { fontSize: 14, color: '#888' },
  section: { marginTop: 20 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F5F6F8' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { fontSize: 16, color: '#333', marginLeft: 12 },
});
