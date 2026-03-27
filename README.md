# 🌸 세종설렘 (Sejong Dating)

세종대학교 학생들을 위한 특별한 데이팅 및 네트워킹 애플리케이션입니다. 학교 포털을 통한 확실한 학생 인증, 실시간 메시징, 프로필 관리, 그리고 커뮤니티 관리를 위한 포괄적인 관리자 대시보드를 제공합니다.

---

## 📁 프로젝트 구조 (Project Structure)

프로젝트는 크게 **프론트엔드(Expo)**와 **백엔드(Node.js)**로 나뉘어 있으며, 각 파트는 관심사 분리(SoC) 원칙에 따라 구조화되어 있습니다.

### 📱 Frontend (`sejong-dating/`)
React Native와 Expo Router를 사용한 현대적인 모바일 애플리케이션 구조입니다.

- **`app/`**: 파일 기반 라우팅을 사용하는 앱의 화면들 (Tabs, Chat, Admin 등)
- **`components/`**: 재사용 가능한 UI 컴포넌트 (Global Alert 등)
- **`styles/`**: 로직과 스타일을 분리하여 관리하는 스타일 정의 파일 (`.styles.ts`)
- **`context/`**: 전역 상태 관리 (User Auth, Alert 시스템 등)
- **`hooks/`**: 커스텀 훅 (Theme, Color Scheme 등)
- **`constants/`**: 앱 전역에서 사용하는 테마 및 상수 설정

### 💻 Backend (`sejong-dating-server/`)
Express.js와 MongoDB를 기반으로 한 확장 가능한 서버 구조입니다.

- **`index.js`**: 서버 진입점 및 실시간 소켓(Socket.io) 로직 관리
- **`routes/`**: API 엔드포인트를 기능별로 분리하여 관리
  - `auth.js`: 세종대 포털 인증 및 로그인
  - `user.js`: 사용자 프로필, 목록, 신고, 피드백 및 푸시 토큰
  - `admin.js`: 관리자 전용 통계, 유저 관리, 공지사항 관리
  - `chat.js`: 채팅방 관리 및 메시지 이력 조회
  - `public.js`: 비로그인 사용자용 공지사항 조회
- **`models/`**: Mongoose 데이터베이스 스키마 설계도
- **`utils/`**: 공통 유틸리티 (포털 스크래핑 인증 로직 등)
- **`scripts/`**: DB 관리 및 관리자 권한 부여를 위한 독립 실행 스크립트

---

## ✨ 주요 기능 (Key Features)

- **학생 인증 (Verification):** 세종대학교 포털 계정을 이용한 안전하고 확실한 재학생 인증 시스템.
- **실시간 채팅 (Real-time):** Socket.io를 활용한 즉각적인 메시징 및 푸시 알림 지원.
- **프로필 탐색 (Discovery):** 전공, 자기소개, 관심사 등을 바탕으로 다른 학생들의 프로필 탐색.
- **포괄적 관리자 모드 (Admin Mode):**
  - 서비스 통계 확인 (DAU, WAU, MAU)
  - 유저 권한 관리 및 불량 유저 추방
  - 공지사항 게시 및 관리
  - 유저 피드백 및 신고 내역 실시간 모니터링
- **푸시 알림 (Push Notifications):** Expo Push Service를 통한 실시간 메시지 수신 알림.

---

## 🚀 시작하기 (Getting Started)

### Backend 서버 설정
1. `cd sejong-dating-server`
2. `npm install`
3. `.env` 파일 설정 (PORT, MONGODB_URI 등)
4. `node index.js` 실행

### Frontend 앱 설정
1. `cd sejong-dating`
2. `npm install`
3. `npx expo start` 실행
4. Expo Go 앱을 통해 실제 기기나 에뮬레이터에서 확인

---

*본 프로젝트는 세종대학교 학생들의 더 나은 네트워킹을 위해 지속적으로 발전하고 있습니다.*
