import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 60, height: 60, backgroundColor: '#2C2C2C', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#333333', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20 },
  cardContainer: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  cardHeaderText: { fontSize: 14, fontWeight: '600', color: '#333333', marginLeft: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6F8', borderRadius: 12, paddingHorizontal: 16, height: 52, marginBottom: 12 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333333' },
  autoLoginCheckboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
  autoLoginCheckboxText: { marginLeft: 8, fontSize: 14, color: '#555' },
  loginButton: { backgroundColor: '#FF4D6D', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
