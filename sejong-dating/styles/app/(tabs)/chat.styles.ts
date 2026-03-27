import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  chatItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F6F8', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E9C2C0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  chatInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  major: { fontSize: 12, color: '#999' },
  message: { fontSize: 14, color: '#666' },
  unreadMessageText: { color: '#333', fontWeight: 'bold' },
  emptyText: { fontSize: 16, color: '#999' },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4D6D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
