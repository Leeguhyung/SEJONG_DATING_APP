# 💌 세종설렘 (Sejong Dating)

세종대학교 학생들을 위한 프리미엄 데이팅 및 커뮤니티 애플리케이션입니다.  
학사정보시스템 연동을 통한 **철저한 본인 인증**과 **실시간 채팅**, **매칭 시스템**을 제공합니다.

---

## 🚀 기술 스택

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router (File-based Routing)
- **State Management**: Context API
- **Animation**: React Native Reanimated, Gesture Handler
- **Network**: Axios
- **Real-time**: Socket.io-client
- **Security**: Expo SecureStore (계정 암호화 저장), Local Authentication (Face ID / Touch ID)
- **Push Notification**: Expo Notifications

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Auth**: Cheerio & Axios (세종대 포털 스크래핑 인증)
- **Push**: Expo Server SDK

---

## ✨ 주요 기능

### 1. 신뢰할 수 있는 사용자 인증
- **학사정보시스템 연동**: 세종대학교 포털 로그인을 통한 실시간 스크래핑 인증으로 실제 재학생만 가입 가능합니다.
- **프로필 설정**: 나이, 전공, 관심사, 자기소개 및 사진 업로드를 통한 상세 프로필 구축.

### 2. 매칭 및 커뮤니티 (Swipe UI)
- **발견 탭**: 틴더 스타일의 카드 스와이프 UI를 통해 직관적으로 상대방을 확인하고 매칭을 시도합니다.
- **반투명 오버레이**: 디자인 최적화를 통해 상대방의 프로필 사진을 최대한 가리지 않으면서 정보를 노출합니다.

### 3. 실시간 소통
- **Socket.io 채팅**: 1:1 실시간 메시지 전송 및 읽음 확인 기능을 제공합니다.
- **푸시 알림**: 앱을 종료한 상태에서도 상대방의 메시지를 놓치지 않도록 실시간 푸시 알림을 전송합니다.

### 4. 사용자 편의 및 보안
- **자동 로그인**: `Face ID` 및 `Touch ID`를 지원하여 보안은 유지하면서 매번 로그인해야 하는 번거로움을 제거했습니다.
- **신고 시스템**: 대화 중 부적절한 메시지를 직접 선택하여 신고할 수 있는 정밀 신고 기능을 탑재했습니다.

### 5. 관리자 시스템
- **대시보드**: DAU, WAU, MAU 및 전체 가입자 통계를 시각화하여 제공합니다.
- **통합 관리**: 공지사항 생성, 사용자 권한 관리(관리자 부여/회원 추방), 신고 내역 확인 및 처리 기능을 포함합니다.

---

## 📂 폴더 구조

```text
/
├── sejong-dating/        # Frontend (React Native / Expo)
│   ├── app/              # Expo Router 페이지 구성
│   ├── components/       # 공용 UI 컴포넌트
│   ├── context/          # 전역 상태 관리 (User, Alert)
│   └── constants/        # 테마 및 환경 설정
└── sejong-dating-server/ # Backend (Node.js / Express)
    ├── models/           # Mongoose 스키마
    ├── utils/            # 인증 및 유틸리티 로직
    └── index.js          # 서버 메인 엔트리
```

---

## 🛠️ 설치 및 실행

### Backend 세팅
1. `sejong-dating-server` 폴더로 이동
2. `.env` 파일 생성 및 `MONGODB_URI` 설정
3. 패키지 설치 및 실행
```bash
npm install
node index.js
```

### Frontend 세팅
1. `sejong-dating` 폴더로 이동
2. `.env` 파일 생성 및 `EXPO_PUBLIC_SERVER_URL` 설정
3. 패키지 설치 및 실행
```bash
npm install
npx expo start
```

---

## 🔒 보안 사항 (Environment Variables)
본 프로젝트는 보안을 위해 다음과 같은 환경 변수를 사용하며, `.env` 파일은 깃허브에 포함되지 않습니다.

- `EXPO_PUBLIC_SERVER_URL`: 백엔드 API 서버 주소
- `MONGODB_URI`: MongoDB Atlas 연결 문자열
- `PORT`: 서버 포트 번호
